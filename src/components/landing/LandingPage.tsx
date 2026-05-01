import Link from "next/link";

const TICKER_ITEMS = [
  "LiveKit voice", "Deepgram STT", "Sarvam TTS", "Tavus & Beyond Presence Avatars",
  "Tool calling", "Appointment booking", "Call summaries", "Slot availability",
  "Double-booking prevention", "Cost per call", "Claude LLM", "Supabase DB"
];

const FEATURES = [
  {
    wide: true,
    title: "Live voice conversation",
    desc: "Full-duplex voice calls with <3s response latency. Maintains multi-turn context across 5+ exchanges without losing the thread.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
      </svg>
    )
  },
  {
    title: "Smart booking",
    desc: "Real-time slot fetching, double-booking prevention, and confirmation with date and doctor details.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    title: "Auto summaries",
    desc: "Call summary generated in <10s: intent, appointments, extracted info, timestamp, and cost breakdown.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  {
    title: "6 Cura tools",
    desc: "Identify patient · Fetch Slots · Book Appointment · Retrieve Appointments · Cancel Appointment · Modify Appointment — called intelligently mid-conversation.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  {
    title: "Live dashboard",
    desc: "Real-time transcript, tool activity, call history with cost analytics, and a paginated appointments manager.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    title: "Patient identification",
    desc: "Phone-number based lookup — greets patients by name, recalls past appointments.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  }
];

const STEPS = [
  { n: "01", title: "Patient calls in",      desc: "Answered instantly with a natural greeting. No menus, no hold music — just conversation." },
  { n: "02", title: "Patient identified",    desc: "Phone number lookup pulls up records; conversation becomes personal immediately." },
  { n: "03", title: "Request handled",       desc: "Availability checked in real time. Appointment booked, modified, or cancelled as needed." },
  { n: "04", title: "Summary generated",     desc: "Structured call summary appears in the dashboard within seconds — intent, appointments, cost." }
];

export function LandingPage() {
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2.5" fill="#040f0b"/>
              <path d="M7 1v2.5M7 10.5V13M1 7h2.5M10.5 7H13" stroke="#040f0b" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="landing-nav-logo-text">Cura Health</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#stats">Results</a>
        </div>
        <div className="landing-nav-right">
          <Link href="/dashboard" className="landing-nav-cta">Open Dashboard →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-blob landing-hero-blob-1" />
        <div className="landing-hero-blob landing-hero-blob-2" />

        <div className="landing-hero-inner">
          <div className="landing-eyebrow">
            <span className="landing-live-dot" />
            Cura · Healthcare
          </div>

          <h1 className="hero-headline">
            The clinic<br/>
            <span className="hero-accent">never sleeps</span>
          </h1>

          <p className="hero-sub">
            Cura greets patients, understands their needs, books appointments — and hands off a perfect summary. No hold music. No missed calls.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard/live-call" className="hero-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start demo call
            </Link>
            <a href="#features" className="hero-btn-ghost">
              See how it works
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="landing-ticker">
        <div className="landing-ticker-track">
          {tickerItems.map((item, i) => (
            <span key={i} className="landing-ticker-item">
              <svg width="8" height="8" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="rgba(42,223,158,0.5)"/>
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="landing-section" id="features">
        <div className="landing-section-tag">What it does</div>
        <h2 className="landing-section-title">Built for the full front-desk workflow</h2>

        <div className="bento-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`bento-card${f.wide ? " bento-card--wide" : ""}`}>
              <div className="bento-icon">{f.icon}</div>
              <div className="bento-title">{f.title}</div>
              <div className="bento-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="stats-band" id="stats">
        {[["<3s", "Response latency"], ["5+", "Exchanges per call"], ["6", "Cura tools"], ["10s", "Summary generation"]].map(([n, l]) => (
          <div key={l} className="stat-cell">
            <div className="stat-number">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section className="landing-section" id="how">
        <div className="landing-section-tag">How it works</div>
        <h2 className="landing-section-title">Call in, hang up, confirmed</h2>

        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="landing-cta">
        <div className="landing-cta-box">
          <div className="landing-cta-title">Ready to try a live call?</div>
          <div className="landing-cta-sub">Open the dashboard and start a demo conversation right now.</div>
          <Link href="/dashboard/live-call" className="hero-btn" style={{ display: "inline-flex" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Open Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          <div className="landing-nav-logo-icon" style={{ width: 22, height: 22, borderRadius: 6 }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2.5" fill="#040f0b"/>
              <path d="M7 1v2.5M7 10.5V13M1 7h2.5M10.5 7H13" stroke="#040f0b" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, color: "rgba(232,245,241,0.4)" }}>Cura Health</span>
        </div>
        <span>Cura AI</span>
        <span>LiveKit · Deepgram · Sarvam · Tavus · Beyond Presence</span>
        <span style={{ color: "rgba(232,245,241,0.3)" }}>© 2026 Plaban Datta</span>
      </footer>
    </div>
  );
}
