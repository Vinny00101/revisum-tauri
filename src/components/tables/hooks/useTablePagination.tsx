import { useMemo, useState } from "react";

export function useTablePagination<T>(data: T[], pageSize: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const goToNext = () =>
    setCurrentPage(p => Math.min(p + 1, totalPages));

  const goToPrevious = () =>
    setCurrentPage(p => Math.max(p - 1, 1));

  const goToPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return {
    paginatedData,
    currentPage,
    totalPages,
    goToNext,
    goToPrevious,
    goToPage,
  };
}