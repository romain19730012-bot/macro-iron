import { useState } from "react";
import { ACTIVITY_FACTORS, GOALS, SPORTS } from "../lib/calculations";
import { Calculator, RefreshCcw, Info, Percent } from "lucide-react";
import { Slider } from "./ui/slider";

const initial = {
    gender: "male",
    age: 28,
    height: 178,
    weight: 75,
    activity: "active",
    goal: "maintenance",
    workouts: 4,
    sport: "musculation",
    bodyFatKnown: false,
    bodyFatInput: 18,
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
        if (form.bodyFatKnown) {
            const bf = Number(form.bodyFatInput);
            if (!Number.isFinite(bf) || bf < 3 || bf > 60)
                e.bodyFatInput = "Taux entre 3 % et 60 %";
        }
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
            bodyFatKnown: !!form.bodyFatKnown,
            bodyFatInput: form.bodyFatKnown ? +form.bodyFatInput : null,
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

            {/* Composition corporelle */}
            <div className="border border-white/10 bg-card p-6 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[#E60000]">
                            <Percent className="h-4 w-4" strokeWidth={1.5} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                                Composition corporelle
                            </span>
                        </div>
                        <h3 className="mt-2 font-heading text-3xl uppercase tracking-tight text-foreground">
                            Taux de masse grasse
                        </h3>
                        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            <span>
                                Pour un calcul plus précis, renseigne ton taux de masse grasse.
                                Si tu ne le connais pas, l'application utilisera une estimation indicative.
                            </span>
                        </p>
                    </div>

                    {/* Toggle "Je ne connais pas mon taux" */}
                    <label
                        className="inline-flex shrink-0 cursor-pointer select-none items-center gap-3 border border-white/10 bg-background/50 px-4 py-2 transition-colors hover:border-white/30"
                        data-testid="bf-unknown-label"
                    >
                        <input
                            type="checkbox"
                            data-testid="bf-unknown-toggle"
                            checked={!form.bodyFatKnown}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, bodyFatKnown: !e.target.checked }))
                            }
                            className="h-4 w-4 cursor-pointer accent-[#E60000]"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                            Je ne connais pas mon taux
                        </span>
                    </label>
                </div>

                {form.bodyFatKnown ? (
                    <div className="mt-6" data-testid="bf-input-block">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                                    Ton taux
                                </div>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="font-heading text-6xl uppercase tracking-tight text-foreground">
                                        {Number.isFinite(+form.bodyFatInput)
                                            ? (+form.bodyFatInput).toFixed(1)
                                            : "—"}
                                    </span>
                                    <span className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center border border-white/10 bg-background px-3">
                                <input
                                    type="number"
                                    step="0.1"
                                    min={3}
                                    max={60}
                                    value={form.bodyFatInput}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setForm((p) => ({
                                            ...p,
                                            bodyFatInput: v === "" ? "" : Number(v),
                                        }));
                                        const n = Number(v);
                                        if (
                                            v !== "" &&
                                            (!Number.isFinite(n) || n < 3 || n > 60)
                                        ) {
                                            setErrors((p) => ({
                                                ...p,
                                                bodyFatInput: "Taux entre 3 % et 60 %",
                                            }));
                                        } else {
                                            setErrors((p) => ({ ...p, bodyFatInput: undefined }));
                                        }
                                    }}
                                    data-testid="bf-input"
                                    className="w-20 bg-transparent py-3 text-center font-heading text-2xl uppercase tracking-wider text-foreground focus:outline-none"
                                />
                                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    %
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Slider
                                data-testid="bf-slider"
                                min={5}
                                max={45}
                                step={0.5}
                                value={[
                                    Math.min(
                                        45,
                                        Math.max(5, +form.bodyFatInput || 18)
                                    ),
                                ]}
                                onValueChange={(v) => {
                                    const next = +v[0];
                                    setForm((p) => ({ ...p, bodyFatInput: next }));
                                    setErrors((p) => ({ ...p, bodyFatInput: undefined }));
                                }}
                            />
                            <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                <span>5 %</span>
                                <span>25 %</span>
                                <span>45 %</span>
                            </div>
                        </div>
                        {errors.bodyFatInput ? (
                            <p className="mt-3 text-xs text-[#E60000]">
                                {errors.bodyFatInput}
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <div
                        data-testid="bf-estimated-block"
                        className="mt-5 border border-dashed border-white/15 bg-background/40 p-4 text-xs text-muted-foreground"
                    >
                        <span className="font-bold uppercase tracking-[0.2em] text-[#E60000]">
                            Estimation auto
                        </span>{" "}
                        — l'application utilisera la formule Deurenberg basée sur ton âge,
                        ta taille et ton poids. Résultat indicatif.
                    </div>
                )}
            </div>

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
