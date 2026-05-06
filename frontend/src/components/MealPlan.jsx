import { motion } from "framer-motion";
import { buildMealPlan } from "../lib/calculations";
import { Coffee, Sun, Apple, Moon } from "lucide-react";

const ICONS = {
    breakfast: Coffee,
    lunch: Sun,
    snack: Apple,
    dinner: Moon,
};

export const MealPlan = ({ plan }) => {
    if (!plan?.macros || typeof plan.targetCalories !== "number") return null;
    const meals = buildMealPlan(plan);

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
                    Adapté pour <span className="text-foreground">{plan.meta.goalLabel.toLowerCase()}</span> · {plan.targetCalories} kcal · {plan.macros.protein.grams} P / {plan.macros.carbs.grams} G / {plan.macros.fat.grams} L (g)
                </p>
            </div>

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
                            {/* Accent line on hover */}
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
                                        className="flex items-center justify-between border-b border-white/5 pb-2 text-sm"
                                    >
                                        <span className="text-foreground">{f.food}</span>
                                        <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                            {f.qty}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}
            </div>
        </motion.section>
    );
};

const MacroPill = ({ label, value, color }) => (
    <div className="flex items-center justify-center gap-2 bg-card px-3 py-2">
        <span
            className="h-2 w-2 shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden
        />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
        </span>
        <span className="font-mono text-xs text-foreground">{value} g</span>
    </div>
);
