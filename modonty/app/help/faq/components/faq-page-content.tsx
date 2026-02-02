"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FAQAccordion } from "../../components/faq-accordion";
import { FAQSearch } from "../../components/faq-search";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;

    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [faqs, searchQuery]);

  const totalPages = Math.ceil(filteredFAQs.length / itemsPerPage);
  const paginatedFAQs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFAQs.slice(startIndex, endIndex);
  }, [filteredFAQs, currentPage, itemsPerPage]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                آخر تحديث: {new Date(lastUpdated).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                لم يتم العثور على أسئلة تطابق بحثك
              </p>
            </div>
          ) : (
            <>
              <FAQAccordion items={paginatedFAQs} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
