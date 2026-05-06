import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
    "Initialisation du moteur nutritionnel",
    "Analyse du profil sportif",
    "Calcul du métabolisme basal",
    "Estimation de la dépense journalière",
    "Optimisation des macronutriments",
    "Génération du plan personnalisé",
];

export const LoadingScreen = ({ visible, onDone }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!visible) {
            setStep(0);
            return;
        }
        const total = 1100; // ms total
        const each = total / STEPS.length;
        const timer = setInterval(() => {
            setStep((s) => {
                if (s >= STEPS.length - 1) {
                    clearInterval(timer);
                    setTimeout(() => onDone?.(), 250);
                    return s;
                }
                return s + 1;
            });
        }, each);
        return () => clearInterval(timer);
    }, [visible, onDone]);

    return (
        <AnimatePresence>
            {visible ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
                    data-testid="ai-loader"
                >
                    {/* Grid pattern */}
                    <div className="absolute inset-0 grid-pattern opacity-50" aria-hidden />
                    {/* Red glow */}
                    <div
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E60000] opacity-20 blur-[140px]"
                        aria-hidden
                    />
                    {/* Scanline */}
                    <motion.div
                        aria-hidden
                        className="pointer-events-none absolute left-0 right-0 h-px bg-[#E60000]/60 shadow-[0_0_24px_4px_#E60000]"
                        initial={{ top: "10%" }}
                        animate={{ top: "90%" }}
                        transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    />

                    <div className="relative z-10 mx-auto w-full max-w-xl px-6 text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="mx-auto inline-flex h-20 w-20 items-center justify-center bg-[#E60000]"
                        >
                            <span className="font-heading text-5xl uppercase text-white">
                                IC
                            </span>
                        </motion.div>

                        <div className="mt-8 flex items-center justify-center gap-3">
                            <span className="h-px w-10 bg-[#E60000]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E60000]">
                                AI Nutrition Engine
                            </span>
                            <span className="h-px w-10 bg-[#E60000]" />
                        </div>

                        <h2 className="mt-6 font-heading text-4xl uppercase tracking-tight text-white sm:text-5xl">
                            Calcul en cours
                        </h2>

                        {/* Progress bar */}
                        <div className="mx-auto mt-10 h-px w-full max-w-md bg-white/10">
                            <motion.div
                                className="h-full bg-[#E60000]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>

                        {/* Steps */}
                        <ul className="mx-auto mt-8 max-w-md space-y-2 text-left">
                            {STEPS.map((s, i) => {
                                const active = i === step;
                                const done = i < step;
                                return (
                                    <li
                                        key={s}
                                        className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                                            active
                                                ? "text-[#E60000]"
                                                : done
                                                ? "text-white/70"
                                                : "text-white/25"
                                        }`}
                                    >
                                        <span className="font-mono">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="flex-1">{s}</span>
                                        {active ? (
                                            <motion.span
                                                className="inline-block h-2 w-2 bg-[#E60000]"
                                                animate={{ opacity: [1, 0.2, 1] }}
                                                transition={{ duration: 0.6, repeat: Infinity }}
                                            />
                                        ) : done ? (
                                            <span className="text-white/70">✓</span>
                                        ) : (
                                            <span className="opacity-30">·</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};
