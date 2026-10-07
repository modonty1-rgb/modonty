"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FAQAccordion } from "./faq-accordion";
import { FAQSearch } from "./faq-search";
import { useFaqSearchPagination } from "../helpers/use-faq-search-pagination";
import { SITE_LOCALE } from "@modonty/shared/lib/constants/locale";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  upvoteCount?: number | null;
  downvoteCount?: number | null;
}

interface FAQPageContentProps {
  faqs: FAQ[];
  lastUpdated: Date | null;
}

export function FAQPageContent({ faqs, lastUpdated }: FAQPageContentProps) {
  const {
    searchQuery,
    currentPage,
    filteredFAQs,
    totalPages,
    paginatedFAQs,
    handleSearchChange,
    handlePageChange,
  } = useFaqSearchPagination(faqs);

  return (
    <>
      <FAQSearch
        onSearchChange={handleSearchChange}
        resultCount={filteredFAQs.length}
        totalCount={faqs.length}
      />

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <span>
              {filteredFAQs.length} {filteredFAQs.length === 1 ? "سؤال" : "سؤال"} متاح
              {searchQuery && ` (من أصل ${faqs.length})`}
            </span>
            {lastUpdated && (
              <span>
                آخر تحديث: {new Date(lastUpdated).toLocaleDateString(SITE_LOCALE, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {filteredFAQs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              لم يتم العثور على أسئلة تطابق بحثك
            </p>
          ) : (
            <>
              <FAQAccordion items={paginatedFAQs} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm max-md:inline-flex max-md:min-h-11 max-md:items-center max-md:px-4"
                    aria-label="الصفحة السابقة"
                  >
                    السابق
                  </button>
                  <span className="text-sm text-muted-foreground">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm max-md:inline-flex max-md:min-h-11 max-md:items-center max-md:px-4"
                    aria-label="الصفحة التالية"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
