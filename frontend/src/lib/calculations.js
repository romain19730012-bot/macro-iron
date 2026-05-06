/**
 * IRON CALCULATOR — Nutrition engine v4
 *
 *  - BMR (Mifflin-St Jeor) × facteur d'activité = TDEE
 *  - Calorie adjustment is BODY-FAT aware (tiered per goal)
 *  - Protein = (2.4 / 2.0 / 1.9 g per kg lean mass) clamped 1.4–3.0 g/kg total
 *  - Fat     = max(50 g, 0.8 g/kg total weight)
 *  - Carbs   = remaining calories
 *  - Warnings flag dangerous configurations
 *  - Meal plan solved against the daily macro target via per-meal 3×3 system
 */

export const ACTIVITY_FACTORS = {
    sedentary: { factor: 1.2, label: "Sédentaire" },
    light: { factor: 1.375, label: "Légèrement actif" },
    active: { factor: 1.55, label: "Actif" },
    very_active: { factor: 1.725, label: "Très actif" },
    intense: { factor: 1.9, label: "Sportif intensif" },
};

export const GOALS = {
    weight_loss: { label: "Perte de poids", direction: -1, weeklyKg: 0.5 },
    maintenance: { label: "Maintien", direction: 0, weeklyKg: 0 },
    bulk: { label: "Prise de masse", direction: 1, weeklyKg: 0.3 },
    cut: { label: "Sèche sportive", direction: -1, weeklyKg: 0.6 },
};

export const SPORTS = {
    musculation: "Musculation",
    crossfit: "Crossfit",
    running: "Course à pied",
    team: "Sport collectif",
    endurance: "Endurance",
    mixed: "Mixte",
};

/* ---------------- Core formulas ---------------- */

export const computeBMR = (gender, weightKg, heightCm, ageYears) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return gender === "male" ? base + 5 : base - 161;
};

export const computeBMI = (weightKg, heightCm) => {
    const m = heightCm / 100;
    return +(weightKg / (m * m)).toFixed(1);
};

export const bmiCategory = (bmi) => {
    if (bmi < 18.5) return "Maigreur";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Surpoids";
    return "Obésité";
};

export const computeLeanMass = (gender, weightKg, heightCm) => {
    const lm =
        gender === "male"
            ? 0.407 * weightKg + 0.267 * heightCm - 19.2
            : 0.252 * weightKg + 0.473 * heightCm - 48.3;
    return +Math.max(0, lm).toFixed(1);
};

export const computeBodyFat = (gender, weightKg, heightCm, age) => {
    const bmi = computeBMI(weightKg, heightCm);
    const sex = gender === "male" ? 1 : 0;
    const bf = 1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4;
    return +Math.max(3, bf).toFixed(1);
};

export const clampBodyFat = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return +Math.max(3, Math.min(60, n)).toFixed(1);
};

export const computeWaterNeeds = (weightKg, workoutsPerWeek) => {
    const baseMl = 35 * weightKg;
    const trainingExtraMl = (workoutsPerWeek / 7) * 500;
    return +((baseMl + trainingExtraMl) / 1000).toFixed(1);
};

export const computeTargetWeight = (gender, weightKg, heightCm, goalKey) => {
    const m = heightCm / 100;
    const idealBMI = gender === "male" ? 22.5 : 21.5;
    const idealWeight = +(idealBMI * m * m).toFixed(1);
    const goal = GOALS[goalKey];
    if (goal.direction === 0) return weightKg;
    if (goal.direction === -1) return +Math.max(idealWeight, weightKg - 5).toFixed(1);
    return +(weightKg + 5).toFixed(1);
};

export const computeWeeksToGoal = (weightKg, targetWeight, goalKey) => {
    const goal = GOALS[goalKey];
    if (goal.weeklyKg === 0) return 0;
    const diff = Math.abs(targetWeight - weightKg);
    return Math.max(1, Math.round(diff / goal.weeklyKg));
};

