import { useState } from "react";
import { ACTIVITY_FACTORS, GOALS, SPORTS } from "../lib/calculations";
import { Calculator, RefreshCcw } from "lucide-react";

const initial = {
    gender: "male",
    age: 28,
    height: 178,
    weight: 75,
    activity: "active",
    goal: "maintenance",
    workouts: 4,
    sport: "musculation",
};

export const CalculatorForm = ({ onCompute, onReset, defaults }) => {
    const [form, setForm] = useState(defaults || initial);
    const [errors, setErrors] = useState({});

    const update = (key) => (e) => {
        const value = e.target ? e.target.value : e;
        setForm((p) => ({ ...p, [key]: value }));
    };

    const handleNumber = (key, min, max) => (e) => {
        const v = e.target.value;
        const n = v === "" ? "" : Number(v);
        setForm((p) => ({ ...p, [key]: n }));
        if (n !== "" && (n < min || n > max)) {
            setErrors((p) => ({ ...p, [key]: `Valeur entre ${min} et ${max}` }));
        } else {
            setErrors((p) => ({ ...p, [key]: undefined }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.age || form.age < 14 || form.age > 90) e.age = "14 — 90 ans";
        if (!form.height || form.height < 120 || form.height > 230) e.height = "120 — 230 cm";
        if (!form.weight || form.weight < 35 || form.weight > 250) e.weight = "35 — 250 kg";
        if (form.workouts === "" || form.workouts < 0 || form.workouts > 14)
            e.workouts = "0 — 14 / sem";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        onCompute({
            ...form,
            age: +form.age,
            height: +form.height,
            weight: +form.weight,
            workouts: +form.workouts,
        });
    };

    return (
        <form
            onSubmit={submit}
            data-testid="calculator-form"
            className="space-y-10"
        >
            {/* Gender */}
            <Field label="Sexe" id="gender">
                <div className="grid grid-cols-2 gap-px border border-white/10 dark:border-white/10 bg-white/10 dark:bg-white/10">
                    {[
                        { v: "male", l: "Homme" },
                        { v: "female", l: "Femme" },
                    ].map((opt) => {
                        const selected = form.gender === opt.v;
                        return (
                            <button
                                type="button"
                                key={opt.v}
                                data-testid={`gender-${opt.v}-btn`}
                                onClick={() => update("gender")(opt.v)}
                                className={`px-6 py-4 font-heading text-lg uppercase tracking-wider transition-colors ${
                                    selected
                                        ? "bg-[#E60000] text-white"
                                        : "bg-card text-foreground hover:bg-muted"
                                }`}
                            >
                                {opt.l}
                            </button>
                        );
                    })}
                </div>
            </Field>

            {/* Numeric grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <NumberField
                    label="Âge"
                    suffix="ans"
                    id="age"
                    value={form.age}
                    onChange={handleNumber("age", 14, 90)}
                    error={errors.age}
                />
                <NumberField
                    label="Taille"
                    suffix="cm"
                    id="height"
                    value={form.height}
                    onChange={handleNumber("height", 120, 230)}
                    error={errors.height}
                />
                <NumberField
                    label="Poids"
                    suffix="kg"
                    id="weight"
                    value={form.weight}
                    onChange={handleNumber("weight", 35, 250)}
                    error={errors.weight}
                />
            </div>

            {/* Activity */}
            <Field label="Niveau d'activité" id="activity">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => {
                        const selected = form.activity === k;
                        return (
                            <button
                                key={k}
                                type="button"
                                data-testid={`activity-${k}-btn`}
                                onClick={() => update("activity")(k)}
                                className={`border px-4 py-4 text-left transition-colors ${
                                    selected
                                        ? "border-[#E60000] bg-[#E60000]/10"
                                        : "border-white/10 bg-card hover:border-white/30"
                                }`}
                            >
                                <div className="font-heading text-base uppercase tracking-wider text-foreground">
                                    {v.label}
                                </div>
                                <div className="mt-1 font-mono text-xs text-muted-foreground">
                                    × {v.factor}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Field>

            {/* Goal */}
            <Field label="Objectif" id="goal">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(GOALS).map(([k, v]) => {
                        const selected = form.goal === k;
                        const sign =
                            v.adjustment > 0
                                ? `+${(v.adjustment * 100).toFixed(0)}%`
                                : v.adjustment < 0
                                ? `${(v.adjustment * 100).toFixed(0)}%`
                                : "0%";
                        return (
                            <button
                                key={k}
                                type="button"
                                data-testid={`goal-${k}-btn`}
                                onClick={() => update("goal")(k)}
                                className={`border px-4 py-5 text-left transition-colors ${
                                    selected
                                        ? "border-[#E60000] bg-[#E60000]/10"
                                        : "border-white/10 bg-card hover:border-white/30"
                                }`}
                            >
                                <div className="font-heading text-lg uppercase tracking-wider text-foreground">
                                    {v.label}
                                </div>
                                <div className="mt-1 font-mono text-xs text-[#E60000]">
                                    {sign} kcal
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Field>

            {/* Workouts + Sport */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <NumberField
                    label="Entraînements / semaine"
                    suffix="séances"
                    id="workouts"
                    value={form.workouts}
                    onChange={handleNumber("workouts", 0, 14)}
                    error={errors.workouts}
                />
                <Field label="Sport principal" id="sport">
                    <select
                        id="sport"
                        data-testid="sport-select"
                        value={form.sport}
                        onChange={(e) => update("sport")(e.target.value)}
                        className="w-full border border-white/10 bg-card px-4 py-4 font-heading text-lg uppercase tracking-wider text-foreground transition-colors focus:border-[#E60000] focus:outline-none"
                    >
                        {Object.entries(SPORTS).map(([k, l]) => (
                            <option key={k} value={k}>
                                {l}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-8">
                <button
                    type="submit"
                    data-testid="calculate-btn"
                    className="group inline-flex items-center gap-3 bg-[#E60000] px-10 py-5 font-heading text-xl uppercase tracking-wider text-white transition-all hover:bg-[#FF1A1A]"
                >
                    <Calculator className="h-5 w-5" strokeWidth={2} />
                    Calculer mon plan
                </button>
                <button
                    type="button"
                    data-testid="reset-form-btn"
                    onClick={() => {
                        setForm(initial);
                        setErrors({});
                        if (onReset) onReset();
                    }}
                    className="inline-flex items-center gap-3 border border-white/20 bg-transparent px-8 py-5 font-heading text-xl uppercase tracking-wider text-foreground transition-colors hover:border-white/60"
                >
                    <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
                    Réinitialiser
                </button>
            </div>
        </form>
    );
};

const Field = ({ label, id, children }) => (
    <div>
        <label
            htmlFor={id}
            className="mb-3 block text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground"
        >
            {label}
        </label>
        {children}
    </div>
);

const NumberField = ({ label, id, value, onChange, suffix, error }) => (
    <Field label={label} id={id}>
        <div
            className={`flex items-center border border-white/10 bg-card px-4 transition-colors focus-within:border-[#E60000] ${
                error ? "border-[#E60000]" : ""
            }`}
        >
            <input
                id={id}
                data-testid={`input-${id}`}
                type="number"
                value={value}
                onChange={onChange}
                className="w-full bg-transparent py-4 font-heading text-2xl uppercase tracking-wider text-foreground focus:outline-none"
            />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {suffix}
            </span>
        </div>
        {error ? (
            <p className="mt-2 text-xs text-[#E60000]">{error}</p>
        ) : null}
    </Field>
);
