"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./GlassyOtp.module.css";

export type VerificationResult = boolean | { ok: boolean; message?: string };

type Stage = "entry" | "verifying" | "linked" | "check" | "complete";

export type OtpLabels = Partial<{
  title: string;
  instruction: string;
  verify: string;
  verifying: string;
  verified: string;
  resendQuestion: string;
  resend: string;
  resendIn: string;
  successTitle: string;
  successBody: string;
  emailConfirmed: string;
  deviceTrusted: string;
  continue: string;
  invalid: string;
  resendError: string;
  resendSuccess: string;
}>;

export interface GlassyOtpProps {
  email: string;
  /** 4 chiffres reproduisent la chorégraphie en X de la vidéo ; 6 reste en ligne. */
  digits?: 4 | 6;
  cooldownSeconds?: number;
  /** Toujours vérifier le code sur le serveur, jamais dans le navigateur. */
  onVerify: (code: string) => Promise<VerificationResult>;
  onResend?: () => Promise<void>;
  onContinue?: () => void;
  labels?: OtpLabels;
  className?: string;
  /** Attribut autocomplete=one-time-code activé par défaut. */
  autoComplete?: boolean;
}

const defaults: Required<OtpLabels> = {
  title: "Vérifiez votre boîte mail",
  instruction: "Saisissez le code reçu à",
  verify: "Vérifier le code",
  verifying: "Vérification…",
  verified: "Vérifié",
  resendQuestion: "Pas reçu de code ?",
  resend: "Renvoyer",
  resendIn: "Renvoyer dans",
  successTitle: "Identité confirmée",
  successBody: "Votre adresse e-mail est confirmée. Vous pouvez continuer en toute sécurité.",
  emailConfirmed: "Adresse e-mail confirmée",
  deviceTrusted: "Session vérifiée",
  continue: "Continuer",
  invalid: "Code incorrect ou expiré. Réessayez.",
  resendError: "Envoi impossible. Réessayez plus tard.",
  resendSuccess: "Un nouveau code a été envoyé.",
};

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" aria-hidden="true">
      <rect x="3.25" y="5.5" width="17.5" height="13" rx="3" stroke="currentColor" strokeWidth="1.55" />
      <path d="m4.25 7 7.1 5.3a1.15 1.15 0 0 0 1.3 0L19.75 7" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="m5 12.5 4.4 4.4L19 7.5" stroke="currentColor" strokeWidth="2.55" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(2, Math.min(name.length - 2, 5)))}@${domain}`;
}

export default function GlassyOtp({
  email,
  digits = 4,
  cooldownSeconds = 25,
  onVerify,
  onResend,
  onContinue,
  labels,
  className,
  autoComplete = true,
}: GlassyOtpProps) {
  const t = { ...defaults, ...labels };
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("entry");
  const [cooldown, setCooldown] = useState(cooldownSeconds);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resending, setResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(true);
  const attemptRef = useRef(0);
  const lockedRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      attemptRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((current) => Math.max(current - 1, 0)), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const verify = useCallback(async (value: string) => {
    if (lockedRef.current || value.length !== digits) return;
    lockedRef.current = true;
    const currentAttempt = ++attemptRef.current;
    setError("");
    setNotice("");
    setStage("verifying");
    try {
      // La chorégraphie est purement visuelle et ne détermine jamais la validité du code.
      const [result] = await Promise.all([onVerify(value), pause(900)]);
      if (!activeRef.current || currentAttempt !== attemptRef.current) return;
      const ok = typeof result === "boolean" ? result : result.ok;
      if (!ok) {
        setCode("");
        setStage("entry");
        setError(typeof result === "boolean" ? t.invalid : result.message || t.invalid);
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
      setStage("linked");
      await pause(780);
      if (!activeRef.current || currentAttempt !== attemptRef.current) return;
      setStage("check");
      await pause(830);
      if (!activeRef.current || currentAttempt !== attemptRef.current) return;
      setStage("complete");
    } catch {
      if (!activeRef.current || currentAttempt !== attemptRef.current) return;
      setCode("");
      setStage("entry");
      setError(t.invalid);
      requestAnimationFrame(() => inputRef.current?.focus());
    } finally {
      if (currentAttempt === attemptRef.current) lockedRef.current = false;
    }
  }, [digits, onVerify, t.invalid]);

  const updateCode = (raw: string) => {
    if (stage !== "entry") return;
    const clean = raw.replace(/\D/g, "").slice(0, digits);
    setCode(clean);
    setError("");
    setNotice("");
    if (clean.length === digits) void verify(clean);
  };

  const resend = async () => {
    if (!onResend || cooldown > 0 || resending || stage !== "entry") return;
    setResending(true);
    setError("");
    setNotice("");
    try {
      await onResend();
      if (!activeRef.current) return;
      setCooldown(cooldownSeconds);
      setCode("");
      setNotice(t.resendSuccess);
      inputRef.current?.focus();
    } catch {
      if (activeRef.current) setError(t.resendError);
    } finally {
      if (activeRef.current) setResending(false);
    }
  };

  const masked = maskEmail(email);
  const isSquare = digits === 4 && (stage === "verifying" || stage === "linked");
  const isDone = stage === "linked" || stage === "check" || stage === "complete";
  const isProcessing = stage === "verifying";

  return (
    <section className={[styles.card, className || ""].filter(Boolean).join(" ")} aria-label="Vérification de l'adresse e-mail">
      <div className={styles.topGlow} aria-hidden="true" />
      {stage !== "complete" ? (
        <>
          <div className={[styles.symbol, stage === "check" ? styles.symbolHidden : ""].join(" ")}>
            <MailIcon />
            <span className={styles.notification} />
          </div>
          <h2 className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.instruction}</p>
          <div className={styles.email}>{masked}</div>

          <div className={[styles.otpArea, digits === 6 ? styles.six : "", isSquare ? styles.square : "", stage === "linked" ? styles.linked : "", stage === "check" ? styles.checked : ""].filter(Boolean).join(" ")}>
            <div className={styles.slots} aria-hidden="true">
              {Array.from({ length: digits }).map((_, i) => (
                <span
                  key={i}
                  className={[styles.slot, code.length === i && stage === "entry" ? styles.activeSlot : "", code[i] ? styles.filledSlot : "", isDone ? styles.successSlot : ""].filter(Boolean).join(" ")}
                  style={{ "--i": i } as CSSProperties}
                >
                  {code[i] || ""}
                </span>
              ))}
              {digits === 4 && (
                <svg className={styles.connectors} viewBox="0 0 258 142" fill="none" aria-hidden="true">
                  <path pathLength="1" d="M88 29 184 117" />
                  <path pathLength="1" d="M184 29 88 117" />
                  <circle cx="136" cy="73" r="4" />
                </svg>
              )}
            </div>
            {stage === "entry" && (
              <input
                ref={inputRef}
                className={styles.nativeInput}
                value={code}
                onChange={(event) => updateCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && code.length === digits) void verify(code);
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={autoComplete ? "one-time-code" : "off"}
                maxLength={digits}
                aria-label={`Code de vérification à ${digits} chiffres`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "otp-error" : undefined}
                spellCheck={false}
              />
            )}
            {stage === "check" && (
              <span className={styles.largeCheck} aria-hidden="true"><CheckIcon size={30} /></span>
            )}
          </div>

          <div aria-live="polite" aria-atomic="true" className={styles.liveRegion}>
            {error && <p id="otp-error" className={styles.error}>{error}</p>}
            {!error && notice && <p className={styles.notice}>{notice}</p>}
          </div>
          <div className={[styles.action, isDone ? styles.actionSuccess : ""].join(" ")}>
            {isDone ? <><CheckIcon size={15} /> {t.verified}</> : isProcessing ? (
              <><span className={styles.spinner} /> {t.verifying}</>
            ) : <button type="button" onClick={() => void verify(code)} disabled={code.length !== digits}>{t.verify}</button>}
          </div>
          <p className={styles.resendRow}>
            {t.resendQuestion}{" "}
            {onResend && cooldown === 0 ? (
              <button type="button" onClick={() => void resend()} disabled={resending || stage !== "entry"}>
                {resending ? "…" : t.resend}
              </button>
            ) : (
              <span className={styles.resendTimer}>{onResend ? `${t.resendIn} 0:${String(cooldown).padStart(2, "0")}` : ""}</span>
            )}
          </p>
        </>
      ) : (
        <div className={styles.successScene}>
          <div className={styles.successHalo}><CheckIcon size={34} /></div>
          <h2 className={styles.title}>{t.successTitle}</h2>
          <p className={styles.successDescription}>{t.successBody}</p>
          <div className={styles.confirmationRows}>
            <div className={styles.confirmationRow}><MailIcon /><span>{t.emailConfirmed}</span><span className={styles.smallCheck}><CheckIcon size={13} /></span></div>
            <div className={styles.confirmationRow}><CheckIcon size={18} /><span>{t.deviceTrusted}</span><span className={styles.smallCheck}><CheckIcon size={13} /></span></div>
          </div>
          {onContinue && <button type="button" className={styles.continueButton} onClick={onContinue}>{t.continue} <span aria-hidden="true">→</span></button>}
        </div>
      )}
    </section>
  );
}
