"use server";

/**
 * Full Integration Test — Uses REAL server actions
 *
 * Flow per entity:
 * 1. VALIDATE    — bad input should fail (Zod, business rules)
 * 2. CREATE      — create with valid data
 * 3. VERIFY      — read back, confirm data matches
 * 4. UPDATE      — modify fields
 * 5. VERIFY      — read back, confirm update applied
 * 6. CONSTRAINT  — try illegal delete (should fail if has children/articles)
 * 7. DELETE      — clean delete
 * 8. VERIFY      — confirm record gone
 * 9. RE-CREATE   — final data that stays in DB
 * 10. INTEGRITY  — verify relationships (parent-child, tags, etc.)
 *
 * Author: Single-author system (Modonty) — auto-created via getModontyAuthor()
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { createCategory } from "@/app/(dashboard)/categories/actions/categories-actions/create-category";
import { updateCategory } from "@/app/(dashboard)/categories/actions/categories-actions/update-category";
import { deleteCategory } from "@/app/(dashboard)/categories/actions/categories-actions/delete-category";
import { createTag } from "@/app/(dashboard)/tags/actions/tags-actions";
import { updateTag, deleteTag } from "@/app/(dashboard)/tags/actions/tags-actions";
import { createIndustry } from "@/app/(dashboard)/industries/actions/industries-actions/create-industry";
import { updateIndustry } from "@/app/(dashboard)/industries/actions/industries-actions/update-industry";
import { deleteIndustry } from "@/app/(dashboard)/industries/actions/industries-actions/delete-industry";
import { createClient } from "@/app/(dashboard)/clients/actions/clients-actions/create-client";
import { deleteClient } from "@/app/(dashboard)/clients/actions/clients-actions/delete-client";
import { createArticle } from "@/app/(dashboard)/articles/actions/articles-actions/mutations/create-article";
import { updateArticle } from "@/app/(dashboard)/articles/actions/articles-actions/mutations/update-article";
import { deleteArticle } from "@/app/(dashboard)/articles/actions/articles-actions/mutations/delete-article";
import { getModontyAuthor } from "@/app/(dashboard)/authors/actions/authors-actions/get-modonty-author";
import { createFAQ, updateFAQ, deleteFAQ } from "@/app/(dashboard)/modonty/faq/actions/faq-actions";
import { db } from "@/lib/db";

// ─── Types ───
export type TestResult = {
  action: string;
  phase: "validate" | "create" | "verify" | "update" | "constraint" | "delete" | "re-create" | "integrity";
  status: "pass" | "fail" | "skip";
  detail?: string;
};

export type SectionResult = {
  section: string;
  results: TestResult[];
  passed: number;
  failed: number;
};

export type SeedSection = "categories" | "tags" | "industries" | "clients" | "articles" | "faqs" | "interactions";

// ─── Helper: assert ───
function ok(condition: boolean, action: string, phase: TestResult["phase"], detail?: string): TestResult {
  return condition
    ? { action, phase, status: "pass" }
    : { action, phase, status: "fail", detail: detail || "Assertion failed" };
}

// ─── Helper: clean test slug prefix ───
async function cleanTestCategories() {
  const cats = await db.category.findMany({ where: { slug: { startsWith: "test-" } }, select: { id: true } });
  for (const c of cats) {
    await db.article.updateMany({ where: { categoryId: c.id }, data: { categoryId: null } });
    await db.category.updateMany({ where: { parentId: c.id }, data: { parentId: null } });
  }
  await db.category.deleteMany({ where: { slug: { startsWith: "test-" } } });
}

async function cleanTestTags() {
  const tags = await db.tag.findMany({ where: { slug: { startsWith: "test-" } }, select: { id: true } });
  for (const t of tags) await db.articleTag.deleteMany({ where: { tagId: t.id } });
  await db.tag.deleteMany({ where: { slug: { startsWith: "test-" } } });
}

async function cleanTestIndustries() {
  const inds = await db.industry.findMany({ where: { slug: { startsWith: "test-" } }, select: { id: true } });
  for (const i of inds) await db.client.updateMany({ where: { industryId: i.id }, data: { industryId: null } });
  await db.industry.deleteMany({ where: { slug: { startsWith: "test-" } } });
}

async function cleanTestClients() {
  const clients = await db.client.findMany({ where: { slug: { startsWith: "test-" } }, select: { id: true } });
  for (const c of clients) {
    const arts = await db.article.findMany({ where: { clientId: c.id }, select: { id: true } });
    for (const a of arts) {
      await db.comment.deleteMany({ where: { articleId: a.id, parentId: { not: null } } });
      await db.comment.deleteMany({ where: { articleId: a.id } });
      await db.articleTag.deleteMany({ where: { articleId: a.id } });
      await db.articleMedia.deleteMany({ where: { articleId: a.id } });
      await db.articleVersion.deleteMany({ where: { articleId: a.id } });
      await db.articleFAQ.deleteMany({ where: { articleId: a.id } });
      await db.relatedArticle.deleteMany({ where: { OR: [{ articleId: a.id }, { relatedId: a.id }] } });
      await db.articleLike.deleteMany({ where: { articleId: a.id } });
      await db.articleDislike.deleteMany({ where: { articleId: a.id } });
      await db.articleFavorite.deleteMany({ where: { articleId: a.id } });
      await db.articleView.deleteMany({ where: { articleId: a.id } });
    }
    await db.article.deleteMany({ where: { clientId: c.id } });
    await db.clientComment.deleteMany({ where: { clientId: c.id, parentId: { not: null } } });
    await db.clientComment.deleteMany({ where: { clientId: c.id } });
    await db.subscriber.deleteMany({ where: { clientId: c.id } });
    await db.clientLike.deleteMany({ where: { clientId: c.id } });
    await db.clientDislike.deleteMany({ where: { clientId: c.id } });
    await db.clientFavorite.deleteMany({ where: { clientId: c.id } });
    await db.clientView.deleteMany({ where: { clientId: c.id } });
    await db.clientCompetitor.deleteMany({ where: { clientId: c.id } });
    await db.clientKeyword.deleteMany({ where: { clientId: c.id } });
    await db.seoIntake.deleteMany({ where: { clientId: c.id } });
    // Null out logo/hero refs before deleting media to avoid relation constraint
    await db.client.updateMany({ where: { id: c.id }, data: { logoMediaId: null, heroImageMediaId: null } });
    await db.media.deleteMany({ where: { clientId: c.id } });
  }
  await db.client.deleteMany({ where: { slug: { startsWith: "test-" } } });
}

async function cleanTestArticles() {
  const arts = await db.article.findMany({ where: { slug: { startsWith: "test-" } }, select: { id: true } });
  for (const a of arts) {
    await db.articleTag.deleteMany({ where: { articleId: a.id } });
    await db.articleMedia.deleteMany({ where: { articleId: a.id } });
    await db.articleVersion.deleteMany({ where: { articleId: a.id } });
    await db.articleFAQ.deleteMany({ where: { articleId: a.id } });
    await db.relatedArticle.deleteMany({ where: { OR: [{ articleId: a.id }, { relatedId: a.id }] } });
    await db.comment.deleteMany({ where: { parentId: { not: null }, articleId: a.id } });
    await db.comment.deleteMany({ where: { articleId: a.id } });
    await db.articleLike.deleteMany({ where: { articleId: a.id } });
    await db.articleDislike.deleteMany({ where: { articleId: a.id } });
    await db.articleFavorite.deleteMany({ where: { articleId: a.id } });
    await db.articleView.deleteMany({ where: { articleId: a.id } });
  }
  await db.article.deleteMany({ where: { slug: { startsWith: "test-" } } });
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: CATEGORIES
// ═══════════════════════════════════════════════════════════════════

async function seedCategories(): Promise<SectionResult> {
  const R: TestResult[] = [];
  await cleanTestCategories();

  // ── VALIDATE: empty name should fail ──
  const v1 = await createCategory({ name: "", slug: "test-empty" });
  R.push(ok(!v1.success, "createCategory(empty name) → should fail", "validate", v1.success ? "Should have failed but succeeded" : undefined));

  // ── VALIDATE: duplicate slug should fail ──
  const dup1 = await createCategory({ name: "أول", slug: "test-dup-slug" });
  const dup2 = await createCategory({ name: "ثاني", slug: "test-dup-slug" });
  R.push(ok(!dup2.success, "createCategory(duplicate slug) → should fail", "validate", dup2.success ? "Should have failed but succeeded" : undefined));
  if (dup1.success && dup1.category) await db.category.delete({ where: { id: dup1.category.id } });
  if (dup2.success && dup2.category) await db.category.delete({ where: { id: dup2.category.id } });

  // ── CREATE: parent + child ──
  const parent = await createCategory({ name: "تسويق رقمي تست", slug: "test-parent-cat", description: "تصنيف أب", seoTitle: "تسويق رقمي", seoDescription: "وصف SEO للتسويق الرقمي." });
  R.push(ok(parent.success, "createCategory(parent)", "create", parent.error));

  const child = await createCategory({ name: "SEO تست", slug: "test-child-cat", description: "تصنيف ابن" });
  R.push(ok(child.success, "createCategory(child)", "create", child.error));

  // ── VERIFY: parent exists with correct data ──
  if (parent.success && parent.category) {
    const dbCat = await db.category.findUnique({ where: { id: parent.category.id } });
    R.push(ok(dbCat?.name === "تسويق رقمي تست", "verify parent name = 'تسويق رقمي تست'", "verify", `got: ${dbCat?.name}`));
    R.push(ok(dbCat?.slug === "test-parent-cat", "verify parent slug = 'test-parent-cat'", "verify", `got: ${dbCat?.slug}`));
    R.push(ok(dbCat?.seoTitle === "تسويق رقمي", "verify parent seoTitle saved", "verify", `got: ${dbCat?.seoTitle}`));
  }

  // ── UPDATE: change name + set parent-child ──
  if (parent.success && parent.category && child.success && child.category) {
    const u1 = await updateCategory(parent.category.id, { name: "تسويق رقمي محدث", slug: "test-parent-cat", description: "وصف محدث", seoTitle: "عنوان محدث" });
    R.push(ok(u1.success, "updateCategory(parent name → محدث)", "update", u1.error));

    const u2 = await updateCategory(child.category.id, { name: "SEO تست", slug: "test-child-cat", parentId: parent.category.id });
    R.push(ok(u2.success, "updateCategory(child → set parentId)", "update", u2.error));

    // ── VERIFY UPDATE ──
    const dbParent = await db.category.findUnique({ where: { id: parent.category.id } });
    R.push(ok(dbParent?.name === "تسويق رقمي محدث", "verify updated name = 'تسويق رقمي محدث'", "verify", `got: ${dbParent?.name}`));

    const dbChild = await db.category.findUnique({ where: { id: child.category.id } });
    R.push(ok(dbChild?.parentId === parent.category.id, "verify child.parentId = parent.id", "verify", `parentId: ${dbChild?.parentId}`));

    // ── CONSTRAINT: delete parent with child should fail ──
    const delParent = await deleteCategory(parent.category.id);
    R.push(ok(!delParent.success, "deleteCategory(parent with child) → should fail", "constraint", delParent.success ? "Should have failed" : undefined));

    // ── DELETE: child first, then parent ──
    const d1 = await deleteCategory(child.category.id);
    R.push(ok(d1.success, "deleteCategory(child)", "delete", d1.error));

    const d2 = await deleteCategory(parent.category.id);
    R.push(ok(d2.success, "deleteCategory(parent after child removed)", "delete", d2.error));

    // ── VERIFY DELETE ──
    const gone = await db.category.findUnique({ where: { id: parent.category.id } });
    R.push(ok(gone === null, "verify parent deleted from DB", "verify", gone ? "Still exists!" : undefined));
  }

  // ── RE-CREATE: final data ──
  const FINALS = [
    { name: "التسويق الرقمي", slug: "digital-marketing", seoTitle: "التسويق الرقمي — استراتيجيات SEO", seoDescription: "أحدث استراتيجيات التسويق الرقمي لزيادة الزيارات والمبيعات." },
    { name: "التجارة الإلكترونية", slug: "ecommerce-tips", seoTitle: "نصائح التجارة الإلكترونية", seoDescription: "تعلم بناء وإدارة متجر إلكتروني ناجح." },
    { name: "التقنية والذكاء الاصطناعي", slug: "tech-ai-blog", seoTitle: "التقنية والذكاء الاصطناعي", seoDescription: "أحدث أخبار التقنية والذكاء الاصطناعي بالعربي." },
    { name: "SEO تحسين محركات البحث", slug: "seo-arabic", seoTitle: "SEO بالعربي", seoDescription: "دليلك الشامل لتحسين محركات البحث." },
  ];

  for (const f of FINALS) {
    const existing = await db.category.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (existing) {
      await db.article.updateMany({ where: { categoryId: existing.id }, data: { categoryId: null } });
      await db.category.updateMany({ where: { parentId: existing.id }, data: { parentId: null } });
      await db.category.delete({ where: { id: existing.id } });
    }
    const r = await createCategory(f);
    R.push(ok(r.success, `re-create("${f.name}")`, "re-create", r.error));
  }

  // ── INTEGRITY: set parent-child and verify ──
  const dmCat = await db.category.findUnique({ where: { slug: "digital-marketing" }, select: { id: true } });
  const seoCat = await db.category.findUnique({ where: { slug: "seo-arabic" }, select: { id: true } });
  if (dmCat && seoCat) {
    await updateCategory(seoCat.id, { name: "SEO تحسين محركات البحث", slug: "seo-arabic", parentId: dmCat.id });
    const check = await db.category.findUnique({ where: { slug: "seo-arabic" }, select: { parentId: true } });
    R.push(ok(check?.parentId === dmCat.id, "integrity: seo-arabic.parentId → digital-marketing", "integrity", `parentId: ${check?.parentId}`));
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Categories", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: TAGS
// ═══════════════════════════════════════════════════════════════════

async function seedTags(): Promise<SectionResult> {
  const R: TestResult[] = [];
  await cleanTestTags();

  // ── VALIDATE ──
  const v1 = await createTag({ name: "", slug: "test-empty-tag" });
  R.push(ok(!v1.success, "createTag(empty name) → should fail", "validate", v1.success ? "Should have failed" : undefined));

  // ── CREATE ──
  const t1 = await createTag({ name: "تاج تست", slug: "test-tag-1", description: "وصف تجريبي", seoTitle: "تاج تست", seoDescription: "وصف SEO تجريبي." });
  R.push(ok(t1.success, "createTag('تاج تست')", "create", t1.error));

  // ── VERIFY ──
  if (t1.success && t1.tag) {
    const dbTag = await db.tag.findUnique({ where: { id: t1.tag.id } });
    R.push(ok(dbTag?.name === "تاج تست", "verify tag name", "verify", `got: ${dbTag?.name}`));
    R.push(ok(dbTag?.seoTitle === "تاج تست", "verify tag seoTitle", "verify", `got: ${dbTag?.seoTitle}`));
  }

  // ── UPDATE ──
  if (t1.success && t1.tag) {
    const u1 = await updateTag(t1.tag.id, { name: "تاج محدث", slug: "test-tag-1", description: "تم التحديث" });
    R.push(ok(u1.success, "updateTag(name → 'تاج محدث')", "update", u1.error));

    const dbTag = await db.tag.findUnique({ where: { id: t1.tag.id } });
    R.push(ok(dbTag?.name === "تاج محدث", "verify updated name", "verify", `got: ${dbTag?.name}`));
    R.push(ok(dbTag?.description === "تم التحديث", "verify updated description", "verify", `got: ${dbTag?.description}`));
  }

  // ── DELETE ──
  if (t1.success && t1.tag) {
    const d1 = await deleteTag(t1.tag.id);
    R.push(ok(d1.success, "deleteTag('test-tag-1')", "delete", d1.error));
    const gone = await db.tag.findUnique({ where: { id: t1.tag.id } });
    R.push(ok(gone === null, "verify tag deleted from DB", "verify", gone ? "Still exists" : undefined));
  }

  // ── RE-CREATE final ──
  const FINALS = [
    { name: "SEO", slug: "seo", seoTitle: "SEO — تحسين محركات البحث", seoDescription: "كل ما يتعلق بتحسين محركات البحث." },
    { name: "ذكاء اصطناعي", slug: "ai", seoTitle: "الذكاء الاصطناعي", seoDescription: "كل ما يتعلق بالذكاء الاصطناعي." },
    { name: "تسويق رقمي", slug: "digital-marketing-tag", seoTitle: "تسويق رقمي", seoDescription: "أحدث استراتيجيات التسويق الرقمي." },
    { name: "تجارة إلكترونية", slug: "ecom-tag", seoTitle: "تجارة إلكترونية", seoDescription: "حلول ونصائح للمتاجر الإلكترونية." },
    { name: "رؤية 2030", slug: "vision-2030", seoTitle: "رؤية 2030", seoDescription: "مشاريع وفرص رؤية السعودية 2030." },
  ];
  for (const f of FINALS) {
    const existing = await db.tag.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (existing) { await db.articleTag.deleteMany({ where: { tagId: existing.id } }); await db.tag.delete({ where: { id: existing.id } }); }
    const r = await createTag(f);
    R.push(ok(r.success, `re-create("${f.name}")`, "re-create", r.error));
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Tags", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: INDUSTRIES
// ═══════════════════════════════════════════════════════════════════

async function seedIndustries(): Promise<SectionResult> {
  const R: TestResult[] = [];
  await cleanTestIndustries();

  // ── VALIDATE ──
  const v1 = await createIndustry({ name: "", slug: "test-empty-ind" });
  R.push(ok(!v1.success, "createIndustry(empty name) → should fail", "validate", v1.success ? "Should have failed" : undefined));

  // ── CREATE ──
  const i1 = await createIndustry({ name: "صناعة تست", slug: "test-industry-1", description: "صناعة تجريبية", seoTitle: "صناعة تست", seoDescription: "وصف SEO صناعة تجريبية." });
  R.push(ok(i1.success, "createIndustry('صناعة تست')", "create", i1.error));

  // ── VERIFY ──
  if (i1.success && i1.industry) {
    const dbInd = await db.industry.findUnique({ where: { id: i1.industry.id } });
    R.push(ok(dbInd?.name === "صناعة تست", "verify industry name", "verify", `got: ${dbInd?.name}`));
  }

  // ── UPDATE ──
  if (i1.success && i1.industry) {
    const u1 = await updateIndustry(i1.industry.id, { name: "صناعة محدثة", slug: "test-industry-1" });
    R.push(ok(u1.success, "updateIndustry(name → 'صناعة محدثة')", "update", u1.error));
    const dbInd = await db.industry.findUnique({ where: { id: i1.industry.id } });
    R.push(ok(dbInd?.name === "صناعة محدثة", "verify updated name", "verify", `got: ${dbInd?.name}`));
  }

  // ── CONSTRAINT: create client linked to industry, try delete ──
  if (i1.success && i1.industry) {
    // Create temp media for linking
    const tempLogo = await db.media.create({
      data: { filename: "temp-logo.jpg", mimeType: "image/jpeg", fileSize: 1000, url: "https://example.com/temp.jpg", clientId: null, type: "LOGO" }
    });
    const tempHero = await db.media.create({
      data: { filename: "temp-hero.jpg", mimeType: "image/jpeg", fileSize: 1000, url: "https://example.com/temp.jpg", clientId: null, type: "GENERAL" }
    });

    const tempClient = await db.client.create({
      data: {
        name: "temp",
        slug: "test-temp-constraint",
        email: "temp@test.com",
        subscriptionTier: "BASIC",
        industryId: i1.industry.id,
        logoMediaId: tempLogo.id,
        heroImageMediaId: tempHero.id,
      }
    });
    const delR = await deleteIndustry(i1.industry.id);
    R.push(ok(!delR.success, "deleteIndustry(has client) → should fail", "constraint", delR.success ? "Should have failed" : undefined));
    // cleanup temp client
    await db.client.delete({ where: { id: tempClient.id } });

    // ── DELETE ──
    const d1 = await deleteIndustry(i1.industry.id);
    R.push(ok(d1.success, "deleteIndustry(after client removed)", "delete", d1.error));
    const gone = await db.industry.findUnique({ where: { id: i1.industry.id } });
    R.push(ok(gone === null, "verify industry deleted", "verify", gone ? "Still exists" : undefined));
  }

  // ── RE-CREATE final ──
  const FINALS = [
    { name: "التجارة الإلكترونية", slug: "ecommerce", seoTitle: "التجارة الإلكترونية", seoDescription: "كل ما يخص التجارة الإلكترونية في السوق العربي." },
    { name: "الرعاية الصحية", slug: "healthcare", seoTitle: "الرعاية الصحية", seoDescription: "العيادات والمستشفيات — محتوى طبي موثوق." },
    { name: "التعليم والتدريب", slug: "education-training", seoTitle: "التعليم والتدريب", seoDescription: "مراكز التدريب ومنصات التعلم الإلكتروني." },
    { name: "التقنية والذكاء الاصطناعي", slug: "tech-ai", seoTitle: "التقنية والذكاء الاصطناعي", seoDescription: "أحدث التقنيات وتأثيرها على الأعمال." },
  ];
  for (const f of FINALS) {
    const existing = await db.industry.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (existing) { await db.client.updateMany({ where: { industryId: existing.id }, data: { industryId: null } }); await db.industry.delete({ where: { id: existing.id } }); }
    const r = await createIndustry(f);
    R.push(ok(r.success, `re-create("${f.name}")`, "re-create", r.error));
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Industries", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: CLIENTS
// ═══════════════════════════════════════════════════════════════════

async function seedClients(): Promise<SectionResult> {
  const R: TestResult[] = [];
  await cleanTestClients();

  const industry = await db.industry.findFirst({ select: { id: true } });

  // ── VALIDATE: missing required fields ──
  const v1 = await createClient({ name: "", slug: "test-empty-client", email: "x@x.com", subscriptionTier: "BASIC" as const });
  R.push(ok(!v1.success, "createClient(empty name) → should fail", "validate", v1.success ? "Should have failed" : undefined));

  // ── CREATE ──
  const c1 = await createClient({
    name: "عميل تست نوفا", slug: "test-client-nova", email: "test-nova@example.com", phone: "+966500000001",
    description: "عميل تجريبي لاختبار كل الفانكشنز", industryId: industry?.id || null,
    subscriptionTier: "PRO" as const, subscriptionStatus: "ACTIVE" as const, paymentStatus: "PAID" as const,
    seoTitle: "عميل تست نوفا", seoDescription: "وصف SEO عميل تجريبي.", addressCity: "الرياض", addressCountry: "SA",
    keywords: ["تست", "إلكترونيات"],
  });
  R.push(ok(c1.success, "createClient('عميل تست نوفا')", "create", c1.error));

  // ── VERIFY ──
  if (c1.success && c1.client) {
    const dbClient = await db.client.findUnique({ where: { id: c1.client.id } });
    R.push(ok(dbClient?.name === "عميل تست نوفا", "verify client name", "verify", `got: ${dbClient?.name}`));
    R.push(ok(dbClient?.email === "test-nova@example.com", "verify client email", "verify", `got: ${dbClient?.email}`));
    R.push(ok(dbClient?.subscriptionTier === "PRO", "verify subscriptionTier = PRO", "verify", `got: ${dbClient?.subscriptionTier}`));
    R.push(ok(dbClient?.addressCity === "الرياض", "verify addressCity = الرياض", "verify", `got: ${dbClient?.addressCity}`));
    if (industry) R.push(ok(dbClient?.industryId === industry.id, "verify industryId linked", "verify", `got: ${dbClient?.industryId}`));
  }

  // ── CONSTRAINT: delete client with article should fail ──
  if (c1.success && c1.client) {
    const author = await getModontyAuthor();
    if (author) {
      const tempArt = await db.article.create({ data: { title: "temp", slug: "test-temp-art", content: "x", clientId: c1.client.id, authorId: author.id } });
      const delR = await deleteClient(c1.client.id);
      R.push(ok(!delR.success, "deleteClient(has article) → should fail", "constraint", delR.success ? "Should have failed" : undefined));
      await db.article.delete({ where: { id: tempArt.id } });
    }

    // ── DELETE ──
    const d1 = await deleteClient(c1.client.id);
    R.push(ok(d1.success, "deleteClient(after article removed)", "delete", d1.error));
    const gone = await db.client.findUnique({ where: { id: c1.client.id } });
    R.push(ok(gone === null, "verify client deleted", "verify", gone ? "Still exists" : undefined));
  }

  // ── RE-CREATE final ──
  const industryMap: Record<string, string> = {};
  const allInd = await db.industry.findMany({ select: { id: true, slug: true } });
  for (const i of allInd) industryMap[i.slug] = i.id;

  const FINALS = [
    { name: "متجر نوفا للإلكترونيات", slug: "nova-electronics", email: "info@nova-electronics.sa", industryId: industryMap["ecommerce"] || null, subscriptionTier: "PRO" as const, subscriptionStatus: "ACTIVE" as const, paymentStatus: "PAID" as const, seoTitle: "متجر نوفا", seoDescription: "أحدث الأجهزة الإلكترونية.", addressCity: "الرياض", addressCountry: "SA" },
    { name: "عيادات بلسم الطبية", slug: "balsam-medical", email: "info@balsam-medical.sa", industryId: industryMap["healthcare"] || null, subscriptionTier: "STANDARD" as const, subscriptionStatus: "ACTIVE" as const, paymentStatus: "PAID" as const, seoTitle: "عيادات بلسم", seoDescription: "رعاية صحية متميزة.", addressCity: "الرياض", addressCountry: "SA" },
  ];

  for (const f of FINALS) {
    const existing = await db.client.findUnique({ where: { slug: f.slug }, select: { id: true } });
    if (existing) {
      // Delete article relations first (comments replies → comments → tags → rest → articles)
      const arts = await db.article.findMany({ where: { clientId: existing.id }, select: { id: true } });
      const artIds = arts.map(a => a.id);
      if (artIds.length > 0) {
        await db.comment.deleteMany({ where: { articleId: { in: artIds }, parentId: { not: null } } });
        await db.comment.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleTag.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleMedia.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleVersion.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleFAQ.deleteMany({ where: { articleId: { in: artIds } } });
        await db.relatedArticle.deleteMany({ where: { OR: [{ articleId: { in: artIds } }, { relatedId: { in: artIds } }] } });
        await db.articleLike.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleDislike.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleFavorite.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleView.deleteMany({ where: { articleId: { in: artIds } } });
        await db.share.deleteMany({ where: { articleId: { in: artIds } } });
        await db.conversion.deleteMany({ where: { articleId: { in: artIds } } });
        await db.cTAClick.deleteMany({ where: { articleId: { in: artIds } } });
        await db.engagementDuration.deleteMany({ where: { articleId: { in: artIds } } });
        await db.articleLinkClick.deleteMany({ where: { articleId: { in: artIds } } });
        await db.analytics.deleteMany({ where: { articleId: { in: artIds } } });
        await db.campaignTracking.deleteMany({ where: { articleId: { in: artIds } } });
        await db.article.deleteMany({ where: { clientId: existing.id } });
      }
      // Delete client relations
      await db.clientComment.deleteMany({ where: { clientId: existing.id, parentId: { not: null } } });
      await db.clientComment.deleteMany({ where: { clientId: existing.id } });
      await db.subscriber.deleteMany({ where: { clientId: existing.id } });
      await db.clientLike.deleteMany({ where: { clientId: existing.id } });
      await db.clientDislike.deleteMany({ where: { clientId: existing.id } });
      await db.clientFavorite.deleteMany({ where: { clientId: existing.id } });
      await db.clientView.deleteMany({ where: { clientId: existing.id } });
      await db.clientCompetitor.deleteMany({ where: { clientId: existing.id } });
      await db.clientKeyword.deleteMany({ where: { clientId: existing.id } });
      await db.seoIntake.deleteMany({ where: { clientId: existing.id } });
      await db.share.deleteMany({ where: { clientId: existing.id } });
      await db.conversion.deleteMany({ where: { clientId: existing.id } });
      await db.cTAClick.deleteMany({ where: { clientId: existing.id } });
      await db.campaignTracking.deleteMany({ where: { clientId: existing.id } });
      await db.leadScoring.deleteMany({ where: { clientId: existing.id } });
      await db.engagementDuration.deleteMany({ where: { clientId: existing.id } });
      await db.contactMessage.deleteMany({ where: { clientId: existing.id } });
      await db.notification.deleteMany({ where: { clientId: existing.id } });
      // Null out logo/hero refs before deleting media to avoid relation constraint
      await db.client.update({ where: { id: existing.id }, data: { logoMediaId: null, heroImageMediaId: null } });
      await db.media.deleteMany({ where: { clientId: existing.id } });
      await db.client.delete({ where: { id: existing.id } });
    }
    const r = await createClient(f);
    R.push(ok(r.success, `re-create("${f.name}")`, "re-create", r.error));
  }

  // ── INTEGRITY: verify industry linked ──
  const novaClient = await db.client.findUnique({ where: { slug: "nova-electronics" }, select: { industryId: true } });
  if (industryMap["ecommerce"]) {
    R.push(ok(novaClient?.industryId === industryMap["ecommerce"], "integrity: nova → ecommerce industry", "integrity", `industryId: ${novaClient?.industryId}`));
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Clients", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: ARTICLES
// ═══════════════════════════════════════════════════════════════════

async function seedArticles(): Promise<SectionResult> {
  const R: TestResult[] = [];
  await cleanTestArticles();

  const author = await getModontyAuthor();
  if (!author) return { section: "Articles", results: [{ action: "getModontyAuthor()", phase: "create", status: "fail", detail: "Author not found" }], passed: 0, failed: 1 };
  R.push(ok(true, "getModontyAuthor() → exists", "verify"));

  const clients = await db.client.findMany({ select: { id: true } });
  const categories = await db.category.findMany({ select: { id: true } });
  const allTags = await db.tag.findMany({ select: { id: true } });

  if (!clients.length) return { section: "Articles", results: [{ action: "findClient", phase: "create", status: "fail", detail: "Run Clients first" }], passed: 0, failed: 1 };

  const client = clients[0];
  const category = categories[0];
  const tags = allTags.slice(0, 2);

  // ── VALIDATE: empty title ──
  const v1 = await createArticle({ title: "", slug: "test-empty", content: "x", clientId: client.id, authorId: author.id, status: "DRAFT" as const });
  R.push(ok(!v1.success, "createArticle(empty title) → should fail", "validate", v1.success ? "Should have failed" : undefined));

  // ── CREATE with tags + category ──
  const a1 = await createArticle({
    title: "مقال تست كامل", slug: "test-full-article",
    content: "<h2>عنوان</h2><p>محتوى تجريبي لاختبار إنشاء المقالات مع كل العلاقات.</p>",
    excerpt: "مقال تجريبي شامل",
    clientId: client.id, authorId: author.id, categoryId: category?.id,
    status: "PUBLISHED" as const, featured: true,
    seoTitle: "مقال تست كامل", seoDescription: "وصف SEO تجريبي للمقال.",
    tags: tags.map(t => t.id),
    wordCount: 100, readingTimeMinutes: 1,
    datePublished: new Date(),
    faqs: [{ question: "سؤال تجريبي؟", answer: "إجابة تجريبية." }],
  });
  R.push(ok(a1.success, "createArticle(with tags + FAQs)", "create", a1.error));

  // ── VERIFY: article + relationships ──
  if (a1.success && a1.article) {
    const dbArt = await db.article.findUnique({ where: { id: a1.article.id }, include: { tags: true, faqs: true } });
    R.push(ok(dbArt?.title === "مقال تست كامل", "verify article title", "verify", `got: ${dbArt?.title}`));
    R.push(ok(dbArt?.status === "WRITING", "verify status = WRITING (forced by design)", "verify", `got: ${dbArt?.status}`));
    R.push(ok(dbArt?.featured === true, "verify featured = true", "verify", `got: ${dbArt?.featured}`));
    R.push(ok(dbArt?.authorId === author.id, "verify authorId = Modonty", "verify"));
    R.push(ok(dbArt?.categoryId === category?.id, "verify categoryId linked", "verify"));
    R.push(ok((dbArt?.tags?.length || 0) === tags.length, `verify ${tags.length} tags linked`, "integrity", `got: ${dbArt?.tags?.length}`));
    R.push(ok((dbArt?.faqs?.length || 0) >= 1, "verify FAQ created with article", "integrity", `got: ${dbArt?.faqs?.length}`));

    // ── DELETE ──
    const d1 = await deleteArticle(a1.article.id);
    R.push(ok(d1.success, "deleteArticle('test-full-article')", "delete", d1.error));

    // ── VERIFY DELETE: article + tags + FAQs gone ──
    const gone = await db.article.findUnique({ where: { id: a1.article.id } });
    R.push(ok(gone === null, "verify article deleted", "verify"));
    const orphanTags = await db.articleTag.findMany({ where: { articleId: a1.article.id } });
    R.push(ok(orphanTags.length === 0, "verify articleTag links deleted", "verify", `remaining: ${orphanTags.length}`));
  }

  // ── RE-CREATE final articles — 25 articles spread across all clients/categories ──
  type FinalArticle = {
    title: string; slug: string; content: string; excerpt: string;
    status: "PUBLISHED" | "DRAFT"; featured?: boolean;
    seoTitle: string; seoDescription: string;
    wordCount?: number; readingTimeMinutes?: number;
    faqs?: { question: string; answer: string }[];
  };

  const FINAL_ARTICLES: FinalArticle[] = [
    {
      title: "دليل SEO المتاجر الإلكترونية 2025",
      slug: "seo-guide-ecommerce-2025", status: "PUBLISHED", featured: true, wordCount: 650, readingTimeMinutes: 4,
      content: "<h2>لماذا SEO ضروري لمتجرك؟</h2><p>في عالم التجارة الإلكترونية، يعتمد <strong>87% من المتسوقين</strong> على محركات البحث. المتاجر التي تستثمر في SEO تحقق تحويلاً بنسبة 14.6% مقارنة بـ 1.7% للإعلانات المدفوعة.</p><h2>بحث الكلمات المفتاحية</h2><p>ركز على كلمات نية الشراء: \"شراء\"، \"سعر\"، \"أفضل\". ابدأ بـ Long-tail keywords ذات منافسة منخفضة ومعدل تحويل عالٍ.</p><h2>تحسين صفحات المنتجات</h2><p>عنوان فريد يتضمن الكلمة المفتاحية، وصف لا يقل عن 300 كلمة، وصور عالية الجودة مع نص بديل واضح.</p>",
      excerpt: "دليل شامل لتحسين SEO المتاجر الإلكترونية: من بحث الكلمات المفتاحية إلى تحسين صفحات المنتجات وسرعة الموقع.",
      seoTitle: "دليل SEO المتاجر الإلكترونية 2025 — استراتيجيات مجربة",
      seoDescription: "دليل شامل لتحسين SEO المتاجر الإلكترونية: بحث الكلمات المفتاحية، تحسين صفحات المنتجات، وسرعة الموقع. استراتيجيات مجربة لزيادة المبيعات.",
      faqs: [{ question: "كم يستغرق SEO المتجر؟", answer: "تظهر النتائج خلال 3-6 أشهر من العمل المستمر." }],
    },
    {
      title: "الذكاء الاصطناعي في الرعاية الصحية السعودية",
      slug: "ai-healthcare-saudi-2025", status: "PUBLISHED", wordCount: 600, readingTimeMinutes: 4,
      content: "<h2>ثورة AI في المستشفيات السعودية</h2><p>تستثمر المملكة مليارات الريالات في التقنيات الصحية الذكية. أنظمة AI تُشخّص سرطان الثدي بدقة <strong>94.5%</strong>.</p><h2>التطبيقات الحالية</h2><p>مستشفيات الرياض وجدة تستخدم AI لقراءة صور الأشعة، مما يقلل وقت التشخيص من أيام إلى دقائق.</p><h2>المستقبل</h2><p>بحلول 2030، ستكون 50% من التشخيصات الروتينية مدعومة بالذكاء الاصطناعي.</p>",
      excerpt: "كيف يُحدث الذكاء الاصطناعي ثورة في الرعاية الصحية السعودية: التشخيص بالأشعة، التطبيب عن بُعد، ونتائج مذهلة.",
      seoTitle: "الذكاء الاصطناعي في الرعاية الصحية السعودية 2025",
      seoDescription: "كيف يُحدث AI ثورة في المستشفيات السعودية: تشخيص دقيق، تطبيب عن بُعد، وقراءة الأشعة بالذكاء الاصطناعي. رؤية 2030.",
      faqs: [{ question: "هل AI يستبدل الأطباء؟", answer: "لا، هو أداة تعزز قدرات الأطباء. القرار النهائي يبقى للطبيب." }],
    },
    {
      title: "مستقبل التعليم الرقمي في السعودية",
      slug: "digital-education-future-saudi", status: "PUBLISHED", wordCount: 550, readingTimeMinutes: 3,
      content: "<h2>الفرصة الذهبية</h2><p>سوق التعليم الإلكتروني في الشرق الأوسط يصل إلى <strong>1.2 مليار دولار</strong> بحلول 2026. منصة مدرستي خدمت 6 ملايين طالب.</p><h2>التقنيات المستخدمة</h2><p>الواقع الافتراضي يتيح للطلاب زيارة المواقع التاريخية والمختبرات افتراضياً. AI يخصص المحتوى حسب مستوى كل طالب.</p>",
      excerpt: "مستقبل التعليم الرقمي في السعودية: من مدرستي إلى الواقع الافتراضي والذكاء الاصطناعي. فرص واستثمارات ضمن رؤية 2030.",
      seoTitle: "مستقبل التعليم الرقمي في السعودية — رؤية 2030",
      seoDescription: "مستقبل التعليم الرقمي في السعودية: منصة مدرستي، الواقع الافتراضي، والذكاء الاصطناعي لتخصيص التعلم. سوق بقيمة 1.2 مليار دولار.",
    },
    {
      title: "كيف تبني استراتيجية محتوى ناجحة في 2025",
      slug: "content-strategy-guide-2025", status: "PUBLISHED", wordCount: 500, readingTimeMinutes: 3,
      content: "<h2>ما هي استراتيجية المحتوى؟</h2><p>خطة مدروسة لإنشاء ونشر المحتوى يجذب جمهورك المستهدف. <strong>70% من الشركات</strong> التي تمتلك استراتيجية محتوى موثقة تحقق نتائج أفضل.</p><h2>الخطوات الأساسية</h2><p>حدد جمهورك، واختر القنوات المناسبة، وأنشئ تقويماً للنشر. الاتساق هو المفتاح — نشر مقالة أسبوعياً أفضل من 10 مقالات شهرياً ثم التوقف.</p>",
      excerpt: "دليلك الكامل لبناء استراتيجية محتوى ناجحة: تحديد الجمهور، اختيار القنوات، وقياس النتائج. خطوات مجربة لنمو مستدام.",
      seoTitle: "كيف تبني استراتيجية محتوى ناجحة في 2025",
      seoDescription: "دليل بناء استراتيجية محتوى ناجحة: تحديد الجمهور، اختيار القنوات المناسبة، وقياس النتائج. خطوات مجربة لنمو مستدام عبر الإنترنت.",
    },
    {
      title: "أفضل أدوات SEO المجانية لعام 2025",
      slug: "best-free-seo-tools-2025", status: "PUBLISHED", wordCount: 480, readingTimeMinutes: 3,
      content: "<h2>أدوات SEO المجانية لا غنى عنها</h2><p>Google Search Console لمتابعة أداء موقعك في البحث. Google Analytics لفهم سلوك الزوار. Ahrefs Webmaster Tools لتحليل الروابط الخلفية.</p><h2>أدوات البحث عن الكلمات</h2><p>Google Keyword Planner للكلمات المفتاحية. Answer The Public لاستفسارات المستخدمين. Ubersuggest للاقتراحات المجانية.</p>",
      excerpt: "أفضل أدوات SEO المجانية في 2025: Google Search Console، Ahrefs، وأدوات بحث الكلمات. كل ما تحتاجه دون أن تدفع قرشاً.",
      seoTitle: "أفضل أدوات SEO المجانية 2025 — دليل شامل",
      seoDescription: "أفضل أدوات SEO المجانية في 2025: Google Search Console، Ahrefs Webmaster، وأدوات بحث الكلمات المفتاحية. ابدأ SEO بدون تكلفة.",
    },
    {
      title: "رؤية 2030 وفرص التجارة الإلكترونية",
      slug: "vision-2030-ecommerce-opportunities", status: "PUBLISHED", wordCount: 520, readingTimeMinutes: 3,
      content: "<h2>التجارة الإلكترونية ركيزة رؤية 2030</h2><p>تستهدف رؤية 2030 رفع مساهمة القطاع الخاص في الناتج المحلي إلى 65%. التجارة الإلكترونية في المملكة نمت <strong>25% سنوياً</strong>.</p><h2>الفرص المتاحة</h2><p>قطاعات الأزياء والإلكترونيات والغذاء تشهد طفرة. برنامج نطاقات يدعم التوطين في قطاعات واعدة جديدة.</p>",
      excerpt: "كيف تستفيد من رؤية 2030 في التجارة الإلكترونية: الفرص المتاحة، القطاعات الواعدة، وكيفية الاستعداد للمرحلة القادمة.",
      seoTitle: "رؤية 2030 وفرص التجارة الإلكترونية — دليل المستثمرين",
      seoDescription: "فرص التجارة الإلكترونية في ظل رؤية 2030: قطاعات الأزياء والإلكترونيات والغذاء. كيف تستعد للاستفادة من نمو 25% سنوياً.",
    },
    {
      title: "تسويق عيادتك الطبية عبر الإنترنت",
      slug: "medical-clinic-digital-marketing", status: "PUBLISHED", wordCount: 490, readingTimeMinutes: 3,
      content: "<h2>لماذا التسويق الرقمي ضروري للعيادات؟</h2><p><strong>72% من المرضى</strong> يبحثون عن الأطباء عبر الإنترنت قبل الحجز. عيادتك بحاجة إلى حضور رقمي قوي لاستقطاب مرضى جدد.</p><h2>استراتيجيات فعّالة</h2><p>Google My Business لظهور محلي، محتوى تعليمي يبني الثقة، وإدارة التقييمات لزيادة المصداقية.</p>",
      excerpt: "كيف تسوّق عيادتك الطبية رقمياً: Google My Business، المحتوى التعليمي، وإدارة التقييمات. دليل عملي للأطباء.",
      seoTitle: "تسويق عيادتك الطبية رقمياً — دليل الأطباء 2025",
      seoDescription: "كيف تسوّق عيادتك الطبية عبر الإنترنت: Google My Business، المحتوى التعليمي، وإدارة التقييمات. اجذب مرضى جدد رقمياً.",
    },
    {
      title: "كيف تختار منصة التجارة الإلكترونية المناسبة",
      slug: "choose-ecommerce-platform-2025", status: "PUBLISHED", wordCount: 510, readingTimeMinutes: 3,
      content: "<h2>المنصات الرائدة في السوق السعودي</h2><p>Shopify الأسهل للمبتدئين. Salla وZid خيارات محلية ممتازة تدعم العربية وطرق الدفع السعودية. WooCommerce للمتاجر المخصصة.</p><h2>معايير الاختيار</h2><p>تكلفة الاشتراك، بوابات الدفع المتاحة، سهولة إدارة المنتجات، وجودة دعم العملاء. الدفع عبر مدى وSTC Pay معيار لا غنى عنه.</p>",
      excerpt: "مقارنة شاملة بين منصات التجارة الإلكترونية: Shopify وSalla وZid وWooCommerce. اختر المنصة المناسبة لأعمالك في السعودية.",
      seoTitle: "أفضل منصات التجارة الإلكترونية في السعودية 2025",
      seoDescription: "مقارنة بين منصات التجارة الإلكترونية: Shopify وSalla وZid وWooCommerce. اختر الأنسب لمتجرك في السعودية بناءً على التكلفة والميزات.",
    },
    {
      title: "الصحة النفسية في بيئة العمل السعودية",
      slug: "mental-health-workplace-saudi", status: "PUBLISHED", wordCount: 470, readingTimeMinutes: 3,
      content: "<h2>أهمية الصحة النفسية في العمل</h2><p><strong>1 من كل 4 موظفين</strong> يعاني من ضغوط نفسية تؤثر على إنتاجيته. الشركات التي تهتم بصحة موظفيها تحقق إنتاجية أعلى بنسبة 20%.</p><h2>خطوات عملية</h2><p>أيام عمل مرنة، بيئة داعمة خالية من الحكم، وتوفير دعم نفسي. رؤية 2030 تدعم مبادرات الصحة النفسية.</p>",
      excerpt: "الصحة النفسية في بيئة العمل السعودية: أهميتها، تأثيرها على الإنتاجية، وخطوات عملية لبيئة عمل أكثر صحة ورفاهية.",
      seoTitle: "الصحة النفسية في بيئة العمل السعودية — دليل عملي",
      seoDescription: "الصحة النفسية في العمل: 1 من 4 موظفين يعاني من ضغوط. خطوات عملية لتحسين بيئة العمل وزيادة الإنتاجية في السعودية.",
    },
    {
      title: "تحسين تجربة المستخدم لزيادة المبيعات",
      slug: "ux-improve-sales-ecommerce", status: "PUBLISHED", wordCount: 500, readingTimeMinutes: 3,
      content: "<h2>UX وتأثيره على المبيعات</h2><p>كل ريال تستثمره في تحسين تجربة المستخدم يعود بـ <strong>100 ريال</strong>. تجربة شراء سلسة تقلل الهجر إلى 68% من الزوار.</p><h2>أولويات التحسين</h2><p>تبسيط عملية الدفع، تسريع تحميل الصفحات، وتحسين التصميم للجوال. 60% من المتسوقين السعوديين يتسوقون عبر الهاتف.</p>",
      excerpt: "كيف تحسن تجربة المستخدم لزيادة مبيعات متجرك: تبسيط الدفع، تسريع التحميل، وتحسين الجوال. استراتيجيات ROI مضمونة.",
      seoTitle: "تحسين UX لزيادة المبيعات — دليل المتاجر الإلكترونية",
      seoDescription: "تحسين تجربة المستخدم يزيد المبيعات: كل ريال في UX يعود بـ 100 ريال. تبسيط الدفع وتسريع التحميل للجوال في السعودية.",
    },
    {
      title: "برامج الولاء في المتاجر السعودية",
      slug: "loyalty-programs-saudi-ecommerce", status: "PUBLISHED", wordCount: 460, readingTimeMinutes: 3,
      content: "<h2>لماذا برامج الولاء مهمة؟</h2><p>اكتساب عميل جديد يكلف <strong>5 أضعاف</strong> الاحتفاظ بعميل حالي. برامج الولاء ترفع معدل الاحتفاظ بالعملاء وتزيد متوسط الإنفاق.</p><h2>نماذج ناجحة</h2><p>نقاط المكافآت، العضويات المدفوعة (مثل أمازون Prime)، والعروض الحصرية للعملاء المتكررين.</p>",
      excerpt: "برامج الولاء في التجارة الإلكترونية السعودية: لماذا تحتاجها، أفضل النماذج، وكيف تبني برنامجاً يحافظ على عملائك.",
      seoTitle: "برامج الولاء للمتاجر الإلكترونية السعودية — استراتيجيات 2025",
      seoDescription: "برامج الولاء: اكتساب عميل جديد يكلف 5 أضعاف الاحتفاظ بعميل. نماذج ناجحة لبناء ولاء العملاء في السوق السعودي.",
    },
    {
      title: "ChatGPT في الأعمال: دليل عملي للشركات السعودية",
      slug: "chatgpt-business-guide-saudi", status: "PUBLISHED", wordCount: 530, readingTimeMinutes: 3,
      content: "<h2>كيف تستخدم ChatGPT في عملك؟</h2><p>كتابة المحتوى التسويقي، الرد على استفسارات العملاء، تحليل البيانات، وكتابة الكود. الشركات التي تُدمج AI في عملياتها توفر <strong>40% من وقت الموظفين</strong>.</p><h2>تطبيقات عملية</h2><p>خدمة عملاء 24/7، إنشاء محتوى مواقع التواصل، تحليل مراجعات العملاء، وتوليد أفكار للمنتجات.</p>",
      excerpt: "دليل عملي لاستخدام ChatGPT في الشركات السعودية: من كتابة المحتوى إلى خدمة العملاء وتحليل البيانات. وفّر 40% من وقت فريقك.",
      seoTitle: "ChatGPT للأعمال السعودية — دليل عملي 2025",
      seoDescription: "كيف تستخدم ChatGPT في عملك: كتابة المحتوى، خدمة العملاء، وتحليل البيانات. الشركات التي تُدمج AI توفر 40% من وقت الموظفين.",
    },
    {
      title: "تسويق المحتوى للعيادات والمراكز الطبية",
      slug: "content-marketing-medical-centers", status: "PUBLISHED", wordCount: 490, readingTimeMinutes: 3,
      content: "<h2>المحتوى الطبي يبني الثقة</h2><p>المريض يبحث عن معلومات قبل زيارة الطبيب. العيادة التي تنشر محتوى مفيداً تكتسب ثقة المريض قبل أن يطأ عتبتها.</p><h2>أنواع المحتوى الأكثر فاعلية</h2><p>مقالات توعية صحية، أسئلة وأجوبة شائعة، فيديوهات توضيحية. Google يفضل المحتوى الطبي الموثوق (E-E-A-T).</p>",
      excerpt: "تسويق المحتوى للعيادات: كيف تبني ثقة المرضى عبر المقالات الصحية والفيديوهات؟ استراتيجية E-E-A-T لظهور أعلى في جوجل.",
      seoTitle: "تسويق المحتوى للعيادات الطبية — دليل SEO الصحي",
      seoDescription: "تسويق المحتوى للعيادات: مقالات توعية صحية وأسئلة وأجوبة لبناء ثقة المرضى. استراتيجية E-E-A-T للظهور في نتائج Google الطبية.",
    },
    {
      title: "التجارة الاجتماعية: البيع عبر سناب وإنستغرام",
      slug: "social-commerce-snap-instagram-saudi", status: "PUBLISHED", wordCount: 500, readingTimeMinutes: 3,
      content: "<h2>التجارة الاجتماعية في السعودية</h2><p>المملكة من أعلى دول العالم في استخدام سناب شات. <strong>60% من الشباب السعودي</strong> اشترى منتجاً شاهده على سوشيال ميديا.</p><h2>استراتيجيات ناجحة</h2><p>Instagram Shopping لربط المنتجات مباشرة، Snapchat Ads للوصول إلى الشباب، والتعاون مع المؤثرين المحليين.</p>",
      excerpt: "كيف تبيع عبر سناب وإنستغرام في السعودية: Instagram Shopping وSnapchat Ads والمؤثرين. 60% من الشباب يشتري من السوشيال ميديا.",
      seoTitle: "التجارة الاجتماعية في السعودية — سناب وإنستغرام 2025",
      seoDescription: "التجارة الاجتماعية: 60% من الشباب السعودي يشتري عبر السوشيال ميديا. استراتيجيات Instagram Shopping وSnapchat Ads للبيع المباشر.",
    },
    {
      title: "كيف تحسّن نتائج جوجل لعيادتك المحلية",
      slug: "local-seo-medical-clinic", status: "PUBLISHED", wordCount: 480, readingTimeMinutes: 3,
      content: "<h2>SEO المحلي للعيادات</h2><p>عندما يبحث مريض عن \"طبيب قريب مني\"، هل تظهر عيادتك؟ Google My Business هو مفتاح الظهور في نتائج الخرائط والبحث المحلي.</p><h2>خطوات التحسين</h2><p>أكمل ملفك في Google My Business، اطلب من المرضى الراضين كتابة تقييمات، وأنشئ محتوى يستهدف مدينتك وتخصصك.</p>",
      excerpt: "SEO المحلي للعيادات الطبية: كيف تظهر في نتائج جوجل عندما يبحث المرضى عن \"طبيب قريب\"؟ Google My Business وتقييمات المرضى.",
      seoTitle: "SEO المحلي للعيادات الطبية — دليل Google My Business",
      seoDescription: "كيف تحسّن ظهور عيادتك في Google المحلي: إعداد Google My Business وجمع تقييمات المرضى واستهداف الكلمات المحلية.",
    },
    {
      title: "كتابة وصف المنتج الذي يبيع",
      slug: "product-description-that-sells", status: "PUBLISHED", wordCount: 450, readingTimeMinutes: 3,
      content: "<h2>سر وصف المنتج الجيد</h2><p>الوصف الجيد يُجيب على سؤال واحد: <strong>كيف سيُحسّن هذا المنتج حياتك؟</strong> لا تصف المواصفات فقط، صِف التجربة والفائدة.</p><h2>الصيغة الفعّالة</h2><p>ابدأ بالفائدة الرئيسية، اذكر المميزات التقنية بصرياً (نقاط)، وأضف دليلاً اجتماعياً (تقييمات). اختم بـ call-to-action واضح.</p>",
      excerpt: "كيف تكتب وصف منتج يحوّل الزائر إلى مشتري: الصيغة الفعّالة للتجارة الإلكترونية. ركز على الفائدة لا المواصفات.",
      seoTitle: "كيف تكتب وصف المنتج الذي يبيع — دليل التجارة الإلكترونية",
      seoDescription: "كيف تكتب وصف منتج يحوّل الزوار إلى مشترين: ركز على الفائدة، استخدم نقاط المميزات، وأضف دليلاً اجتماعياً. صيغة مجربة.",
    },
    {
      title: "البث المباشر والتجارة الإلكترونية في السعودية",
      slug: "live-commerce-saudi-market", status: "PUBLISHED", wordCount: 470, readingTimeMinutes: 3,
      content: "<h2>ظاهرة Live Commerce</h2><p>الصين حققت 300 مليار دولار من البيع عبر البث المباشر. السعودية تسير في نفس المسار مع نمو استخدام سناب وتيك توك.</p><h2>كيف تبدأ؟</h2><p>اختر منصة مناسبة (سناب لايف، إنستغرام لايف، TikTok Shop)، قدّم عروضاً حصرية للمشاهدين، وأنشئ إحساساً بالندرة.</p>",
      excerpt: "Live Commerce في السعودية: كيف تبيع عبر البث المباشر على سناب وإنستغرام وتيك توك؟ استراتيجيات مجربة من تجربة الصين.",
      seoTitle: "Live Commerce في السعودية — البيع عبر البث المباشر",
      seoDescription: "Live Commerce في السعودية: البيع عبر سناب لايف وإنستغرام لايف وTikTok Shop. استراتيجيات مجربة لزيادة المبيعات الفورية.",
    },
    {
      title: "أمن المعلومات للشركات السعودية الصغيرة",
      slug: "cybersecurity-small-business-saudi", status: "PUBLISHED", wordCount: 490, readingTimeMinutes: 3,
      content: "<h2>لماذا الشركات الصغيرة هدف سهل؟</h2><p><strong>43% من الهجمات الإلكترونية</strong> تستهدف الشركات الصغيرة. مع رقمنة الأعمال، أصبح الأمن ضرورة وليس رفاهية.</p><h2>الحماية الأساسية</h2><p>كلمات مرور قوية ومختلفة، نسخ احتياطي يومي، تحديثات منتظمة، وتوعية الموظفين. تكلفة الوقاية أقل بكثير من تكلفة الاختراق.</p>",
      excerpt: "أمن المعلومات للشركات الصغيرة: 43% من الهجمات تستهدفك. خطوات الحماية الأساسية وكيف تقلل مخاطر الاختراق بتكلفة منخفضة.",
      seoTitle: "أمن المعلومات للشركات الصغيرة في السعودية 2025",
      seoDescription: "حماية شركتك الصغيرة من الهجمات الإلكترونية: 43% من الاختراقات تستهدف الشركات الصغيرة. خطوات الحماية الأساسية المنخفضة التكلفة.",
    },
    {
      title: "كيف تربح من الكتابة الحرة في السعودية",
      slug: "freelance-writing-income-saudi", status: "PUBLISHED", wordCount: 460, readingTimeMinutes: 3,
      content: "<h2>سوق الكتابة الحرة العربي</h2><p>الطلب على محتوى عربي احترافي في ارتفاع مستمر. كاتب محتوى متمرس يكسب من <strong>5,000 إلى 25,000 ريال</strong> شهرياً.</p><h2>كيف تبدأ؟</h2><p>بناء محفظة أعمال، منصات العمل الحر (Fiverr وMostaqel)، والتخصص في مجال واحد (طبي، تقني، SEO). التخصص يضاعف سعرك.</p>",
      excerpt: "كيف تربح من الكتابة الحرة في السعودية: من 5,000 إلى 25,000 ريال شهرياً. بناء المحفظة واختيار المجال والبدء في منصات العمل الحر.",
      seoTitle: "كيف تربح من الكتابة الحرة في السعودية — دليل 2025",
      seoDescription: "الربح من الكتابة الحرة في السعودية: كاتب متمرس يكسب 5,000-25,000 ريال شهرياً. بناء محفظة أعمال والتخصص والبدء في Fiverr وMostaqel.",
    },
    {
      title: "التسويق عبر المؤثرين في السعودية: دليل الشركات",
      slug: "influencer-marketing-saudi-brands", status: "PUBLISHED", wordCount: 510, readingTimeMinutes: 3,
      content: "<h2>المؤثرون في السوق السعودي</h2><p>المملكة من أعلى الأسواق في التفاعل مع المؤثرين. <strong>Micro-influencers</strong> (10K-100K متابع) يحققون تفاعلاً أعلى بنسبة 60% من المؤثرين الكبار.</p><h2>كيف تختار المؤثر المناسب؟</h2><p>معدل التفاعل أهم من عدد المتابعين. راجع جودة التعليقات وانتبه للمتابعين الوهميين. الاتساق مع قيم علامتك التجارية معيار لا تتنازل عنه.</p>",
      excerpt: "دليل التسويق عبر المؤثرين في السعودية: اختيار المؤثر الصحيح، قياس النتائج، وتجنب الأخطاء الشائعة. Micro-influencers أكثر فاعلية.",
      seoTitle: "التسويق عبر المؤثرين في السعودية — دليل الشركات 2025",
      seoDescription: "دليل التسويق بالمؤثرين السعوديين: Micro-influencers يحققون 60% تفاعلاً أعلى. كيف تختار المؤثر وتقيس النتائج وتتجنب المتابعين الوهميين.",
    },
    {
      title: "الفاتورة الإلكترونية ZATCA للمتاجر السعودية",
      slug: "zatca-e-invoicing-guide-saudi", status: "PUBLISHED", wordCount: 480, readingTimeMinutes: 3,
      content: "<h2>الفوترة الإلكترونية إلزامية</h2><p>هيئة الزكاة والضريبة طبّقت الفوترة الإلكترونية تدريجياً. المتاجر والشركات مُلزمة بإصدار فواتير إلكترونية متوافقة مع متطلبات ZATCA.</p><h2>المرحلة الثانية: الربط</h2><p>نظام نقطة البيع يجب أن يكون مرتبطاً بمنظومة FATOORA. الخيارات متعددة: ERP متكامل، أو حلول SaaS متوافقة بتكلفة منخفضة.</p>",
      excerpt: "دليل الفوترة الإلكترونية ZATCA للمتاجر: المتطلبات، المراحل، والأنظمة المتوافقة. تجنب الغرامات وتأكد من الامتثال الكامل.",
      seoTitle: "الفوترة الإلكترونية ZATCA للمتاجر السعودية — دليل الامتثال",
      seoDescription: "الفوترة الإلكترونية ZATCA: المتطلبات والمراحل والأنظمة المتوافقة للمتاجر السعودية. تجنب الغرامات وحقق الامتثال الكامل.",
    },
    {
      title: "شهادة الجودة ISO وتأثيرها على ظهورك في جوجل",
      slug: "iso-certification-seo-impact", status: "PUBLISHED", wordCount: 450, readingTimeMinutes: 3,
      content: "<h2>هل شهادة ISO تحسّن SEO؟</h2><p>مباشرةً؟ لا. لكن بصورة غير مباشرة؟ نعم. الشركات الحاصلة على ISO تحظى بتغطية إعلامية أكبر وروابط خلفية أقوى، مما يحسّن ثقة جوجل.</p><h2>الفائدة الحقيقية</h2><p>E-E-A-T (الخبرة والثقة) هو معيار جوجل للمحتوى المتخصص. شهادات الجودة تُعزز مصداقيتك وتُقنع جوجل بأنك مصدر موثوق.</p>",
      excerpt: "هل شهادات الجودة ISO تحسّن ظهورك في جوجل؟ الإجابة التفصيلية عن تأثير الاعتمادية والمصداقية على SEO وE-E-A-T.",
      seoTitle: "شهادة ISO وتأثيرها على SEO وE-E-A-T — دليل 2025",
      seoDescription: "هل شهادة ISO تحسّن ظهورك في جوجل؟ تأثير الاعتمادية على E-E-A-T والروابط الخلفية. دليل لفهم العلاقة بين الجودة والسيو.",
    },
    {
      title: "كيف تختار كلماتك المفتاحية بذكاء",
      slug: "smart-keyword-research-arabic", status: "PUBLISHED", wordCount: 490, readingTimeMinutes: 3,
      content: "<h2>الكلمة المفتاحية الصحيحة = نصف النجاح</h2><p>أخطاء الاختيار: استهداف كلمات عامة جداً (منافسة مستحيلة) أو نادرة جداً (لا أحد يبحث). الحل: Long-tail keywords ذات نية واضحة.</p><h2>المعادلة الذهبية</h2><p>حجم البحث × نية الشراء ÷ صعوبة الكلمة. كلمة بـ 500 بحث شهري ونية شراء عالية أفضل من كلمة بـ 50,000 بحث بدون نية.</p>",
      excerpt: "كيف تختار الكلمات المفتاحية بذكاء: معادلة حجم البحث ونية الشراء والصعوبة. Long-tail keywords للنتائج السريعة.",
      seoTitle: "اختيار الكلمات المفتاحية بذكاء — دليل SEO العربي",
      seoDescription: "اختيار الكلمات المفتاحية: Long-tail keywords ونية الشراء وصعوبة المنافسة. المعادلة الذهبية للكلمة المفتاحية المثالية بالعربي.",
    },
    {
      title: "نصائح لتسريع موقعك وتحسين Core Web Vitals",
      slug: "speed-optimize-core-web-vitals", status: "PUBLISHED", wordCount: 500, readingTimeMinutes: 3,
      content: "<h2>Core Web Vitals وعلاقتها بالترتيب</h2><p>جوجل يستخدم LCP وFID وCLS كمعاملات ترتيب مباشرة. مواقع تحت 2.5 ثانية LCP تحظى بأولوية في النتائج.</p><h2>الحلول العملية</h2><p>ضغط الصور وتحويلها إلى WebP، تفعيل CDN، إزالة CSS وJS غير المستخدم، وتفعيل الـ caching. Next.js يحل 80% من هذه المشكلات تلقائياً.</p>",
      excerpt: "تسريع موقعك لتحسين ترتيب جوجل: Core Web Vitals شرح مبسط وحلول عملية. LCP وFID وCLS وكيفية تحسينها.",
      seoTitle: "تسريع الموقع وتحسين Core Web Vitals — دليل 2025",
      seoDescription: "تحسين Core Web Vitals: LCP أقل من 2.5 ثانية يُحسّن ترتيبك في جوجل. حلول عملية: WebP وCDN وإزالة الكود غير المستخدم.",
    },
    {
      title: "بناء روابط خلفية عربية عالية الجودة",
      slug: "arabic-backlinks-building-guide", status: "DRAFT", wordCount: 520, readingTimeMinutes: 3,
      content: "<h2>لماذا الروابط الخلفية مهمة؟</h2><p>الروابط الخلفية من مواقع موثوقة تُخبر جوجل أن موقعك مصدر قيم. رابط واحد من موقع DA 70 يعادل 100 رابط من مواقع ضعيفة.</p><h2>استراتيجيات بناء الروابط</h2><p>التدوين المشترك، المحتوى القابل للنشر (إحصاءات وأبحاث)، والعلاقات مع المدونين العرب. تجنب شراء الروابط — مخاطرة لا تستحق.</p>",
      excerpt: "كيف تبني روابط خلفية عربية عالية الجودة: التدوين المشترك والمحتوى القابل للنشر والعلاقات مع المدونين. استراتيجيات آمنة ومجربة.",
      seoTitle: "بناء روابط خلفية عربية عالية الجودة — دليل Link Building",
      seoDescription: "بناء backlinks عربية: التدوين المشترك والمحتوى القيّم والعلاقات مع المدونين. استراتيجيات آمنة لبناء سلطة موقعك.",
    },
    {
      title: "التحليلات الرقمية لقياس نجاح متجرك",
      slug: "digital-analytics-ecommerce-kpis", status: "DRAFT", wordCount: 510, readingTimeMinutes: 3,
      content: "<h2>المؤشرات التي تهم فعلاً</h2><p>معدل التحويل، متوسط قيمة الطلب، تكلفة اكتساب العميل، ومعدل الاحتفاظ. هذه الأرقام الأربعة تحكي قصة نجاح أو فشل متجرك.</p><h2>أدوات القياس</h2><p>Google Analytics 4 للسلوك الشامل، Google Search Console للأداء في البحث، وأدوات الحرارة مثل Hotjar لفهم سلوك المستخدم البصري.</p>",
      excerpt: "تحليلات التجارة الإلكترونية: 4 مؤشرات تحكي قصة نجاح متجرك. GA4 وSearch Console وHotjar لقرارات مبنية على بيانات حقيقية.",
      seoTitle: "تحليلات التجارة الإلكترونية — KPIs ضرورية لكل متجر",
      seoDescription: "قياس نجاح متجرك: معدل التحويل ومتوسط الطلب وتكلفة الاكتساب. أدوات GA4 وSearch Console وHotjar للقرارات المبنية على بيانات.",
    },
    {
      title: "صحة القلب والوقاية من الأمراض المزمنة",
      slug: "heart-health-prevention-guide", status: "DRAFT", wordCount: 480, readingTimeMinutes: 3,
      content: "<h2>أمراض القلب في السعودية</h2><p>أمراض القلب والأوعية الدموية هي <strong>السبب الأول للوفاة</strong> في المملكة. لكن 80% من حالاتها قابلة للوقاية بتعديل نمط الحياة.</p><h2>خطوات الوقاية</h2><p>نشاط بدني 150 دقيقة أسبوعياً، تقليل الصوديوم، الإقلاع عن التدخين، وفحوصات منتظمة. الكشف المبكر ينقذ الأرواح.</p>",
      excerpt: "الوقاية من أمراض القلب: 80% من الحالات قابلة للوقاية. خطوات عملية لتحسين صحة قلبك وتجنب الأمراض المزمنة.",
      seoTitle: "الوقاية من أمراض القلب — دليل الصحة العملي",
      seoDescription: "أمراض القلب السبب الأول للوفاة في السعودية. 80% قابلة للوقاية: نشاط بدني وتقليل الصوديوم وفحوصات منتظمة. خطوات عملية.",
    },
  ];

  for (let i = 0; i < FINAL_ARTICLES.length; i++) {
    const a = FINAL_ARTICLES[i];
    const clientId = clients[i % clients.length].id;
    const categoryId = categories.length ? categories[i % categories.length].id : undefined;
    const articleTagIds = allTags.filter((_, ti) => (ti + i) % 3 !== 2).slice(0, 3).map(t => t.id);

    const existing = await db.article.findFirst({ where: { slug: a.slug }, select: { id: true } });
    if (existing) {
      await db.comment.deleteMany({ where: { articleId: existing.id, parentId: { not: null } } });
      await db.comment.deleteMany({ where: { articleId: existing.id } });
      await db.articleTag.deleteMany({ where: { articleId: existing.id } });
      await db.articleMedia.deleteMany({ where: { articleId: existing.id } });
      await db.articleVersion.deleteMany({ where: { articleId: existing.id } });
      await db.articleFAQ.deleteMany({ where: { articleId: existing.id } });
      await db.relatedArticle.deleteMany({ where: { OR: [{ articleId: existing.id }, { relatedId: existing.id }] } });
      await db.articleLike.deleteMany({ where: { articleId: existing.id } });
      await db.articleDislike.deleteMany({ where: { articleId: existing.id } });
      await db.articleFavorite.deleteMany({ where: { articleId: existing.id } });
      await db.articleView.deleteMany({ where: { articleId: existing.id } });
      await db.share.deleteMany({ where: { articleId: existing.id } });
      await db.conversion.deleteMany({ where: { articleId: existing.id } });
      await db.cTAClick.deleteMany({ where: { articleId: existing.id } });
      await db.engagementDuration.deleteMany({ where: { articleId: existing.id } });
      await db.articleLinkClick.deleteMany({ where: { articleId: existing.id } });
      await db.analytics.deleteMany({ where: { articleId: existing.id } });
      await db.campaignTracking.deleteMany({ where: { articleId: existing.id } });
      await deleteArticle(existing.id);
    }
    const { faqs: articleFaqs, ...articleData } = a;
    const faqItems = (articleFaqs || []).map((f, fi) => ({ ...f, position: fi }));
    const r = await createArticle({ ...articleData, clientId, authorId: author.id, categoryId, tags: articleTagIds, faqs: faqItems, datePublished: a.status === "PUBLISHED" ? new Date() : undefined });
    R.push(ok(r.success, `re-create("${a.title.slice(0, 35)}...")`, "re-create", r.error));

    if (r.success && r.article && a.status === "PUBLISHED") {
      const pub = await updateArticle(r.article.id, { ...articleData, clientId, authorId: author.id, categoryId, tags: articleTagIds, faqs: faqItems, datePublished: new Date() });
      R.push(ok(pub.success, `publish("${a.title.slice(0, 35)}...") → PUBLISHED`, "update", pub.error));
    }
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Articles", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: FAQs
// ═══════════════════════════════════════════════════════════════════

async function seedFaqs(): Promise<SectionResult> {
  const R: TestResult[] = [];

  // ── VALIDATE ──
  const v1 = await createFAQ({ question: "", answer: "إجابة" });
  R.push(ok(!v1.success, "createFAQ(empty question) → should fail", "validate", v1.success ? "Should have failed" : undefined));

  // ── CREATE ──
  const f1 = await createFAQ({ question: "سؤال تست؟", answer: "إجابة تست.", isActive: true, inLanguage: "ar" });
  R.push(ok(f1.success, "createFAQ('سؤال تست')", "create", f1.error));

  // ── VERIFY ──
  if (f1.success && f1.faq) {
    const dbFaq = await db.fAQ.findUnique({ where: { id: f1.faq.id } });
    R.push(ok(dbFaq?.question === "سؤال تست؟", "verify question", "verify", `got: ${dbFaq?.question}`));
    R.push(ok(dbFaq?.isActive === true, "verify isActive = true", "verify"));
  }

  // ── UPDATE ──
  if (f1.success && f1.faq) {
    const u1 = await updateFAQ(f1.faq.id, { question: "سؤال محدث؟", answer: "إجابة محدثة." });
    R.push(ok(u1.success, "updateFAQ(question → 'سؤال محدث؟')", "update", u1.error));
    const dbFaq = await db.fAQ.findUnique({ where: { id: f1.faq.id } });
    R.push(ok(dbFaq?.question === "سؤال محدث؟", "verify updated question", "verify", `got: ${dbFaq?.question}`));
  }

  // ── DELETE ──
  if (f1.success && f1.faq) {
    const d1 = await deleteFAQ(f1.faq.id);
    R.push(ok(d1.success, "deleteFAQ", "delete", d1.error));
    const gone = await db.fAQ.findUnique({ where: { id: f1.faq.id } });
    R.push(ok(gone === null, "verify FAQ deleted", "verify"));
  }

  // ── RE-CREATE final ──
  const FINALS = [
    { question: "ما هي خدمات مدونتي؟", answer: "منصة سعودية متخصصة في SEO وصناعة المحتوى العربي.", isActive: true, inLanguage: "ar" },
    { question: "كم تكلفة خدمات SEO؟", answer: "تبدأ من 500 ريال شهرياً (4 مقالات) وتصل إلى 2500 ريال (30 مقالة).", isActive: true, inLanguage: "ar" },
    { question: "متى تظهر نتائج SEO؟", answer: "خلال 3-6 أشهر. SEO استثمار طويل الأمد يتراكم مع الوقت.", isActive: true, inLanguage: "ar" },
  ];
  for (const f of FINALS) {
    const r = await createFAQ(f);
    R.push(ok(r.success, `re-create("${f.question.slice(0, 25)}...")`, "re-create", r.error));
  }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "FAQs", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// SECTION: INTERACTIONS (direct DB — no server actions)
// ═══════════════════════════════════════════════════════════════════

async function seedInteractions(): Promise<SectionResult> {
  const R: TestResult[] = [];

  const article = await db.article.findFirst({ select: { id: true } });
  const client = await db.client.findFirst({ select: { id: true } });
  const user = await db.user.findFirst({ select: { id: true } });

  if (!article || !client) {
    return { section: "Interactions", results: [{ action: "prerequisites (run Articles + Clients first)", phase: "validate", status: "skip", detail: "No articles or clients found" }], passed: 0, failed: 0 };
  }

  // Clean
  await db.commentLike.deleteMany({}); await db.commentDislike.deleteMany({});
  await db.comment.deleteMany({ where: { parentId: { not: null } } }); await db.comment.deleteMany({});
  await db.articleLike.deleteMany({}); await db.articleView.deleteMany({});
  await db.clientView.deleteMany({}); await db.subscriber.deleteMany({});
  await db.contactMessage.deleteMany({});

  const S = () => `sess_${crypto.randomUUID().slice(0, 8)}`;

  // Comments with reply
  try {
    const c1 = await db.comment.create({ data: { content: "مقال ممتاز!", articleId: article.id, authorId: user?.id, status: "APPROVED" } });
    const c2 = await db.comment.create({ data: { content: "شكراً على المعلومات.", articleId: article.id, status: "APPROVED" } });
    const reply = await db.comment.create({ data: { content: "أنصح بـ Semrush.", articleId: article.id, authorId: user?.id, parentId: c2.id, status: "APPROVED" } });
    R.push(ok(true, "create 3 comments (1 reply)", "create"));

    // Verify reply relationship
    const dbReply = await db.comment.findUnique({ where: { id: reply.id } });
    R.push(ok(dbReply?.parentId === c2.id, "verify reply.parentId → parent comment", "integrity", `parentId: ${dbReply?.parentId}`));

    // Comment like
    if (user) {
      await db.commentLike.create({ data: { commentId: c1.id, userId: user.id, sessionId: S() } });
      const likes = await db.commentLike.count({ where: { commentId: c1.id } });
      R.push(ok(likes === 1, "verify commentLike count = 1", "integrity", `count: ${likes}`));
    }
  } catch (e) { R.push(ok(false, "comments", "create", e instanceof Error ? e.message : "error")); }

  // Article views + likes
  try {
    for (let i = 0; i < 5; i++) await db.articleView.create({ data: { articleId: article.id, sessionId: S(), ipAddress: `192.168.1.${10 + i}` } });
    const viewCount = await db.articleView.count({ where: { articleId: article.id } });
    R.push(ok(viewCount >= 5, `verify articleView count >= 5`, "integrity", `count: ${viewCount}`));

    if (user) {
      await db.articleLike.create({ data: { articleId: article.id, userId: user.id, sessionId: S() } });
      const likeCount = await db.articleLike.count({ where: { articleId: article.id } });
      R.push(ok(likeCount >= 1, "verify articleLike count >= 1", "integrity", `count: ${likeCount}`));
    }
  } catch (e) { R.push(ok(false, "views/likes", "create", e instanceof Error ? e.message : "error")); }

  // Subscribers
  try {
    await db.subscriber.create({ data: { email: "sub1@test.com", name: "محمد", clientId: client.id, subscribed: true, consentGiven: true } });
    await db.subscriber.create({ data: { email: "sub2@test.com", name: "فاطمة", clientId: client.id, subscribed: true, consentGiven: true } });
    const subCount = await db.subscriber.count({ where: { clientId: client.id } });
    R.push(ok(subCount >= 2, `verify subscriber count >= 2`, "integrity", `count: ${subCount}`));
  } catch (e) { R.push(ok(false, "subscribers", "create", e instanceof Error ? e.message : "error")); }

  // Contact messages
  try {
    await db.contactMessage.create({ data: { name: "طارق", email: "tariq@test.sa", subject: "استفسار", message: "ابغى تفاصيل الباقات", status: "new" } });
    await db.contactMessage.create({ data: { name: "منى", email: "mona@test.sa", subject: "عرض سعر", message: "نريد 10 مقالات شهرياً", status: "read" } });
    const msgCount = await db.contactMessage.count({});
    R.push(ok(msgCount >= 2, `verify contactMessage count >= 2`, "integrity", `count: ${msgCount}`));
  } catch (e) { R.push(ok(false, "contact messages", "create", e instanceof Error ? e.message : "error")); }

  const passed = R.filter(r => r.status === "pass").length;
  return { section: "Interactions", results: R, passed, failed: R.filter(r => r.status === "fail").length };
}

// ═══════════════════════════════════════════════════════════════════
// LOG SYSTEM — writes to admin/logs/integration-test/
// ═══════════════════════════════════════════════════════════════════

const LOG_DIR = join(process.cwd(), "logs", "integration-test");

function formatTimestamp(): string {
  const d = new Date();
  return d.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function formatLog(sections: SectionResult[]): string {
  const now = new Date();
  const lines: string[] = [];

  lines.push("═".repeat(60));
  lines.push(`MODONTY Integration Test — ${now.toLocaleDateString("ar-SA")} ${now.toLocaleTimeString("ar-SA")}`);
  lines.push(`Timestamp: ${now.toISOString()}`);
  lines.push("═".repeat(60));
  lines.push("");

  let totalPassed = 0;
  let totalFailed = 0;

  for (const sr of sections) {
    totalPassed += sr.passed;
    totalFailed += sr.failed;

    lines.push(`┌─── ${sr.section} (${sr.passed} passed, ${sr.failed} failed) ${"─".repeat(Math.max(0, 40 - sr.section.length))}`);
    for (const r of sr.results) {
      const icon = r.status === "pass" ? "✅" : r.status === "fail" ? "❌" : "⏭️";
      const phase = `[${r.phase}]`.padEnd(13);
      const detail = r.detail ? ` → ${r.detail}` : "";
      lines.push(`│ ${icon} ${phase} ${r.action}${detail}`);
    }
    lines.push(`└${"─".repeat(59)}`);
    lines.push("");
  }

  lines.push("═".repeat(60));
  lines.push(`SUMMARY: ${totalPassed} passed | ${totalFailed} failed | ${totalPassed + totalFailed} total`);
  lines.push(`STATUS:  ${totalFailed === 0 ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED"}`);
  lines.push("═".repeat(60));

  return lines.join("\n");
}

async function writeLog(sections: SectionResult[]): Promise<string> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    const filename = `test-${formatTimestamp()}.log`;
    const filepath = join(LOG_DIR, filename);
    const content = formatLog(sections);
    await writeFile(filepath, content, "utf-8");

    // Also write/update latest.log (always the most recent run)
    await writeFile(join(LOG_DIR, "latest.log"), content, "utf-8");

    return filename;
  } catch {
    return "log-write-failed";
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ═══════════════════════════════════════════════════════════════════

export async function runSeedSection(section: SeedSection): Promise<SectionResult & { logFile?: string }> {
  let result: SectionResult;
  switch (section) {
    case "categories": result = await seedCategories(); break;
    case "tags": result = await seedTags(); break;
    case "industries": result = await seedIndustries(); break;
    case "clients": result = await seedClients(); break;
    case "articles": result = await seedArticles(); break;
    case "faqs": result = await seedFaqs(); break;
    case "interactions": result = await seedInteractions(); break;
    default: result = { section: "Unknown", results: [], passed: 0, failed: 0 };
  }

  const logFile = await writeLog([result]);
  return { ...result, logFile };
}

export async function runAllSeedSections(): Promise<{ sections: SectionResult[]; logFile: string }> {
  const order: SeedSection[] = ["categories", "tags", "industries", "clients", "articles", "faqs", "interactions"];
  const sections: SectionResult[] = [];
  for (const s of order) sections.push(await runSeedSection(s));

  const logFile = await writeLog(sections);
  return { sections, logFile };
}

// Save combined log from UI (called after all sections finish)
export async function saveCombinedLog(sections: SectionResult[]): Promise<string> {
  return writeLog(sections);
}
