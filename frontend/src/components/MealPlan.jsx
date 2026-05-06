import { motion } from "framer-motion";
import { Coffee, Sun, Apple, Moon, CheckCircle2, AlertCircle } from "lucide-react";

const ICONS = {
    breakfast: Coffee,
    lunch: Sun,
    snack: Apple,
    dinner: Moon,
};

export const MealPlan = ({ plan }) => {
    if (!plan?.macros || !plan?.mealPlan?.meals) return null;
    const { meals, totals, target, deltas, withinTolerance } = plan.mealPlan;

    return (
        <motion.section
            data-testid="meal-plan"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <div className="flex items-center gap-3">
                    <span className="h-px w-10 bg-[#E60000]" />
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                        Plan alimentaire exemple
                    </span>
                </div>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
                    Une journée type pour ton objectif
                </h3>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    Adapté pour <span className="text-foreground">{plan.meta.goalLabel.toLowerCase()}</span> ·{" "}
                    {target.kcal} kcal cibles · {target.p} P / {target.c} G / {target.f} L (g)
                </p>
            </div>

            {/* Meals */}
            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-2">
                {meals.map((m, idx) => {
                    const Icon = ICONS[m.key];
                    return (
                        <motion.div
                            key={m.key}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: idx * 0.07 }}
                            data-testid={`meal-${m.key}`}
                            className="group relative overflow-hidden bg-card p-6 transition-colors hover:bg-[#1A1A1A] md:p-8"
                        >
                            <div className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-[#E60000] transition-transform duration-300 group-hover:scale-y-100" />

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-[#E60000]">
                                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                                            Repas {String(idx + 1).padStart(2, "0")}
                                        </span>
                                    </div>
                                    <h4 className="mt-2 font-heading text-3xl uppercase tracking-tight text-foreground">
                                        {m.name}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <div className="font-heading text-4xl uppercase tracking-tight text-[#E60000]">
                                        {m.kcal}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                        kcal
                                    </div>
                                </div>
                            </div>

                            {/* Macros pills */}
                            <div className="mt-5 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
                                <MacroPill label="P" value={m.protein} color="#E60000" />
                                <MacroPill label="G" value={m.carbs} color="#FFFFFF" />
                                <MacroPill label="L" value={m.fat} color="#666666" />
                            </div>

                            {/* Foods */}
                            <ul className="mt-6 space-y-2">
                                {m.foods.map((f, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm"
                                    >
                                        <span className="flex-1 truncate text-foreground">{f.food}</span>
                                        <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                            {f.qty}
                                        </span>
                                        <span className="ml-3 hidden font-mono text-[10px] tracking-wider text-[#E60000] sm:inline-block">
                                            {f.kcal} kcal
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}
            </div>

            {/* TOTAL DU PLAN */}
            <div
                data-testid="meal-plan-total"
                className="border border-white/10 bg-card p-6 md:p-8"
            >
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="h-px w-10 bg-[#E60000]" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                                Total du plan alimentaire
                            </span>
                        </div>
                        <h4 className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground">
                            Vérification cible vs réel
                        </h4>
                    </div>
                    <div
                        className={`flex items-center gap-2 border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] ${
                            withinTolerance
                                ? "border-[#E60000]/40 bg-[#E60000]/10 text-[#E60000]"
                                : "border-yellow-500/40 bg-yellow-500/5 text-yellow-500"
                        }`}
                        data-testid="meal-plan-tolerance"
                    >
                        {withinTolerance ? (
                            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                        ) : (
                            <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
                        )}
                        {withinTolerance ? "Dans la tolérance" : "Léger écart"}
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-4">
                    <TotalCell
                        label="Calories"
                        actual={totals.kcal}
                        target={target.kcal}
                        delta={deltas.kcal}
                        unit="kcal"
                        testid="total-kcal"
                    />
                    <TotalCell
                        label="Protéines"
                        actual={totals.p}
                        target={target.p}
                        delta={deltas.p}
                        unit="g"
                        testid="total-p"
                        accent="#E60000"
                    />
                    <TotalCell
                        label="Glucides"
                        actual={totals.c}
                        target={target.c}
                        delta={deltas.c}
                        unit="g"
                        testid="total-c"
                        accent="#FFFFFF"
                    />
                    <TotalCell
                        label="Lipides"
                        actual={totals.f}
                        target={target.f}
                        delta={deltas.f}
                        unit="g"
                        testid="total-f"
                        accent="#666666"
                    />
                </div>
            </div>
        </motion.section>
    );
};

const MacroPill = ({ label, value, color }) => (
    <div className="flex items-center justify-center gap-2 bg-card px-3 py-2">
        <span className="h-2 w-2 shrink-0" style={{ backgroundColor: color }} aria-hidden />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-foreground">{value} g</span>
    </div>
);

const TotalCell = ({ label, actual, target, delta, unit, testid, accent }) => {
    const sign = delta > 0 ? "+" : "";
    return (
        <div className="bg-card p-5" data-testid={testid}>
            <div className="flex items-center gap-2">
                {accent ? (
                    <span className="h-2 w-2 shrink-0" style={{ backgroundColor: accent }} aria-hidden />
                ) : null}
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    {label}
                </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-3xl uppercase tracking-tight text-foreground">
                    {actual}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {unit}
                </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground">
                <span>cible {target}</span>
                <span
                    className={
                        delta === 0
                            ? "text-muted-foreground"
                            : Math.abs(delta) <= (unit === "kcal" ? Math.max(50, target * 0.05) : 15)
                            ? "text-[#E60000]"
                            : "text-yellow-500"
                    }
                >
                    Δ {sign}{delta}
                </span>
            </div>
        </div>
    );
};