export const buildProgressionCurve = (weightKg, targetWeight, weeks) => {
    if (weeks <= 0) {
        return [
            { week: 0, weight: weightKg, label: "S0" },
            { week: 4, weight: weightKg, label: "S4" },
            { week: 8, weight: weightKg, label: "S8" },
            { week: 12, weight: weightKg, label: "S12" },
        ];
    }
    const total = Math.min(weeks, 24);
    const step = total / 8;
    const data = [];
    for (let i = 0; i <= 8; i++) {
        const w = i * step;
        const progress = 1 - Math.pow(1 - w / total, 1.4);
        const weight = +(weightKg + (targetWeight - weightKg) * progress).toFixed(1);
        data.push({ week: Math.round(w), weight, label: `S${Math.round(w)}` });
    }
    return data;
};

export const targetBodyFatFor = (gender, currentBF, goalKey) => {
    const isMale = gender === "male";
    const floor = isMale ? 8 : 16;
    const cutFloor = isMale ? 10 : 18;
    const bulkCeil = isMale ? 18 : 26;
    let target = currentBF;
    if (goalKey === "weight_loss") target = Math.max(currentBF - 4, floor + 4);
    else if (goalKey === "cut") target = Math.max(currentBF - 6, cutFloor);
    else if (goalKey === "bulk") target = Math.min(currentBF + 2, bulkCeil);
    return +target.toFixed(1);
};

/**
 * Body-fat–aware calorie adjustment (% of TDEE).
 * Tiers per the product spec.
 */
export const calorieAdjustmentFor = (goalKey, bodyFat) => {
    const bf = bodyFat;
    if (goalKey === "weight_loss") {
        if (bf < 10) return -0.05;
        if (bf < 15) return -0.10;
        if (bf < 25) return -0.15;
        if (bf < 35) return -0.20;
        return -0.25;
    }
    if (goalKey === "cut") {
        if (bf < 8) return -0.05;
        if (bf < 12) return -0.07;
        if (bf < 18) return -0.12;
        if (bf < 25) return -0.18;
        return -0.22;
    }
    if (goalKey === "bulk") {
        if (bf < 10) return 0.12;
        if (bf < 15) return 0.08;
        if (bf < 20) return 0.05;
        return 0.02; // recomposition advised
    }
    return 0; // maintenance
};

/** Protein per kg lean mass, tuned per goal */
export const proteinPerLeanFor = (goalKey) => {
    if (goalKey === "weight_loss" || goalKey === "cut") return 2.4;
    if (goalKey === "bulk") return 1.9;
    return 2.0; // maintenance
};

/* ---------------- Warnings ---------------- */

export const buildWarnings = (profile, plan) => {
    const w = [];
    const bf = plan.body.bodyFat;
    const goal = profile.goal;

    if (bf < 7) {
        w.push({
            key: "bf-low",
            severity: "warning",
            text:
                "Taux de masse grasse très bas. Toute perte est déconseillée sans suivi médical.",
        });
    }
    if (bf > 30 && (goal === "weight_loss" || goal === "cut")) {
        w.push({
            key: "bf-high-deficit",
            severity: "info",
            text:
                "Déficit progressif recommandé. Priorité à la régularité et à la santé avant l'agressivité.",
        });
    }
    if (goal === "bulk" && bf > 20) {
        w.push({
            key: "bulk-high-bf",
            severity: "warning",
            text:
                "Prise de masse déconseillée à ce niveau de bodyfat. Vise plutôt une recomposition (maintien + entraînement).",
        });
    }
    if (goal === "cut" && bf < 8) {
        w.push({
            key: "cut-very-low",
            severity: "warning",
            text:
                "Sèche déconseillée à un taux aussi bas — privilégie la performance et le maintien hormonal.",
        });
    }
    if (goal === "maintenance") {
        if (bf > 25) {
            w.push({
                key: "maint-recomp",
                severity: "info",
                text:
                    "Stratégie maintien-recomposition conseillée : entraîne la force et augmente progressivement l'activité.",
            });
        } else if (bf < 12) {
            w.push({
                key: "maint-perf",
                severity: "info",
                text:
                    "Maintien performance : optimise les calories autour des séances pour préserver tes acquis.",
            });
        } else {
            w.push({
                key: "maint-stable",
                severity: "info",
                text:
                    "Stabilisation : surveille tes performances en salle et ton tour de taille comme indicateurs.",
            });
        }
    }
    return w;
};

/* ---------------- Plan ---------------- */

