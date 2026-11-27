"use client";

import GlassyOtp, { type VerificationResult } from "../components/GlassyOtp";

/**
 * Exemple Next.js App Router. Adapter le chemin d'import à ton projet.
 * Les deux endpoints REST sont à implémenter côté serveur.
 */
export default function VerifyEmailPage() {
  const verify = async (code: string): Promise<VerificationResult> => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ code }),
      cache: "no-store",
    });
    // Pas de comparaison client (ni code en clair dans le composant).
    if (res.ok) return true;
    if (res.status === 400 || res.status === 401 || res.status === 410 || res.status === 429) {
      return { ok: false, message: "Code incorrect, expiré ou trop de tentatives." };
    }
    throw new Error("OTP verification failed");
  };

  const resend = async () => {
    const res = await fetch("/api/auth/resend-otp", { method: "POST", credentials: "same-origin" });
    if (!res.ok) throw new Error("Resend failed");
  };

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at 40% 10%,#72543b,#312821 60%,#171517)" }}>
      <GlassyOtp
        email="alice@example.com"
        onVerify={verify}
        onResend={resend}
        onContinue={() => { window.location.assign("/dashboard"); }}
      />
    </main>
  );
}
