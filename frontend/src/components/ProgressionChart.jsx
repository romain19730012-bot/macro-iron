import { motion } from "framer-motion";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceDot,
} from "recharts";

export const ProgressionChart = ({ plan, profile }) => {
    const data = plan.progression;
    const last = data[data.length - 1];
    const stable = plan.body.weeksToGoal === 0;
    const yMin = Math.floor(Math.min(...data.map((d) => d.weight)) - 1);
    const yMax = Math.ceil(Math.max(...data.map((d) => d.weight)) + 1);

    return (
        <motion.section
            data-testid="progression-chart"
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
                        Progression estimée
                    </span>
                </div>
                <h3 className="mt-3 font-heading text-3xl uppercase tracking-tight text-foreground sm:text-4xl">
                    Ta trajectoire
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {stable
                        ? "Avec un objectif de maintien, ton poids reste stable. Surveille tes performances pour valider."
                        : `Avec une vitesse réaliste, tu peux atteindre ${plan.body.targetWeight} kg en environ ${plan.body.weeksToGoal} semaines.`}
                </p>
            </div>

            <div className="border border-white/10 bg-card p-6 md:p-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Stats cluster */}
                    <div className="space-y-px lg:col-span-1">
                        <StatRow
                            label="Aujourd'hui"
                            value={`${profile.weight} kg`}
                            accent
                        />
                        <StatRow
                            label="Cible"
                            value={`${plan.body.targetWeight} kg`}
                        />
                        <StatRow
                            label="Écart"
                            value={`${(plan.body.targetWeight - profile.weight).toFixed(1)} kg`}
                        />
                        <StatRow
                            label="Durée estimée"
                            value={
                                plan.body.weeksToGoal > 0
                                    ? `${plan.body.weeksToGoal} sem.`
                                    : "Stable"
                            }
                        />
                        <StatRow
                            label="Vitesse"
                            value={
                                plan.body.weeksToGoal > 0
                                    ? `${(
                                          Math.abs(
                                              plan.body.targetWeight -
                                                  profile.weight
                                          ) / plan.body.weeksToGoal
                                      ).toFixed(2)} kg/sem.`
                                    : "—"
                            }
                        />
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-2">
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={250}>
                                <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                                    <defs>
                                        <linearGradient id="redArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#E60000" stopOpacity={0.55} />
                                            <stop offset="100%" stopColor="#E60000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="rgba(255,255,255,0.5)"
                                        tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[yMin, yMax]}
                                        stroke="rgba(255,255,255,0.5)"
                                        tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={36}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#0A0A0A",
                                            border: "1px solid rgba(255,255,255,0.15)",
                                            borderRadius: 0,
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 12,
                                            color: "#fff",
                                        }}
                                        formatter={(v) => [`${v} kg`, "Poids estimé"]}
                                        labelFormatter={(l) => `Semaine ${l.replace("S", "")}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#E60000"
                                        strokeWidth={2}
                                        fill="url(#redArea)"
                                        activeDot={{ r: 5, fill: "#E60000", stroke: "#fff", strokeWidth: 1 }}
                                    />
                                    <ReferenceDot
                                        x={last.label}
                                        y={last.weight}
                                        r={6}
                                        fill="#E60000"
                                        stroke="#fff"
                                        strokeWidth={1}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

const StatRow = ({ label, value, accent }) => (
    <div
        className={`flex items-center justify-between border border-white/10 px-4 py-3 ${
            accent ? "bg-[#E60000]/10" : "bg-background/40"
        }`}
    >
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            {label}
        </span>
        <span
            className={`font-heading text-2xl uppercase tracking-tight ${
                accent ? "text-[#E60000]" : "text-foreground"
            }`}
        >
            {value}
        </span>
    </div>
);