export const computePlan = (profile) => {
    const { gender, age, height, weight, activity, goal, workouts } = profile;

    const bmr = computeBMR(gender, weight, height, age);
    const factor = ACTIVITY_FACTORS[activity].factor;
    const tdee = bmr * factor;

    /* Body composition */
    const inputBF = profile.bodyFatKnown ? clampBodyFat(profile.bodyFatInput) : null;
    const estimatedBF = computeBodyFat(gender, weight, height, age);
    const bodyFat = inputBF ?? estimatedBF;
    const bodyFatSource = inputBF != null ? "input" : "estimated";

    const fatMass = +((weight * bodyFat) / 100).toFixed(1);
    const leanMassReal = +(weight - fatMass).toFixed(1);
    const leanMassBoer = computeLeanMass(gender, weight, height);

    /* Body-fat aware calorie adjustment */
    const adjustmentPct = calorieAdjustmentFor(goal, bodyFat);
    const adjustmentKcal = Math.round(tdee * adjustmentPct);
    const targetCalories = Math.round(tdee + adjustmentKcal);

    /* Macros */
    const proteinPerKgLean = proteinPerLeanFor(goal);
    const proteinFromLean = proteinPerKgLean * leanMassReal;
    const proteinG = Math.round(
        Math.max(1.4 * weight, Math.min(3.0 * weight, proteinFromLean))
    );
    const fatG = Math.max(50, Math.round(0.8 * weight));
    const proteinKcal = proteinG * 4;
    const fatKcal = fatG * 9;
    const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
    const carbsG = Math.round(remainingKcal / 4);
    const carbsKcal = carbsG * 4;

    /* Other */
    const bmi = computeBMI(weight, height);
    const water = computeWaterNeeds(weight, workouts);
    const targetWeight = computeTargetWeight(gender, weight, height, goal);
    const targetBodyFat = targetBodyFatFor(gender, bodyFat, goal);
    const targetFatMass = +((targetWeight * targetBodyFat) / 100).toFixed(1);
    const targetLeanMass = +(targetWeight - targetFatMass).toFixed(1);
    const weeksToGoal = computeWeeksToGoal(weight, targetWeight, goal);
    const progression = buildProgressionCurve(weight, targetWeight, weeksToGoal);

    const plan = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
        macros: {
            protein: { grams: proteinG, kcal: proteinKcal },
            carbs: { grams: carbsG, kcal: carbsKcal },
            fat: { grams: fatG, kcal: fatKcal * 1 },
        },
        body: {
            bmi,
            bmiCategory: bmiCategory(bmi),
            leanMass: leanMassBoer,
            bodyFat,
            bodyFatSource,
            fatMass,
            leanMassReal,
            water,
            targetWeight,
            targetBodyFat,
            targetFatMass,
            targetLeanMass,
            adjustmentPct,
            adjustmentKcal,
            weeksToGoal,
        },
        progression,
        meta: {
            activityLabel: ACTIVITY_FACTORS[activity].label,
            goalLabel: GOALS[goal].label,
            sportLabel: SPORTS[profile.sport],
        },
    };
    plan.warnings = buildWarnings(profile, plan);
    plan.mealPlan = buildMealPlan(plan, profile);
    return plan;
};

/* ---------------- Tips ---------------- */

