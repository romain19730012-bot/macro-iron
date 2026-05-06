import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const COLORS = {
    protein: "#E60000",
    carbs: "#FFFFFF",
    fat: "#404040",
};

export const MacroChart = ({ macros, totalCalories }) => {
    const data = [
        { name: "Protéines", value: macros.protein.kcal, key: "protein" },
        { name: "Glucides", value: macros.carbs.kcal, key: "carbs" },
        { name: "Lipides", value: macros.fat.kcal, key: "fat" },
    ];

    return (
        <div className="relative h-64 w-full" data-testid="macro-chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        startAngle={90}
                        endAngle={450}
                        stroke="none"
                        paddingAngle={2}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.key}
                                fill={COLORS[entry.key]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: "#0A0A0A",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 0,
                            fontFamily: "Inter, sans-serif",
                            fontSize: 12,
                            color: "#fff",
                        }}
                        formatter={(value) => [`${value} kcal`]}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Total
                </div>
                <div className="font-heading text-3xl uppercase tracking-tight text-foreground">
                    {totalCalories}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                    kcal / j
                </div>
            </div>
        </div>
    );
};
