import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hero } from "../components/Hero";
import { CalculatorForm } from "../components/CalculatorForm";
import { ResultDashboard } from "../components/ResultDashboard";
import { ThemeToggle } from "../components/ThemeToggle";
import { LoadingScreen } from "../components/LoadingScreen";
import { computePlan } from "../lib/calculations";
import { downloadPlanPDF } from "../lib/pdf";
import { toast } from "sonner";

const STORAGE_KEY = "iron-calculator-last";
const STORAGE_VERSION = 2;

/**
 * A plan is "complete" only if it carries all the fields the new dashboard
 * requires. Older versions saved a smaller object and would crash downstream
 * components (ExtendedMetrics, MealPlan, ProgressionChart, …).
 */
const isPlanComplete = (plan) =>
    plan &&
    typeof plan === "object" &&
    plan.macros &&
    plan.macros.protein &&
    plan.macros.carbs &&
    plan.macros.fat &&
    plan.body &&
    typeof plan.body.bmi === "number" &&
    Array.isArray(plan.progression) &&
    plan.meta;

const isProfileValid = (p) =>
    p &&
    typeof p === "object" &&
    p.gender &&
    Number.isFinite(+p.age) &&
    Number.isFinite(+p.height) &&
    Number.isFinite(+p.weight) &&
    p.activity &&
    p.goal &&
    p.sport &&
    Number.isFinite(+p.workouts);