export const tipsForGoal = (goal, sport) => {
    const common = [
        "Hydrate-toi : minimum 35 ml/kg de poids de corps par jour.",
        "Privilégie 4 à 5 repas quotidiens pour stabiliser ton énergie.",
        "Dors 7 à 9 h par nuit : la récupération conditionne la performance.",
    ];
    const goalSpecific = {
        weight_loss: [
            "Pèse-toi 1×/semaine, pas tous les jours, pour suivre la tendance.",
            "Augmente les protéines à 2.6 g/kg masse maigre si la faim devient un frein.",
            "Garde au moins 50 g de lipides/jour pour les hormones.",
            "Vise une perte progressive en conservant ta masse maigre — la balance ne suffit pas.",
        ],
        maintenance: [
            "Surveille tes performances en salle : c'est le meilleur indicateur.",
            "Adapte légèrement tes glucides selon les jours d'entraînement.",
            "Mange varié : 30 plantes différentes/semaine pour le microbiote.",
            "Stabilise ton poids ET ta composition corporelle, pas seulement la balance.",
        ],
        bulk: [
            "Privilégie une prise de masse propre : +0,3 kg/semaine maximum.",
            "Ajoute 30 g de glucides post-training pour optimiser la recharge.",
            "Ne néglige pas les légumes — la digestion détermine l'assimilation.",
            "Surveille ton taux de gras : si bodyfat ↗ trop, repasse en maintien-recomp.",
        ],
        cut: [
            "Maintiens des protéines hautes pour préserver ta masse musculaire.",
            "Concentre les glucides autour de l'entraînement.",
            "Intègre 2-3 séances de cardio modéré par semaine.",
            "Re-mesure ton bodyfat tous les 15 jours pour valider la trajectoire.",
        ],
    };
    const sportSpecific = {
        musculation: "Consomme 30-40 g de protéines dans l'heure post-séance.",
        crossfit: "Privilégie des glucides complexes 2 h avant la WOD.",
        running: "Vise 5-7 g de glucides/kg les jours de longue sortie.",
        team: "Recharge en glucides + électrolytes après chaque match.",
        endurance: "Ajoute du sodium (1-2 g/h d'effort) sur les sorties longues.",
        mixed: "Adapte les glucides à l'intensité réelle de la séance du jour.",
    };
    return [...common, ...goalSpecific[goal], sportSpecific[sport]];
};

/* ---------------- Training Plan ---------------- */

export const buildTrainingPlan = (goal, sport, workouts) => {
    const goalIntro = {
        weight_loss:
            "Combinaison force + cardio modéré pour préserver le muscle tout en créant un déficit énergétique.",
        maintenance:
            "Maintiens ton volume actuel et travaille la qualité technique de chaque mouvement.",
        bulk:
            "Privilégie la surcharge progressive : ajoute du poids ou des reps chaque semaine.",
        cut:
            "Conserve l'intensité, baisse le volume si la récup est dégradée. Le muscle ne se construit pas en sèche.",
    };
    const cardio = {
        weight_loss: "3 séances de 30-45 min de zone 2 (60-70 % FCmax) + 1 HIIT court.",
        maintenance: "1-2 séances de cardio léger pour la santé cardiovasculaire.",
        bulk: "1 séance courte de cardio (15-20 min) pour la récupération.",
        cut: "2-3 séances de zone 2 + 1 HIIT en fin de séance de muscu.",
    };
    return {
        intro: goalIntro[goal],
        sessions: Math.max(3, Math.min(6, workouts || 4)),
        cardio: cardio[goal],
        recovery: [
            "1-2 jours OFF complets par semaine.",
            "Mobilité 10 min après chaque séance.",
            "Marche quotidienne : minimum 8 000 pas / jour.",
        ],
        sleep: "7-9 h, fenêtre régulière. Le sommeil profond conditionne la testostérone et la GH.",
        hydration:
            "Boire toutes les 15-20 min pendant l'effort. Ajouter du sodium au-delà de 90 min.",
        proteinTiming:
            "Répartir les protéines sur 4 prises (≥ 30 g par prise) pour maximiser la synthèse.",
    };
};

/* ============================================================
 *                       MEAL PLAN ENGINE
 * ============================================================ */

