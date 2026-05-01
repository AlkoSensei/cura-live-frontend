"use client";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function AppointmentsPagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </span>

      <div className="pagination-buttons">
        <button
          className="pagination-btn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
          aria-label="Previous page"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn${p === page ? " pagination-btn--active" : ""}`}
            onClick={() => onPageChange(p)}
            type="button"
          >
            {p}
          </button>
        ))}

        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
          aria-label="Next page"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
