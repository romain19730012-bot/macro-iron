import { motion } from "framer-motion";
import { buildTrainingPlan } from "../lib/calculations";
import { Dumbbell, HeartPulse, Moon, Droplet, Timer } from "lucide-react";

export const TrainingPlan = ({ profile, plan }) => {
    if (!profile || !plan?.body || !plan?.meta) return null;
    const tp = buildTrainingPlan(profile.goal, profile.sport, profile.workouts);

    const blocks = [
        {
            icon: <Dumbbell className="h-4 w-4" strokeWidth={1.5} />,
            title: "Fréquence idéale",
            value: `${tp.sessions} séances`,
            text: `Par semaine, principalement orientées ${plan.meta.sportLabel.toLowerCase()}.`,
            testid: "train-frequency",
        },
        {
            icon: <HeartPulse className="h-4 w-4" strokeWidth={1.5} />,
            title: "Cardio recommandé",
            value: "Zone 2",
            text: tp.cardio,
            testid: "train-cardio",
        },
        {
            icon: <Moon className="h-4 w-4" strokeWidth={1.5} />,
            title: "Sommeil",
            value: "7-9 h",
            text: tp.sleep,
            testid: "train-sleep",
        },
        {
            icon: <Droplet className="h-4 w-4" strokeWidth={1.5} />,
            title: "Hydratation",
            value: `${plan.body.water} L`,
            text: tp.hydration,
            testid: "train-hydration",
        },
        {
            icon: <Timer className="h-4 w-4" strokeWidth={1.5} />,
            title: "Timing protéines",
            value: "4× / jour",
            text: tp.proteinTiming,
            testid: "train-protein",
        },
    ];

    return (
        <motion.section
            data-testid="training-plan"
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
                        Recommandations entraînement
                    </span>
                </div>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
                    Discipline & récupération
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {tp.intro}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
                {blocks.map((b, i) => (
                    <motion.div
                        key={b.title}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        data-testid={b.testid}
                        className="group bg-card p-6 transition-colors hover:bg-[#1A1A1A]"
                    >
                        <div className="flex items-center gap-2 text-[#E60000]">
                            {b.icon}
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                                {b.title}
                            </span>
                        </div>
                        <div className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground">
                            {b.value}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            {b.text}
                        </p>
                    </motion.div>
                ))}

                {/* Recovery checklist */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                    data-testid="train-recovery"
                    className="bg-card p-6 md:col-span-2 xl:col-span-3"
                >
                    <div className="flex items-center gap-2 text-[#E60000]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                            Récupération
                        </span>
                    </div>
                    <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {tp.recovery.map((r, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 border-l-2 border-[#E60000] bg-background/40 px-4 py-3"
                            >
                                <span className="mt-0.5 font-mono text-xs text-[#E60000]">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="text-sm text-muted-foreground">{r}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>
        </motion.section>
    );
};