// Per-100g macros for every food the templates can use.
// `fmt` formats the displayed quantity nicely (qty in grams).
const FOOD_DB = {
    /* Protein anchors */
    chicken: { label: "Poulet grillé", per100: { kcal: 165, p: 31, c: 0, f: 3.5 }, min: 90, max: 350, fmt: (q) => `${q} g` },
    turkey: { label: "Dinde grillée", per100: { kcal: 135, p: 30, c: 0, f: 1 }, min: 90, max: 350, fmt: (q) => `${q} g` },
    leanSteak: { label: "Steak haché 5 %", per100: { kcal: 130, p: 25, c: 0, f: 5 }, min: 90, max: 300, fmt: (q) => `${q} g` },
    salmon: { label: "Saumon", per100: { kcal: 200, p: 22, c: 0, f: 13 }, min: 90, max: 250, fmt: (q) => `${q} g` },
    cod: { label: "Cabillaud", per100: { kcal: 80, p: 18, c: 0, f: 0.5 }, min: 100, max: 320, fmt: (q) => `${q} g` },
    tuna: { label: "Thon", per100: { kcal: 130, p: 28, c: 0, f: 2 }, min: 80, max: 250, fmt: (q) => `${q} g` },
    eggs: {
        label: "Œufs entiers",
        per100: { kcal: 155, p: 13, c: 1, f: 11 },
        min: 50,
        max: 200,
        fmt: (q) => `${Math.round(q / 50)} œuf${Math.round(q / 50) > 1 ? "s" : ""} (${q} g)`,
    },
    whey: {
        label: "Whey isolate",
        per100: { kcal: 380, p: 80, c: 5, f: 4 },
        min: 20,
        max: 60,
        fmt: (q) => `${q} g (${Math.round(q / 30)} dose${Math.round(q / 30) > 1 ? "s" : ""})`,
    },
    skyr: { label: "Skyr nature", per100: { kcal: 65, p: 11, c: 4, f: 0.2 }, min: 100, max: 350, fmt: (q) => `${q} g` },
    cottage: { label: "Fromage blanc 0 %", per100: { kcal: 50, p: 8, c: 4, f: 0 }, min: 100, max: 350, fmt: (q) => `${q} g` },
    greekYog: { label: "Yaourt grec nature", per100: { kcal: 90, p: 8, c: 4, f: 5 }, min: 100, max: 250, fmt: (q) => `${q} g` },

    /* Carb anchors */
    oats: { label: "Flocons d'avoine", per100: { kcal: 380, p: 13, c: 60, f: 7 }, min: 30, max: 130, fmt: (q) => `${q} g` },
    rice: { label: "Riz basmati cuit", per100: { kcal: 130, p: 2.5, c: 28, f: 0.5 }, min: 80, max: 350, fmt: (q) => `${q} g` },
    pasta: { label: "Pâtes complètes cuites", per100: { kcal: 130, p: 5, c: 25, f: 1 }, min: 80, max: 350, fmt: (q) => `${q} g` },
    quinoa: { label: "Quinoa cuit", per100: { kcal: 120, p: 4, c: 21, f: 2 }, min: 80, max: 350, fmt: (q) => `${q} g` },
    sweetPotato: { label: "Patate douce", per100: { kcal: 90, p: 1.6, c: 21, f: 0.1 }, min: 80, max: 400, fmt: (q) => `${q} g` },
    potato: { label: "Pommes de terre", per100: { kcal: 80, p: 2, c: 17, f: 0.1 }, min: 80, max: 400, fmt: (q) => `${q} g` },
    wholeBread: { label: "Pain complet", per100: { kcal: 250, p: 10, c: 45, f: 3 }, min: 30, max: 200, fmt: (q) => `${q} g` },
    banana: { label: "Banane", per100: { kcal: 90, p: 1, c: 23, f: 0 }, min: 80, max: 250, fmt: (q) => `${q} g (~${Math.max(1, Math.round(q / 110))} fruit)` },
    berries: { label: "Fruits rouges", per100: { kcal: 50, p: 1, c: 11, f: 0 }, min: 60, max: 250, fmt: (q) => `${q} g` },
    apple: { label: "Pomme / fruit de saison", per100: { kcal: 55, p: 0.3, c: 14, f: 0 }, min: 80, max: 250, fmt: (q) => `${q} g (~${Math.max(1, Math.round(q / 150))} fruit)` },

    /* Fat anchors */
    oliveOil: {
        label: "Huile d'olive",
        per100: { kcal: 884, p: 0, c: 0, f: 100 },
        min: 0,
        max: 50,
        fmt: (q) => `${q} g (~${Math.max(0, Math.round(q / 14))} c. à soupe)`,
    },
    peanutButter: { label: "Beurre de cacahuète", per100: { kcal: 588, p: 25, c: 20, f: 50 }, min: 5, max: 50, fmt: (q) => `${q} g` },
    almonds: { label: "Amandes", per100: { kcal: 580, p: 21, c: 22, f: 50 }, min: 10, max: 60, fmt: (q) => `${q} g` },
    walnuts: { label: "Noix", per100: { kcal: 654, p: 15, c: 14, f: 65 }, min: 10, max: 50, fmt: (q) => `${q} g` },
    avocado: {
        label: "Avocat",
        per100: { kcal: 160, p: 2, c: 9, f: 15 },
        min: 30,
        max: 200,
        fmt: (q) => `${q} g (~${(q / 200).toFixed(1).replace(".0", "")} avocat)`,
    },

    /* Fixed (low-cal vegetables / staples) */
    veggies: { label: "Légumes verts (brocoli, haricots…)", per100: { kcal: 30, p: 2, c: 5, f: 0.3 }, fmt: () => "200 g" },
    saladMix: { label: "Salade verte + crudités", per100: { kcal: 20, p: 1, c: 3, f: 0.2 }, fmt: () => "à volonté" },
};