export default function IronCalculator({ theme, toggleTheme }) {
    const [profile, setProfile] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pendingResult, setPendingResult] = useState(null);

    const formRef = useRef(null);
    const resultRef = useRef(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (!saved || !isProfileValid(saved.profile)) {
                // Corrupt or pre-v2 entry without a valid profile → discard
                localStorage.removeItem(STORAGE_KEY);
                return;
            }

            // Always restore the profile so the form keeps its values
            setProfile(saved.profile);

            // Migration: if the stored plan is incomplete (older schema or
            // version bump), recompute from the saved profile so the new
            // dashboard never receives a partial object.
            if (saved.version !== STORAGE_VERSION || !isPlanComplete(saved.plan)) {
                const recomputed = computePlan(saved.profile);
                setPlan(recomputed);
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        version: STORAGE_VERSION,
                        profile: saved.profile,
                        plan: recomputed,
                    })
                );
                return;
            }

            setPlan(saved.plan);
        } catch {
            // Any parse / shape error → wipe the entry, never crash
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {
                /* ignore */
            }
        }
    }, []);

    const handleCompute = (formProfile) => {
        const computed = computePlan(formProfile);
        // Save what to apply once loader finishes
        setPendingResult({ profile: formProfile, plan: computed });
        setLoading(true);
    };

    const onLoaderDone = () => {
        if (!pendingResult) {
            setLoading(false);
            return;
        }
        setProfile(pendingResult.profile);
        setPlan(pendingResult.plan);
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    version: STORAGE_VERSION,
                    profile: pendingResult.profile,
                    plan: pendingResult.plan,
                })
            );
        } catch {
            /* storage may be full / blocked — non fatal */
        }
        setLoading(false);
        setPendingResult(null);
        toast.success("Plan généré", {
            description: `${pendingResult.plan.targetCalories} kcal / jour calculées`,
        });
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
    };

    const handleReset = () => {
        setProfile(null);
        setPlan(null);
        localStorage.removeItem(STORAGE_KEY);
        toast("Formulaire réinitialisé");
    };

    const handleRecalculate = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDownload = () => {
        if (!profile || !plan) return;
        downloadPlanPDF(profile, plan);
        toast.success("PDF Premium téléchargé", {
            description: "3 pages: dashboard, plan repas, recommandations",
        });
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <LoadingScreen visible={loading} onDone={onLoaderDone} />

            {/* Header */}
            <header
                data-testid="app-header"
                className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl"
            >
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <a
                        href="#top"
                        className="flex items-center gap-3"
                        data-testid="brand-logo"
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center bg-[#E60000] font-heading text-lg uppercase text-white shadow-[0_0_18px_rgba(230,0,0,0.6)]">
                            IC
                        </span>
                        <span className="font-heading text-xl uppercase tracking-wider text-foreground">
                            Iron Calculator
                        </span>
                    </a>
                    <nav className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={scrollToForm}
                            data-testid="header-calc-btn"
                            className="hidden border border-white/15 px-4 py-2 font-heading text-sm uppercase tracking-wider text-foreground transition-colors hover:border-[#E60000] hover:text-[#E60000] sm:inline-flex"
                        >
                            Calculer
                        </button>
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </nav>
                </div>
            </header>

            <main id="top">
                <Hero onScrollToForm={scrollToForm} />

                {/* Form */}
                <section
                    ref={formRef}
                    data-testid="form-section"
                    className="relative border-b border-white/10"
                >
                    <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-3"
                        >
                            <div className="lg:col-span-1">
                                <div className="flex items-center gap-3">
                                    <span className="h-px w-12 bg-[#E60000]" />
                                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                                        Étape 01 — Profil
                                    </span>
                                </div>
                                <h2 className="mt-4 font-heading text-5xl uppercase leading-none tracking-tight text-foreground sm:text-6xl">
                                    Renseigne
                                    <br />
                                    <span className="text-[#E60000]">ton profil.</span>
                                </h2>
                                <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                                    Tous les calculs s'exécutent localement dans ton
                                    navigateur. Aucune donnée n'est envoyée à un serveur.
                                </p>
                                <ul className="mt-6 space-y-2 font-mono text-xs text-muted-foreground">
                                    <li>→ Mifflin-St Jeor (BMR)</li>
                                    <li>→ TDEE × facteur d'activité</li>
                                    <li>→ Macros adaptées au sportif</li>
                                    <li>→ IMC, masse maigre, bodyfat, hydratation</li>
                                    <li>→ Plan repas + entraînement</li>
                                </ul>
                            </div>
                            <div className="lg:col-span-2">
                                <CalculatorForm
                                    onCompute={handleCompute}
                                    onReset={handleReset}
                                    defaults={profile}
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Results */}
                <section
                    ref={resultRef}
                    data-testid="result-section"
                    className="relative"
                >
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <div className="flex items-center gap-3">
                                <span className="h-px w-12 bg-[#E60000]" />
                                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                                    Étape 02 — Résultats
                                </span>
                            </div>
                            <h2 className="mt-4 font-heading text-5xl uppercase leading-none tracking-tight text-foreground sm:text-6xl">
                                Ton plan
                                <br />
                                <span className="text-[#E60000]">de combat.</span>
                            </h2>
                        </motion.div>

                        {plan && profile && isPlanComplete(plan) && isProfileValid(profile) ? (
                            <ResultDashboard
                                profile={profile}
                                plan={plan}
                                onRecalculate={handleRecalculate}
                                onDownload={handleDownload}
                            />
                        ) : (
                            <EmptyState onScrollToForm={scrollToForm} />
                        )}
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    );
}

const EmptyState = ({ onScrollToForm }) => (
    <div
        data-testid="empty-result"
        className="border border-dashed border-white/15 bg-card/50 p-16 text-center"
    >
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center border border-[#E60000]/40 bg-[#E60000]/10 text-[#E60000]">
            <span className="font-heading text-xl">02</span>
        </div>
        <h3 className="mt-6 font-heading text-3xl uppercase tracking-tight text-foreground">
            En attente de ton profil
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Renseigne tes données dans le formulaire ci-dessus pour générer ton
            plan calorique personnalisé.
        </p>
        <button
            type="button"
            onClick={onScrollToForm}
            className="mt-8 inline-flex items-center gap-3 bg-[#E60000] px-6 py-3 font-heading text-base uppercase tracking-wider text-white transition-colors hover:bg-[#FF1A1A]"
        >
            Aller au formulaire
        </button>
    </div>
);

const Footer = () => (
    <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center bg-[#E60000] font-heading text-lg uppercase text-white">
                    IC
                </span>
                <div>
                    <div className="font-heading text-base uppercase tracking-wider text-foreground">
                        Iron Calculator
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        Performance · Précision · Discipline
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                À titre indicatif — consultez un professionnel pour un suivi nutritionnel personnalisé.
            </p>
        </div>
    </footer>
);
