"use client";

import { useState, useMemo } from "react";

export function useFaqSearchPagination<T extends { question: string; answer: string }>(faqs: T[]) {
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

  return {
    searchQuery,
    currentPage,
    filteredFAQs,
    totalPages,
    paginatedFAQs,
    handleSearchChange,
    handlePageChange,
  };
}
