import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Mail, Sparkles, Download, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { sendEmailPlan } from "../lib/email";

export const CoachMode = ({ onDownloadPDF, profile, plan }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const submitEmail = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const trimmed = email.trim();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error("Email invalide", {
                description: "Renseigne un email valide pour recevoir ton plan.",
            });
            return;
        }
        setSubmitting(true);
        try {
            const res = await sendEmailPlan(trimmed, { profile, plan });
            if (res.status === "invalid") {
                toast.error("Email invalide", { description: res.message });
                return;
            }
            setSubmitted(true);
            // Honest UX: never claim the email was actually sent until a
            // backend is connected. Status returned here is "queued".
            toast.success("Email enregistré", {
                description: res.message,
            });
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[CoachMode] sendEmailPlan failed:", err);
            toast.error("Erreur inattendue", {
                description: "Réessaie dans un instant.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.section
            data-testid="coach-mode"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#140000] via-[#0A0A0A] to-[#0A0A0A] p-8 md:p-12"
        >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E60000] opacity-15 blur-[120px]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" aria-hidden />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
                {/* Left: branding */}
                <div className="lg:col-span-2">
                    <div className="inline-flex items-center gap-2 border border-[#E60000]/40 bg-[#E60000]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#E60000]">
                        <Crown className="h-3 w-3" strokeWidth={2} />
                        Mode Coach
                    </div>
                    <h3 className="mt-5 font-heading text-4xl uppercase leading-none tracking-tight text-white sm:text-5xl md:text-6xl">
                        Passe au<br />
                        <span className="text-[#E60000]">niveau pro.</span>
                    </h3>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-400">
                        Reçois ton plan complet par email, télécharge la version PDF
                        premium, ou réserve une session de coaching personnalisée
                        avec un nutritionniste sportif.
                    </p>

                    <ul className="mt-6 space-y-2">
                        {[
                            "Plan PDF premium avec branding",
                            "Plan repas personnalisé sur 7 jours",
                            "Suivi de progression hebdomadaire",
                            "Support coach dédié",
                        ].map((f) => (
                            <li
                                key={f}
                                className="flex items-center gap-3 text-sm text-gray-300"
                            >
                                <Check className="h-4 w-4 shrink-0 text-[#E60000]" strokeWidth={2.5} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: action cards */}
                <div className="space-y-4 lg:col-span-3">
                    {/* PDF Premium */}
                    <button
                        type="button"
                        onClick={onDownloadPDF}
                        data-testid="coach-pdf-btn"
                        className="group relative flex w-full items-center justify-between gap-4 border border-white/15 bg-black/60 p-6 text-left transition-all hover:border-[#E60000] hover:bg-[#E60000]/5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#E60000] text-white transition-transform group-hover:scale-105">
                                <Download className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="font-heading text-2xl uppercase tracking-tight text-white">
                                    Recevoir mon plan PDF Premium
                                </div>
                                <div className="mt-1 text-sm text-gray-400">
                                    Document complet 4 pages — branding pro, plan repas, conseils
                                </div>
                            </div>
                        </div>
                        <ArrowRight
                            className="hidden h-6 w-6 text-white transition-transform group-hover:translate-x-1 sm:block"
                            strokeWidth={1.5}
                        />
                    </button>

                    {/* Email form */}
                    <form
                        onSubmit={submitEmail}
                        data-testid="coach-email-form"
                        className="border border-white/15 bg-black/60 p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-black">
                                <Mail className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="flex-1">
                                <div className="font-heading text-2xl uppercase tracking-tight text-white">
                                    Recevoir mon plan par email
                                </div>
                                <div className="mt-1 text-sm text-gray-400">
                                    On t'envoie le plan complet + des tips hebdo
                                </div>

                                {submitted ? (
                                    <div
                                        data-testid="coach-email-success"
                                        className="mt-5 flex items-start gap-3 border border-[#E60000]/40 bg-[#E60000]/10 px-4 py-3 text-sm text-white"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E60000]" strokeWidth={2.5} />
                                        <span>
                                            <span className="font-mono">{email}</span> — Email enregistré.
                                            L'envoi automatique sera activé prochainement.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ton@email.com"
                                            data-testid="coach-email-input"
                                            disabled={submitting}
                                            className="flex-1 border border-white/15 bg-black/40 px-4 py-3 font-mono text-sm text-white placeholder:text-gray-600 focus:border-[#E60000] focus:outline-none disabled:opacity-60"
                                        />
                                        <button
                                            type="submit"
                                            data-testid="coach-email-submit"
                                            disabled={submitting}
                                            className="inline-flex items-center justify-center gap-2 bg-[#E60000] px-6 py-3 font-heading text-base uppercase tracking-wider text-white transition-colors hover:bg-[#FF1A1A] disabled:opacity-60"
                                        >
                                            {submitting ? "Enregistrement…" : "Envoyer"}
                                            {submitting ? null : (
                                                <ArrowRight className="h-4 w-4" strokeWidth={2} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Coaching CTA */}
                    <button
                        type="button"
                        data-testid="coach-coaching-btn"
                        onClick={() =>
                            toast("Coaching bientôt disponible", {
                                description: "Inscris-toi par email pour être prévenu en avant-première.",
                            })
                        }
                        className="group relative flex w-full items-center justify-between gap-4 border border-white/15 bg-black/60 p-6 text-left transition-all hover:border-white/40"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/20 bg-white/5 text-white">
                                <Sparkles className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div>
                                <div className="font-heading text-2xl uppercase tracking-tight text-white">
                                    Coaching personnalisé
                                </div>
                                <div className="mt-1 text-sm text-gray-400">
                                    Suivi 1-to-1 avec nutritionniste sportif certifié
                                </div>
                            </div>
                        </div>
                        <span className="hidden items-center gap-2 border border-[#E60000]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#E60000] sm:inline-flex">
                            Bientôt
                        </span>
                    </button>
                </div>
            </div>
        </motion.section>
    );
};