const TEMPLATES = {
    breakfast: [
        { proteinKey: "eggs", carbKey: "oats", fatKey: "peanutButter", fixed: [{ key: "banana", qty: 110 }] },
        { proteinKey: "skyr", carbKey: "berries", fatKey: "almonds", fixed: [] },
        { proteinKey: "eggs", carbKey: "wholeBread", fatKey: "avocado", fixed: [] },
        { proteinKey: "whey", carbKey: "oats", fatKey: "peanutButter", fixed: [{ key: "banana", qty: 110 }] },
    ],
    lunch: [
        { proteinKey: "chicken", carbKey: "rice", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
        { proteinKey: "turkey", carbKey: "sweetPotato", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
        { proteinKey: "leanSteak", carbKey: "pasta", fatKey: "oliveOil", fixed: [{ key: "saladMix", qty: 100 }] },
        { proteinKey: "tuna", carbKey: "quinoa", fatKey: "oliveOil", fixed: [{ key: "saladMix", qty: 100 }] },
        { proteinKey: "salmon", carbKey: "rice", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
    ],
    snack: [
        { proteinKey: "whey", carbKey: "apple", fatKey: "almonds", fixed: [] },
        { proteinKey: "skyr", carbKey: "berries", fatKey: "almonds", fixed: [] },
        { proteinKey: "cottage", carbKey: "berries", fatKey: "walnuts", fixed: [] },
        { proteinKey: "eggs", carbKey: "apple", fatKey: "walnuts", fixed: [] },
        { proteinKey: "greekYog", carbKey: "berries", fatKey: "walnuts", fixed: [] },
    ],
    dinner: [
        { proteinKey: "cod", carbKey: "potato", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
        { proteinKey: "salmon", carbKey: "rice", fatKey: "oliveOil", fixed: [{ key: "saladMix", qty: 100 }] },
        { proteinKey: "eggs", carbKey: "wholeBread", fatKey: "avocado", fixed: [{ key: "veggies", qty: 200 }] },
        { proteinKey: "chicken", carbKey: "sweetPotato", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
        { proteinKey: "leanSteak", carbKey: "potato", fatKey: "oliveOil", fixed: [{ key: "veggies", qty: 200 }] },
    ],
};

/** Cramer's rule for a 3×3 system A·x = b */
const solve3x3 = (a, b) => {
    const det = (m) =>
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(a);
    if (Math.abs(D) < 1e-6) return null;
    const colReplace = (i) => a.map((row, r) => row.map((v, c) => (c === i ? b[r] : v)));
    return [det(colReplace(0)) / D, det(colReplace(1)) / D, det(colReplace(2)) / D];
};

const macrosForFood = (key, qty) => {
    const f = FOOD_DB[key];
    const k = qty / 100;
    return {
        kcal: f.per100.kcal * k,
        p: f.per100.p * k,
        c: f.per100.c * k,
        f: f.per100.f * k,
    };
};

const round5 = (x) => Math.max(0, Math.round(x / 5) * 5);

const buildOneMeal = (slotKey, slotName, template, target) => {
    // Fixed contributions
    let fp = 0,
        fc = 0,
        ff = 0;
    template.fixed.forEach((it) => {
        const m = macrosForFood(it.key, it.qty);
        fp += m.p;
        fc += m.c;
        ff += m.f;
    });
    const remP = target.p - fp;
    const remC = target.c - fc;
    const remF = target.f - ff;

    const A = FOOD_DB[template.proteinKey].per100;
    const B = FOOD_DB[template.carbKey].per100;
    const C = FOOD_DB[template.fatKey].per100;
    // Per-gram contribution = per100 / 100
    const matrix = [
        [A.p / 100, B.p / 100, C.p / 100],
        [A.c / 100, B.c / 100, C.c / 100],
        [A.f / 100, B.f / 100, C.f / 100],
    ];
    const sol = solve3x3(matrix, [remP, remC, remF]);

    let qP, qC, qF;
    if (!sol) {
        qP = 150;
        qC = 100;
        qF = 15;
    } else {
        qP = sol[0];
        qC = sol[1];
        qF = sol[2];
    }
    qP = round5(Math.max(FOOD_DB[template.proteinKey].min, Math.min(FOOD_DB[template.proteinKey].max, qP)));
    qC = round5(Math.max(FOOD_DB[template.carbKey].min, Math.min(FOOD_DB[template.carbKey].max, qC)));
    qF = round5(Math.max(FOOD_DB[template.fatKey].min, Math.min(FOOD_DB[template.fatKey].max, qF)));

    const items = [
        { key: template.proteinKey, qty: qP },
        { key: template.carbKey, qty: qC },
        { key: template.fatKey, qty: qF },
        ...template.fixed,
    ];

    let kcal = 0,
        p = 0,
        c = 0,
        f = 0;
    items.forEach((it) => {
        const m = macrosForFood(it.key, it.qty);
        kcal += m.kcal;
        p += m.p;
        c += m.c;
        f += m.f;
    });

    return {
        key: slotKey,
        name: slotName,
        kcal: Math.round(kcal),
        protein: Math.round(p),
        carbs: Math.round(c),
        fat: Math.round(f),
        foods: items.map((it) => {
            const def = FOOD_DB[it.key];
            const m = macrosForFood(it.key, it.qty);
            return {
                food: def.label,
                qty: def.fmt(it.qty),
                kcal: Math.round(m.kcal),
                p: Math.round(m.p),
                c: Math.round(m.c),
                f: Math.round(m.f),
            };
        }),
    };
};

/**
 * Builds a meal plan that targets the daily macros computed in `plan`.
 * Returns: { meals, totals, target, deltas, withinTolerance }
 */
export const buildMealPlan = (plan, profile) => {
    const split = { breakfast: 0.25, lunch: 0.35, snack: 0.10, dinner: 0.30 };
    const slotName = {
        breakfast: "Petit-déjeuner",
        lunch: "Déjeuner",
        snack: "Collation",
        dinner: "Dîner",
    };
    const tP = plan.macros.protein.grams;
    const tC = plan.macros.carbs.grams;
    const tF = plan.macros.fat.grams;

    // Deterministic rotation seed from profile so users see varied templates
    // but a stable result for the same input.
    const seed =
        Math.abs(
            (profile.weight | 0) * 13 +
                (profile.workouts | 0) * 7 +
                (profile.age | 0) * 5 +
                (profile.height | 0)
        ) || 0;

    const meals = ["breakfast", "lunch", "snack", "dinner"].map((slot, i) => {
        const variants = TEMPLATES[slot];
        const tpl = variants[(seed + i * 3) % variants.length];
        return buildOneMeal(slot, slotName[slot], tpl, {
            p: tP * split[slot],
            c: tC * split[slot],
            f: tF * split[slot],
        });
    });

    const totals = meals.reduce(
        (acc, m) => ({
            kcal: acc.kcal + m.kcal,
            p: acc.p + m.protein,
            c: acc.c + m.carbs,
            f: acc.f + m.fat,
        }),
        { kcal: 0, p: 0, c: 0, f: 0 }
    );

    const target = { kcal: plan.targetCalories, p: tP, c: tC, f: tF };
    const deltas = {
        kcal: totals.kcal - target.kcal,
        p: totals.p - target.p,
        c: totals.c - target.c,
        f: totals.f - target.f,
    };
    const withinTolerance =
        Math.abs(deltas.kcal) <= Math.max(50, target.kcal * 0.05) &&
        Math.abs(deltas.p) <= 10 &&
        Math.abs(deltas.c) <= 15 &&
        Math.abs(deltas.f) <= 10;

    return { meals, totals, target, deltas, withinTolerance };
};
