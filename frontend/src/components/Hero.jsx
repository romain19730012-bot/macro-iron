import { ChevronDown, Flame } from "lucide-react";

const HERO_BG =
    "https://images.unsplash.com/photo-1709315957145-a4bad1feef28?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxkYXJrJTIwZml0bmVzcyUyMHRyYWluaW5nJTIwYXRobGV0ZXxlbnwwfHx8fDE3NzgwOTQwMTN8MA&ixlib=rb-4.1.0&q=85";

export const Hero = ({ onScrollToForm }) => {
    return (
        <section
            data-testid="hero-section"
            className="relative min-h-[88vh] w-full overflow-hidden border-b border-white/10"
        >
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${HERO_BG})` }}
                aria-hidden
            />
            {/* Heavy black overlay */}
            <div className="absolute inset-0 bg-black/75" aria-hidden />
            {/* Grid pattern */}
            <div className="absolute inset-0 grid-pattern opacity-60" aria-hidden />
            {/* Red glow */}
            <div
                className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#E60000] opacity-20 blur-[120px]"
                aria-hidden
            />

            <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-24">
                {/* Eyebrow */}
                <div className="mb-6 flex items-center gap-3 animate-fade-up">
                    <span className="h-px w-12 bg-[#E60000]" />
                    <span className="text-xs font-bold tracking-[0.3em] text-[#E60000]">
                        PERFORMANCE NUTRITION ENGINE
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="font-heading text-6xl uppercase leading-[0.9] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[10rem] animate-fade-up delay-100">
                    Iron
                    <br />
                    <span className="text-[#E60000]">Calculator</span>
                </h1>

                {/* Sub */}
                <p className="mt-8 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg animate-fade-up delay-200">
                    Calcule en quelques secondes tes besoins caloriques, ta dépense
                    journalière et la répartition exacte de tes macros. Conçu pour
                    les athlètes qui ne laissent rien au hasard.
                </p>

                {/* CTAs */}
                <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up delay-300">
                    <button
                        type="button"
                        onClick={onScrollToForm}
                        data-testid="hero-start-btn"
                        className="group inline-flex items-center gap-3 bg-[#E60000] px-8 py-4 font-heading text-xl uppercase tracking-wider text-white transition-all hover:bg-[#FF1A1A]"
                    >
                        <Flame className="h-5 w-5" strokeWidth={2} />
                        Lancer le calcul
                    </button>
                    <button
                        type="button"
                        onClick={onScrollToForm}
                        className="inline-flex items-center gap-3 border border-white/20 bg-transparent px-8 py-4 font-heading text-xl uppercase tracking-wider text-white transition-colors hover:border-white/60"
                        data-testid="hero-secondary-btn"
                    >
                        En savoir plus
                        <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Stats strip */}
                <div className="mt-16 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4 animate-fade-up delay-400">
                    {[
                        { k: "Mifflin-St Jeor", v: "Formule médicale" },
                        { k: "5 niveaux", v: "Activité" },
                        { k: "4 objectifs", v: "Adaptés sportifs" },
                        { k: "PDF", v: "Plan exportable" },
                    ].map((s) => (
                        <div
                            key={s.k}
                            className="bg-black/90 p-5 backdrop-blur-sm"
                        >
                            <div className="font-heading text-2xl uppercase tracking-tight text-white sm:text-3xl">
                                {s.k}
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                                {s.v}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
