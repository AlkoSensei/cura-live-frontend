"use client";

import { useCallback, useEffect, useState } from "react";
import { getCallHistory } from "@/lib/api";
import { formatCostINR, formatDateTime, labelFromIntent } from "@/lib/format";
import type { CallHistoryItem } from "@/types/call";

const PAGE_SIZE = 20;

export function CallHistoryPage() {
  const [calls, setCalls] = useState<CallHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalCostUsd, setTotalCostUsd] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const load = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCallHistory(p, PAGE_SIZE);
      setCalls(res.calls);
      setTotalCalls(res.total_calls ?? res.calls.length);
      setTotalCostUsd(res.total_cost_usd ?? res.calls.reduce((s, c) => s + c.total_cost, 0));
      setHasNext(res.has_next ?? false);
    } catch {
      setError("Could not load call history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(page); }, 0);
    return () => window.clearTimeout(timer);
  }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(totalCalls / PAGE_SIZE));

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">Call History</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-sub)", fontFamily: "var(--font-mono)" }}>
            {totalCalls} calls · {formatCostINR(totalCostUsd)} total
          </span>
          <button
            className="btn-ghost-sm"
            onClick={() => void load(page)}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <div className="error-banner" style={{ margin: "12px 24px 0" }}>{error}</div> : null}

      <div className="history-page-body">
        {isLoading && calls.length === 0 ? (
          <div className="table-loading">Loading call history…</div>
        ) : calls.length === 0 ? (
          <p className="empty-state">No calls recorded yet.</p>
        ) : (
          calls.map((call) => {
            const fields = call.extracted_fields;
            const isOpen = openId === call.session.id;

            return (
              <div
                key={call.session.id}
                className="history-page-card"
                onClick={() => setOpenId(isOpen ? null : call.session.id)}
              >
                <div className="history-page-card-header">
                  <span
                    style={{
                      display: "inline-flex",
                      borderRadius: 999,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      background: call.session.status === "ended" ? "var(--green-s)" : "var(--amber-s)",
                      color: call.session.status === "ended" ? "var(--green)" : "var(--amber)",
                      border: `1px solid ${call.session.status === "ended" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`
                    }}
                  >
                    {call.session.status}
                  </span>

                  <div>
                    <div className="history-page-card-name">
                      {fields?.name ?? "Patient not captured"}
                    </div>
                    <div className="history-page-card-phone">
                      {fields?.phone_number ?? call.session.phone_number ?? "—"}
                    </div>
                  </div>

                  <div className="history-page-card-meta">
                    <span style={{ fontSize: 12, color: "var(--text-mid)", fontFamily: "var(--font-mono)" }}>
                      {formatDateTime(fields?.date, fields?.time)}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-sub)" }}>
                      {call.tool_call_count} tools · {call.appointment_count} appts
                    </span>
                    <span className="history-page-card-cost">{formatCostINR(call.total_cost)}</span>
                  </div>

                  <svg
                    className="history-page-card-expand"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>

                {isOpen && (
                  <div className="history-page-card-details">
                    {[
                      ["Intent", labelFromIntent(fields?.intent)],
                      ["Status", call.session.status],
                      ["Tools", String(call.tool_call_count)],
                      ["Appointments", String(call.appointment_count)],
                      ["Phone", fields?.phone_number ?? call.session.phone_number ?? "—"],
                      ["Cost", formatCostINR(call.total_cost)]
                    ].map(([label, value]) => (
                      <div key={label} className="history-detail-cell">
                        <div className="history-detail-cell-label">{label}</div>
                        <div className="history-detail-cell-value">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalCalls > PAGE_SIZE && (
        <div className="pagination">
          <span className="pagination-info">
            Page {page} of {totalPages} · {totalCalls} calls
          </span>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} style={{ padding: "0 4px", color: "var(--text-sub)", fontSize: 12 }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`pagination-btn${page === p ? " pagination-btn--active" : ""}`}
                    onClick={() => setPage(p as number)}
                    disabled={isLoading}
                    type="button"
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="pagination-btn"
              disabled={!hasNext || isLoading}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
