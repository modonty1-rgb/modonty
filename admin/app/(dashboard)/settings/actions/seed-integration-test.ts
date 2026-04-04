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
    await db.client.update({ where: { id: c.id }, data: { logoMediaId: null, ogImageMediaId: null } });
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
    const tempClient = await db.client.create({ data: { name: "temp", slug: "test-temp-constraint", email: "temp@test.com", subscriptionTier: "BASIC", industryId: i1.industry.id } });
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
      await db.client.update({
        where: { id: existing.id },
        data: { logoMediaId: null, ogImageMediaId: null },
      });
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

  const client = await db.client.findFirst({ select: { id: true } });
  const category = await db.category.findFirst({ select: { id: true } });
  const tags = await db.tag.findMany({ take: 2, select: { id: true } });

  if (!client) return { section: "Articles", results: [{ action: "findClient", phase: "create", status: "fail", detail: "Run Clients first" }], passed: 0, failed: 1 };

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

  // ── RE-CREATE final articles ──
  const FINAL_ARTICLES = [
    { title: "دليل SEO المتاجر الإلكترونية 2025", slug: "seo-guide-ecommerce-2025", content: "<h2>لماذا SEO ضروري لمتجرك؟</h2><p>87% من المتسوقين يعتمدون على محركات البحث.</p><h2>بحث الكلمات المفتاحية</h2><p>ركز على كلمات نية الشراء العالية.</p>", excerpt: "دليل شامل لتحسين SEO المتاجر.", status: "PUBLISHED" as const, featured: true, seoTitle: "دليل SEO المتاجر 2025", seoDescription: "استراتيجيات مجربة لزيادة الزيارات." },
    { title: "الذكاء الاصطناعي في الرعاية الصحية", slug: "ai-healthcare-2025", content: "<h2>AI في الرعاية الصحية السعودية</h2><p>تشخيص سرطان الثدي بدقة 94.5%.</p>", excerpt: "كيف يغير AI الرعاية الصحية.", status: "PUBLISHED" as const, seoTitle: "AI في الرعاية الصحية 2025", seoDescription: "التشخيص المبكر والتطبيب عن بُعد." },
    { title: "مستقبل التعليم الرقمي", slug: "digital-education-future", content: "<h2>الفرصة الذهبية</h2><p>سوق التعليم الإلكتروني يصل إلى 1.2 مليار دولار.</p>", excerpt: "التعليم الرقمي ينمو بسرعة.", status: "DRAFT" as const, seoTitle: "مستقبل التعليم الرقمي", seoDescription: "المنصات والأدوات والفرص." },
  ];

  for (const a of FINAL_ARTICLES) {
    const existing = await db.article.findFirst({ where: { slug: a.slug }, select: { id: true } });
    if (existing) {
      // Clean all relations first to ensure delete succeeds
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
    const r = await createArticle({ ...a, clientId: client.id, authorId: author.id, categoryId: category?.id, tags: tags.map(t => t.id), wordCount: 300, readingTimeMinutes: 2, datePublished: a.status === "PUBLISHED" ? new Date() : undefined });
    R.push(ok(r.success, `re-create("${a.title.slice(0, 35)}...")`, "re-create", r.error));

    // Publish articles that should be PUBLISHED (createArticle forces WRITING)
    if (r.success && r.article && a.status === "PUBLISHED") {
      const pub = await updateArticle(r.article.id, { ...a, clientId: client.id, authorId: author.id, categoryId: category?.id, tags: tags.map(t => t.id), wordCount: 300, readingTimeMinutes: 2, datePublished: new Date() });
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
