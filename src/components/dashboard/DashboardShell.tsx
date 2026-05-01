"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Live Call",
    href: "/dashboard/live-call",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    )
  },
  {
    label: "Call History",
    href: "/dashboard/call-history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 8 12 12 14 14"/>
        <path d="M3.05 11a9 9 0 1 0 .5-4M3 3v4h4"/>
      </svg>
    )
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-label">Reception</div>
          <div className="sidebar-logo-mark">
            <div className="sidebar-logo-icon">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="2.5" fill="#040f0b"/>
                <path d="M7 1v2.5M7 10.5V13M1 7h2.5M10.5 7H13" stroke="#040f0b" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">Cura Health</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${pathname.startsWith(item.href) ? " sidebar-link--active" : ""}`}
            >
              {item.icon}
              {item.label}
              {item.href === "/dashboard/live-call" && (
                <span style={{ marginLeft: "auto" }}>
                  <span className="pulse-dot" style={{ display: "inline-flex" }}>
                    <span className="pulse-dot-inner" style={{ width: 6, height: 6, background: pathname.startsWith(item.href) ? "var(--teal)" : "var(--text-sub)" }} />
                  </span>
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="sidebar-status-label">System</div>
          <div className="sidebar-status-row">
            <span className="sidebar-status-dot" />
            Worker ready
          </div>
          <div className="sidebar-status-row">
            <span className="sidebar-status-dot" />
            Database online
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
