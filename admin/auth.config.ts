import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

const AUTH_ERROR_CODES = {
  missingPassword: "NO_PASSWORD_SET",
} as const;

/** مهلةُ إعادة قراءة حالة الموظّف من القاعدة — دقيقةٌ واحدة. */
const STAFF_RECHECK_MS = 60_000;

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        console.log("[Auth] Attempting login for:", email);

        try {
          // The admin panel authenticates against `staff` only.
          const staffRow = await db.staff.findUnique({ where: { email } });
          const user = staffRow
            ? {
                id: staffRow.id,
                email: staffRow.email,
                name: staffRow.name,
                password: staffRow.password,
                role: staffRow.role as string,
                isActive: staffRow.isActive,
                // تُحمل من لحظة الدخول: التوكن هو مصدرُ حكم الـproxy، وبدونها تُحجب
                // التقاريرُ عن صاحبها دقيقةً كاملةً حتى أوّل تحديثٍ للحالة.
                canViewReports: staffRow.canViewReports,
              }
            : null;

          console.log("[Auth] User lookup result:", {
            found: !!user,
            userId: user?.id,
            hasPassword: !!user?.password,
            role: user?.role,
          });

          if (!user) {
            console.error("[Auth] Login failed: User not found");
            return null;
          }

          if (!user.password) {
            console.error("[Auth] Login failed: User has no password set");
            throw new Error(AUTH_ERROR_CODES.missingPassword);
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("[Auth] Password validation:", {
            isValid: isPasswordValid,
            passwordLength: (credentials.password as string).length,
          });

          if (!isPasswordValid) {
            console.error("[Auth] Login failed: Invalid password");
            return null;
          }

          // Employment gate: a staff member who has left (isActive === false) keeps
          // their record + history but can no longer sign in. Absent/null = active.
          if (user.isActive === false) {
            console.error("[Auth] Login rejected: account is inactive —", email);
            return null;
          }

          // The panel authenticates against `staff` only, so any successful login
          // is a real team member. Access is by employment status (above), not role —
          // roles (Admin/Editor/Creative/Social/Sales) classify the work, they don't
          // gate the door. Granular per-role permissions are a separate feature.

          console.log("[Auth] Login successful for:", email);
          // Only return minimal user data to avoid ERR_RESPONSE_HEADERS_TOO_BIG
          // Do NOT include image/avatar as they can be large data URLs
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === AUTH_ERROR_CODES.missingPassword
          ) {
            throw error;
          }

          console.error("[Auth] Database error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    /**
     * **حالةُ الموظّف تعيش في التوكن، وتُجدَّد بمهلة — لا استعلامَ على كلّ طلب.**
     *
     * خالد (١٩ سبتمبر ٢٠٢٦): «أبغى حلاًّ جذريّاً، ما أبغى مسكّنات».
     *
     * ── العطل الجذريّ ──
     * كان `proxy.ts` يقرأ `db.staff.findUnique` في **كلّ طلبٍ محميّ** — أي استعلامٌ لكلّ
     * نقرةٍ في الأدمن، من نسخةٍ سيرفرلس قد تكون باردة. وهذا أحدُ منابع استهلاك اتّصالات
     * أطلس التي انتهت بـ«Connections above 80%» و`ReplicaSetNoPrimary` في الإنتاج.
     *
     * ── الحلّ ──
     * الحالةُ (نشِط · الدور · صلاحيّةُ التقارير) تُحفظ في التوكن الموقَّع، ويُعاد قراءتُها
     * من القاعدة **مرّةً كلَّ دقيقة** لا أكثر. فالـproxy يقرأ من التوكن وحده: **صفرُ
     * استعلامٍ لكلّ طلب**، واستعلامٌ واحدٌ لكلّ موظّفٍ في الدقيقة على أسوأ تقدير.
     *
     * والنمطُ موثَّق: `jwt` «is called whenever a JSON Web Token is created or updated»
     * (authjs.dev · reference)، ودليلُ تدوير الرموز عندهم يخزّن وقتاً في التوكن ويُجدّد
     * عنده — وهو نفسُ ما يفعله `checkedAt` هنا.
     *
     * ── الثمن، مصرَّحاً به ──
     * إيقافُ موظّفٍ أو سحبُ صلاحيّته يسري خلال **دقيقة**، لا في اللحظة. وهو ثمنٌ مقبولٌ
     * لطاقمٍ داخليٍّ معروف، مقابل إسقاط استعلامٍ من كلّ طلب. ومَن أراد الأثرَ الفوريّ
     * يخفّض `STAFF_RECHECK_MS` — والقاعدةُ تُدفع الثمنَ عندها استعلاماتٍ أكثر.
     *
     * ── وعند فشل القراءة ──
     * تبقى القيمُ السابقة كما هي ويُعاد المحاولةُ في الطلب التالي. والقديمُ أنّ فشلاً
     * واحداً كان يطرد الموظّفَ إلى صفحة الدخول — أي أنّ تعثّرَ القاعدة كان يُسقط الأدمن.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role?: string }).role;
        token.isActive = (user as { isActive?: boolean }).isActive !== false;
        token.canViewReports = (user as { canViewReports?: boolean }).canViewReports === true;
        token.checkedAt = Date.now();
        return token;
      }

      const checkedAt = typeof token.checkedAt === "number" ? token.checkedAt : 0;
      if (!token.id || Date.now() - checkedAt < STAFF_RECHECK_MS) return token;

      try {
        const fresh = await db.staff.findUnique({
          where: { id: token.id as string },
          select: { isActive: true, role: true, canViewReports: true },
        });
        // الصفُّ المحذوف = حسابٌ لم يعد قائماً: يُوسم غيرَ نشط فيسقط عند الحارس.
        token.isActive = fresh ? fresh.isActive !== false : false;
        token.role = fresh?.role ?? token.role;
        token.canViewReports = fresh?.canViewReports === true;
        token.checkedAt = Date.now();
      } catch (error) {
        // تعثُّرُ القاعدة لا يطرد أحداً — تبقى القيمُ السابقة وتُعاد المحاولة لاحقاً.
        console.error("[Auth] تعذّر تحديثُ حالة الموظّف من القاعدة:", error);
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        if (token?.id) {
          session.user.id = token.id as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
        if (token?.role) {
          (session.user as { role?: string }).role = token.role as string;
        }
        // تُمرَّر للـproxy وللصفحات: هي مصدرُ الحكم بدل استعلامِ كلّ طلب.
        (session.user as { isActive?: boolean }).isActive = token.isActive !== false;
        (session.user as { canViewReports?: boolean }).canViewReports = token.canViewReports === true;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
