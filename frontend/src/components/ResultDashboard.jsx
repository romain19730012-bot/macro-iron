import { motion } from "framer-motion";
import { MacroChart } from "./MacroChart";
import { ExtendedMetrics } from "./ExtendedMetrics";
import { MealPlan } from "./MealPlan";
import { TrainingPlan } from "./TrainingPlan";
import { ProgressionChart } from "./ProgressionChart";
import { CoachMode } from "./CoachMode";
import { tipsForGoal } from "../lib/calculations";
import { Download, RotateCcw, TrendingUp, Activity, Target, Zap, AlertTriangle, Info } from "lucide-react";

export const ResultDashboard = ({ profile, plan, onRecalculate, onDownload }) => {
    if (!plan || !profile || !plan.macros || !plan.body || !plan.meta) {
        return null;
    }
    const tips = tipsForGoal(profile.goal, profile.sport);
    const warnings = plan.warnings || [];

    return (
        <motion.div
            data-testid="result-dashboard"
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-16"
        >
            {/* TOP METRICS */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-3"
            >
                <Metric
                    icon={<Activity className="h-4 w-4" strokeWidth={1.5} />}
                    label="Métabolisme de base"
                    value={`${plan.bmr}`}
                    unit="kcal"
                    note="Mifflin-St Jeor"
                    testid="metric-bmr"
                />
                <Metric
                    icon={<Zap className="h-4 w-4" strokeWidth={1.5} />}
                    label="Dépense journalière"
                    value={`${plan.tdee}`}
                    unit="kcal"
                    note={`${plan.meta.activityLabel}`}
                    testid="metric-tdee"
                />
                <Metric
                    icon={<Target className="h-4 w-4" strokeWidth={1.5} />}
                    label="Calories cibles"
                    value={`${plan.targetCalories}`}
                    unit="kcal"
                    note={`${plan.meta.goalLabel} · ${plan.body.adjustmentPct >= 0 ? "+" : ""}${(plan.body.adjustmentPct * 100).toFixed(0)} %`}
                    accent
                    testid="metric-target"
                />
            </motion.div>

            {/* WARNINGS */}
            {warnings.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    data-testid="warnings-block"
                    className="space-y-2"
                >
                    {warnings.map((w) => (
                        <div
                            key={w.key}
                            data-testid={`warning-${w.key}`}
                            className={`flex items-start gap-3 border px-4 py-3 text-sm ${
                                w.severity === "warning"
                                    ? "border-[#E60000]/50 bg-[#E60000]/10"
                                    : "border-white/15 bg-background/40"
                            }`}
                        >
                            {w.severity === "warning" ? (
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E60000]" strokeWidth={2} />
                            ) : (
                                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                            )}
                            <span className="leading-relaxed text-foreground">{w.text}</span>
                        </div>
                    ))}
                </motion.div>
            ) : null}

            {/* HEADLINE + CHART */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
                }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-5"
            >
                <div className="relative col-span-1 overflow-hidden border border-white/10 bg-card p-8 lg:col-span-3">
                    <div className="absolute inset-0 grid-pattern opacity-30" aria-hidden />
                    <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E60000] opacity-10 blur-[120px]" aria-hidden />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-10 bg-[#E60000]" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                                Plan calorique
                            </span>
                        </div>
                        <div className="mt-6 font-heading text-7xl uppercase leading-none tracking-tight text-foreground sm:text-8xl md:text-[9rem]">
                            <span data-testid="big-calories">{plan.targetCalories}</span>
                        </div>
                        <div className="mt-2 font-heading text-2xl uppercase tracking-wider text-muted-foreground">
                            kcal / jour
                        </div>

                        <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
                            Pour un objectif de{" "}
                            <span className="text-foreground">{plan.meta.goalLabel.toLowerCase()}</span>{" "}
                            avec un profil {plan.meta.activityLabel.toLowerCase()} et un sport
                            principal de type{" "}
                            <span className="text-foreground">{plan.meta.sportLabel.toLowerCase()}</span>.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={onDownload}
                                data-testid="download-pdf-btn"
                                className="group inline-flex items-center gap-3 bg-[#E60000] px-6 py-3 font-heading text-base uppercase tracking-wider text-white transition-all hover:bg-[#FF1A1A] hover:shadow-[0_0_24px_rgba(230,0,0,0.4)]"
                            >
                                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
                                Télécharger mon plan
                            </button>
                            <button
                                type="button"
                                onClick={onRecalculate}
                                data-testid="recalculate-btn"
                                className="inline-flex items-center gap-3 border border-white/20 bg-transparent px-6 py-3 font-heading text-base uppercase tracking-wider text-foreground transition-colors hover:border-white/60"
                            >
                                <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" strokeWidth={1.5} />
                                Recalculer
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 border border-white/10 bg-card p-8 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <span className="h-px w-10 bg-[#E60000]" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                            Macros split
                        </span>
                    </div>
                    <div className="mt-4">
                        <MacroChart macros={plan.macros} totalCalories={plan.targetCalories} />
                    </div>
                    <Legend macros={plan.macros} />
                </div>
            </motion.div>

            {/* MACROS DETAIL */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-3"
            >
                <MacroCard
                    label="Protéines"
                    grams={plan.macros.protein.grams}
                    kcal={plan.macros.protein.kcal}
                    color="#E60000"
                    note="2 g / kg"
                    testid="macro-protein"
                />
                <MacroCard
                    label="Glucides"
                    grams={plan.macros.carbs.grams}
                    kcal={plan.macros.carbs.kcal}
                    color="#FFFFFF"
                    note="Énergie restante"
                    testid="macro-carbs"
                />
                <MacroCard
                    label="Lipides"
                    grams={plan.macros.fat.grams}
                    kcal={plan.macros.fat.kcal}
                    color="#666666"
                    note="0.9 g / kg"
                    testid="macro-fat"
                />
            </motion.div>

            {/* EXTENDED BODY METRICS */}
            <ExtendedMetrics plan={plan} profile={profile} />

            {/* PROGRESSION */}
            <ProgressionChart plan={plan} profile={profile} />

            {/* MEAL PLAN */}
            <MealPlan plan={plan} />

            {/* TRAINING */}
            <TrainingPlan plan={plan} profile={profile} />

            {/* TIPS */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5 }}
                className="border border-white/10 bg-card p-8"
            >
                <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-[#E60000]" strokeWidth={2} />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                        Recommandations
                    </span>
                </div>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
                    Plan d'action nutritionnel
                </h3>
                <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {tips.map((tip, i) => (
                        <li
                            key={i}
                            data-testid={`tip-${i}`}
                            className="flex items-start gap-3 border-l-2 border-[#E60000] bg-background/50 px-4 py-3"
                        >
                            <span className="mt-0.5 font-mono text-xs text-[#E60000]">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-sm leading-relaxed text-muted-foreground">
                                {tip}
                            </span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            {/* COACH MODE */}
            <CoachMode onDownloadPDF={onDownload} />
        </motion.div>
    );
};

const Metric = ({ icon, label, value, unit, note, accent, testid }) => (
    <div
        data-testid={testid}
        className={`relative bg-card p-6 transition-colors hover:bg-[#1A1A1A] ${accent ? "" : ""}`}
    >
        {accent ? (
            <div className="absolute left-0 top-0 h-1 w-full bg-[#E60000]" />
        ) : null}
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="text-xs font-bold uppercase tracking-[0.25em]">
                {label}
            </span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading text-5xl uppercase tracking-tight text-foreground">
                {value}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {unit}
            </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">{note}</div>
    </div>
);

const MacroCard = ({ label, grams, kcal, color, note, testid }) => (
    <div data-testid={testid} className="bg-card p-6 transition-colors hover:bg-[#1A1A1A]">
        <div className="flex items-center gap-3">
            <span
                className="h-3 w-3 shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden
            />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {label}
            </span>
        </div>
        <div className="mt-4 font-heading text-5xl uppercase tracking-tight text-foreground">
            {grams}
            <span className="ml-1 font-mono text-base text-muted-foreground">g</span>
        </div>
        <div className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {kcal} kcal · {note}
        </div>
    </div>
);

const Legend = ({ macros }) => {
    const total =
        macros.protein.kcal + macros.carbs.kcal + macros.fat.kcal;
    const pct = (k) => ((k / total) * 100).toFixed(0);
    return (
        <div className="mt-4 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
            <LegendItem
                color="#E60000"
                label="Prot."
                pct={pct(macros.protein.kcal)}
            />
            <LegendItem
                color="#FFFFFF"
                label="Gluc."
                pct={pct(macros.carbs.kcal)}
            />
            <LegendItem color="#666666" label="Lip." pct={pct(macros.fat.kcal)} />
        </div>
    );
};

const LegendItem = ({ color, label, pct }) => (
    <div className="flex items-center gap-2 bg-card p-3">
        <span
            className="h-2 w-2 shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
        </span>
        <span className="ml-auto font-mono text-xs text-foreground">{pct}%</span>
    </div>
);
