"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getSafeNextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/dashboard") ? next : "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? "Could not sign in.");
      }

      router.replace(getSafeNextPath());
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="login-card" onSubmit={handleSubmit}>
      <div className="login-logo">
        <div className="landing-nav-logo-icon">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2.5" fill="#040f0b"/>
            <path d="M7 1v2.5M7 10.5V13M1 7h2.5M10.5 7H13" stroke="#040f0b" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span>Cura Health</span>
      </div>

      <label className="login-field">
        Username
        <input
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
        />
      </label>

      <label className="login-field">
        Password
        <input
          autoComplete="current-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
      </label>

      {error ? <div className="error-banner">{error}</div> : null}

      <button className="primary-button login-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      <div className="login-support">
        For access credentials or support, please contact{" "}
        <a href="mailto:plabandatta2015@gmail.com">plabandatta2015@gmail.com</a>.
      </div>
    </form>
  );
}
