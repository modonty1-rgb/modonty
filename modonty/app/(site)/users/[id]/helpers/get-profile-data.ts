import { cacheTag, cacheLife } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

/** ما يُعرض من الملف الشخصي — نفس البايتات لكل زائر، فيُكيَّش.
 *
 *  كانت هذه القراءات الثلاث تُنتظر في جذر `UserPage` بلا تكييش ولا حدّ، ومعها `auth()` —
 *  وهي الآلية نفسها التي أسقطت صفحة المقال (١ سبتمبر ٢٠٢٦). الجلب هنا، والتوجيه
 *  و`notFound` يبقيان في الصفحة: `permanentRedirect` يرمي إشارة تنقّل، ومكانها ليس
 *  داخل دالّة مكيّشة تُخزَّن نتيجتها.
 *
 *  والجزء الوحيد الذي يتغيّر بتغيّر الزائر — بريد صاحب الملف — خرج إلى `<OwnerEmail>`
 *  خلف حدّ `<Suspense>` خاصّ به. */
export async function getProfileData(id: string) {
  "use cache";
  cacheTag("users");
  cacheLife("hours");

  const articlesInclude = {
    articles: {
      where: { status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        datePublished: true,
        client: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { datePublished: "desc" },
      take: 20,
    },
  } as const;

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, image: true, createdAt: true },
  });

  // لا مستخدم بهذا المعرّف؟ جرّب أن يكون `id` سلَگ كاتب — الصفحة توجّه إلى بيته المعتمد.
  if (!user) {
    const authorBySlug = await db.author.findUnique({ where: { slug: id }, include: articlesInclude });
    return { user: null, author: authorBySlug, matchedBySlug: true as const };
  }

  // نموذج الكاتب لا يحمل `userId`، فالربط بالبريد — كما كان.
  const authorByEmail = await db.author.findFirst({
    where: { email: user.email || undefined },
    include: articlesInclude,
  });
  return { user, author: authorByEmail, matchedBySlug: false as const };
}
