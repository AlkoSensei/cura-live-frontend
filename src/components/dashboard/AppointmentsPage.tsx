"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAppointmentHistory, cancelAppointment } from "@/lib/api";
import type { Appointment, AppointmentStatus, PaginatedAppointments } from "@/types/call";
import { AppointmentsTable } from "@/components/dashboard/AppointmentsTable";
import { AppointmentsPagination } from "@/components/dashboard/AppointmentsPagination";

type FilterStatus = AppointmentStatus | "";

const STATUS_TABS: { label: string; value: FilterStatus }[] = [
  { label: "All",       value: "" },
  { label: "Booked",    value: "booked" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" }
];

const PAGE_SIZE = 20;

export function AppointmentsPage() {
  const [data, setData] = useState<PaginatedAppointments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("");
  const [page, setPage] = useState(1);
  const [deleteState, setDeleteState] = useState<Record<string, "confirming" | "deleting">>({});
  const debounceRef = useRef<number | undefined>(undefined);

  const fetchData = useCallback(async (q: string, s: FilterStatus, p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAppointmentHistory({
        page: p,
        page_size: PAGE_SIZE,
        search: q,
        status: s
      });
      setData(result);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced fetch on search / status change — resets to page 1
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setPage(1);
      void fetchData(search, status, 1);
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [search, status, fetchData]);

  // Immediate fetch on page change (no debounce)
  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    void fetchData(search, status, p);
  }, [fetchData, search, status]);

  const handleDeleteConfirm = (id: string) => {
    setDeleteState((prev) => ({ ...prev, [id]: "confirming" }));
  };

  const handleDeleteCancel = (id: string) => {
    setDeleteState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleDeleteExecute = async (appointment: Appointment) => {
    setDeleteState((prev) => ({ ...prev, [appointment.id]: "deleting" }));
    try {
      const updated = await cancelAppointment(appointment.id, appointment.phone_number);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === updated.id ? updated : item))
        };
      });
    } catch {
      setError("Could not cancel appointment. Please try again.");
    } finally {
      setDeleteState((prev) => {
        const next = { ...prev };
        delete next[appointment.id];
        return next;
      });
    }
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        {data && (
          <span className="muted-text" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {data.total} total · {data.items.filter(a => a.status === "booked").length} booked on this page
          </span>
        )}
      </div>

      <div className="appointments-toolbar">
        <input
          className="search-input"
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
        />
        <div className="status-tabs" role="tablist">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              className={`status-tab${status === tab.value ? " status-tab--active" : ""}`}
              onClick={() => setStatus(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="error-banner" style={{ margin: "12px 24px 0" }}>{error}</div> : null}

      <div className="appointments-body">
        <AppointmentsTable
          items={data?.items ?? []}
          isLoading={isLoading}
          deleteState={deleteState}
          onDeleteConfirm={handleDeleteConfirm}
          onDeleteCancel={handleDeleteCancel}
          onDeleteExecute={handleDeleteExecute}
        />
      </div>

      {data && data.total > PAGE_SIZE && (
        <AppointmentsPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={data.total}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
