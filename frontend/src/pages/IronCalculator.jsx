import { useEffect, useRef, useState } from "react";
import { Hero } from "../components/Hero";
import { CalculatorForm } from "../components/CalculatorForm";
import { ResultDashboard } from "../components/ResultDashboard";
import { ThemeToggle } from "../components/ThemeToggle";
import { computePlan } from "../lib/calculations";
import { downloadPlanPDF } from "../lib/pdf";
import { toast } from "sonner";

const STORAGE_KEY = "iron-calculator-last";

export default function IronCalculator({ theme, toggleTheme }) {
    const [profile, setProfile] = useState(null);
    const [plan, setPlan] = useState(null);

    const formRef = useRef(null);
    const resultRef = useRef(null);

    // Restore last calculation from localStorage on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved && saved.profile && saved.plan) {
                setProfile(saved.profile);
                setPlan(saved.plan);
            }
        } catch {
            // ignore corrupt local storage
        }
    }, []);

    const handleCompute = (formProfile) => {
        const computed = computePlan(formProfile);
        setProfile(formProfile);
        setPlan(computed);
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ profile: formProfile, plan: computed })
        );
        toast.success("Plan généré", {
            description: `${computed.targetCalories} kcal / jour calculées`,
        });
        // Smooth scroll to result
        setTimeout(() => {
            resultRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 80);
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
        toast.success("PDF téléchargé");
    };

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header bar */}
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
                        <span className="inline-flex h-8 w-8 items-center justify-center bg-[#E60000] font-heading text-lg uppercase text-white">
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

                {/* Form section */}
                <section
                    ref={formRef}
                    data-testid="form-section"
                    className="relative border-b border-white/10"
                >
                    <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
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
                                </ul>
                            </div>
                            <div className="lg:col-span-2">
                                <CalculatorForm
                                    onCompute={handleCompute}
                                    onReset={handleReset}
                                    defaults={profile}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section
                    ref={resultRef}
                    data-testid="result-section"
                    className="relative"
                >
                    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                        <div className="mb-10">
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
                        </div>

                        {plan && profile ? (
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
