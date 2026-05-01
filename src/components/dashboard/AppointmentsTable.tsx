"use client";

import type { Appointment } from "@/types/call";

type Props = {
  items: Appointment[];
  isLoading: boolean;
  deleteState: Record<string, "confirming" | "deleting">;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: (id: string) => void;
  onDeleteExecute: (appointment: Appointment) => void;
};

export function AppointmentsTable({
  items,
  isLoading,
  deleteState,
  onDeleteConfirm,
  onDeleteCancel,
  onDeleteExecute
}: Props) {
  if (isLoading) {
    return <div className="table-loading">Loading appointments…</div>;
  }

  if (items.length === 0) {
    return <p className="empty-state">No appointments match your filters.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Notes</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {items.map((appt) => {
            const ds = deleteState[appt.id];
            return (
              <tr key={appt.id} className={ds ? "row--pending-delete" : ""}>
                <td style={{ fontWeight: 600 }}>{appt.patient_name}</td>
                <td className="mono">{appt.phone_number}</td>
                <td className="mono">{appt.appointment_date}</td>
                <td className="mono">{appt.appointment_time}</td>
                <td>
                  <span className={`status-badge status-badge--${appt.status}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="notes-cell">{appt.notes ?? "—"}</td>
                <td className="actions-cell">
                  {ds === "confirming" ? (
                    <span className="inline-confirm">
                      <button
                        className="btn-danger-sm"
                        onClick={() => onDeleteExecute(appt)}
                        type="button"
                      >
                        Yes, cancel
                      </button>
                      <button
                        className="btn-ghost-sm"
                        onClick={() => onDeleteCancel(appt.id)}
                        type="button"
                      >
                        Keep
                      </button>
                    </span>
                  ) : ds === "deleting" ? (
                    <span className="muted-text" style={{ fontSize: 12 }}>Cancelling…</span>
                  ) : appt.status !== "cancelled" ? (
                    <button
                      className="btn-ghost-sm"
                      onClick={() => onDeleteConfirm(appt.id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
