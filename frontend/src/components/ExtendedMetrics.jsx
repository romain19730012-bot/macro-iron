import { motion } from "framer-motion";
import {
    Activity,
    Droplet,
    Percent,
    Scale,
    Target,
    Timer,
    Weight,
    Flame,
    BarChart3,
    Info,
} from "lucide-react";

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
};

export const ExtendedMetrics = ({ plan, profile }) => {
    if (!plan?.body || !profile) return null;
    const { body } = plan;
    const isInput = body.bodyFatSource === "input";

    const cards = [
        {
            icon: <Scale className="h-4 w-4" strokeWidth={1.5} />,
            label: "IMC",
            value: `${body.bmi}`,
            unit: "kg/m²",
            note: body.bmiCategory,
            testid: "metric-bmi",
        },
        {
            icon: <Percent className="h-4 w-4" strokeWidth={1.5} />,
            label: isInput ? "Masse grasse" : "Masse grasse estimée",
            value: `${body.bodyFat}`,
            unit: "%",
            note: isInput ? "Renseigné" : "Estimation Deurenberg",
            accent: isInput,
            testid: "metric-bodyfat",
        },
        {
            icon: <Flame className="h-4 w-4" strokeWidth={1.5} />,
            label: "Masse grasse",
            value: `${body.fatMass}`,
            unit: "kg",
            note: `${body.bodyFat} % × ${profile.weight} kg`,
            testid: "metric-fatmass",
        },
        {
            icon: <Activity className="h-4 w-4" strokeWidth={1.5} />,
            label: "Masse maigre",
            value: `${body.leanMassReal ?? body.leanMass}`,
            unit: "kg",
            note: isInput ? "Calculée du poids - graisse" : "Estimation Boer",
            testid: "metric-leanmass",
        },
        {
            icon: <Droplet className="h-4 w-4" strokeWidth={1.5} />,
            label: "Hydratation",
            value: `${body.water}`,
            unit: "L / jour",
            note: `${profile.workouts} séances/sem`,
            testid: "metric-water",
        },
        {
            icon: <Target className="h-4 w-4" strokeWidth={1.5} />,
            label: "Poids cible",
            value: `${body.targetWeight}`,
            unit: "kg",
            note: plan.meta.goalLabel,
            accent: true,
            testid: "metric-target-weight",
        },
        {
            icon: <Percent className="h-4 w-4" strokeWidth={1.5} />,
            label: "BF cible",
            value: `${body.targetBodyFat ?? "—"}`,
            unit: "%",
            note: `${body.targetFatMass ?? "—"} kg de graisse`,
            testid: "metric-target-bodyfat",
        },
        {
            icon: <Timer className="h-4 w-4" strokeWidth={1.5} />,
            label: "Estimation",
            value: body.weeksToGoal > 0 ? `${body.weeksToGoal}` : "—",
            unit: body.weeksToGoal > 0 ? "semaines" : "stable",
            note: body.weeksToGoal > 0 ? "Vitesse réaliste" : "Maintien",
            testid: "metric-weeks",
        },
        {
            icon: <Weight className="h-4 w-4" strokeWidth={1.5} />,
            label: "Poids actuel",
            value: `${profile.weight}`,
            unit: "kg",
            note: `vs ${body.targetWeight} kg cible`,
            testid: "metric-current-weight",
        },
        {
            icon: <BarChart3 className="h-4 w-4" strokeWidth={1.5} />,
            label: "Niveau performance",
            value: plan.meta.activityLabel.split(" ")[0].toUpperCase(),
            unit: plan.meta.sportLabel,
            note: "Profil sportif",
            testid: "metric-perf-level",
        },
    ];

    return (
        <motion.section
            data-testid="extended-metrics"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            transition={{ staggerChildren: 0.06 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#E60000]" />
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#E60000]">
                    Analyse corporelle
                </span>
            </div>
            <h3 className="font-heading text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
                Tableau de bord complet
            </h3>

            {/* Source banner */}
            <div
                data-testid="bf-source-banner"
                className={`flex items-start gap-3 border px-4 py-3 ${
                    isInput
                        ? "border-[#E60000]/40 bg-[#E60000]/10"
                        : "border-white/15 bg-background/40"
                }`}
            >
                <Info
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isInput ? "text-[#E60000]" : "text-muted-foreground"
                    }`}
                    strokeWidth={1.5}
                />
                <span className="text-xs leading-relaxed text-foreground">
                    {isInput
                        ? "Calcul basé sur ton taux de masse grasse renseigné — précision optimale."
                        : "Taux de masse grasse estimé automatiquement, résultat indicatif. Pour un calcul plus précis, renseigne ton taux."}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-4">
                {cards.map((c) => (
                    <motion.div
                        key={c.testid}
                        variants={item}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        data-testid={c.testid}
                        className="group relative bg-card p-6 transition-colors hover:bg-[#1A1A1A]"
                    >
                        {c.accent ? (
                            <div className="absolute left-0 top-0 h-0.5 w-full bg-[#E60000]" />
                        ) : null}
                        <div className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-[#E60000]">
                            {c.icon}
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                                {c.label}
                            </span>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="font-heading text-4xl uppercase leading-none tracking-tight text-foreground sm:text-5xl">
                                {c.value}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                {c.unit}
                            </span>
                        </div>
                        <div className="mt-2 truncate text-xs text-muted-foreground">
                            {c.note}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};
