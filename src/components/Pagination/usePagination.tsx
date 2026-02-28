import { useState } from "react";

export const usePagination = () => {
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  return { page, setPage, totalPages, setTotalPages, limit, setLimit }
}