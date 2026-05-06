/**
 * IRON CALCULATOR — Nutrition calculation engine
 * Formules:
 *  - BMR via Mifflin-St Jeor
 *  - TDEE = BMR * facteur d'activité
 *  - Calories objectif = TDEE +/- pourcentage selon objectif
 *  - Macros: Protéines 2 g/kg, Lipides 0.9 g/kg, Glucides = reste
 *  - IMC (BMI)
 *  - Masse maigre (Boer)
 *  - Bodyfat estimé (Deurenberg)
 *  - Besoin hydrique : 35 ml/kg + 500 ml/séance
 *  - Poids cible recommandé selon objectif
 *  - Vitesse de progression réaliste (semaines)
 */

export const ACTIVITY_FACTORS = {
    sedentary: { factor: 1.2, label: "Sédentaire" },
    light: { factor: 1.375, label: "Légèrement actif" },
    active: { factor: 1.55, label: "Actif" },
    very_active: { factor: 1.725, label: "Très actif" },
    intense: { factor: 1.9, label: "Sportif intensif" },
};

export const GOALS = {
    weight_loss: { adjustment: -0.15, label: "Perte de poids", direction: -1, weeklyKg: 0.5 },
    maintenance: { adjustment: 0, label: "Maintien", direction: 0, weeklyKg: 0 },
    bulk: { adjustment: 0.10, label: "Prise de masse", direction: 1, weeklyKg: 0.3 },
    cut: { adjustment: -0.20, label: "Sèche sportive", direction: -1, weeklyKg: 0.6 },
};

export const SPORTS = {
    musculation: "Musculation",
    crossfit: "Crossfit",
    running: "Course à pied",
    team: "Sport collectif",
    endurance: "Endurance",
    mixed: "Mixte",
};

export const computeBMR = (gender, weightKg, heightCm, ageYears) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return gender === "male" ? base + 5 : base - 161;
};

/** IMC */
export const computeBMI = (weightKg, heightCm) => {
    const m = heightCm / 100;
    return +(weightKg / (m * m)).toFixed(1);
};

/** Catégorie IMC */
export const bmiCategory = (bmi) => {
    if (bmi < 18.5) return "Maigreur";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Surpoids";
    return "Obésité";
};

/** Masse maigre — formule Boer */
export const computeLeanMass = (gender, weightKg, heightCm) => {
    const lm =
        gender === "male"
            ? 0.407 * weightKg + 0.267 * heightCm - 19.2
            : 0.252 * weightKg + 0.473 * heightCm - 48.3;
    return +Math.max(0, lm).toFixed(1);
};

/** Estimation bodyfat — Deurenberg */
export const computeBodyFat = (gender, weightKg, heightCm, age) => {
    const bmi = computeBMI(weightKg, heightCm);
    const sex = gender === "male" ? 1 : 0;
    const bf = 1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4;
    return +Math.max(3, bf).toFixed(1);
};

/** Hard clamp on body-fat input (defensive against absurd values) */
export const clampBodyFat = (raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    return +Math.max(3, Math.min(60, n)).toFixed(1);
};

/** Recommended target body-fat % per goal (men reference, +6 for women) */
export const targetBodyFatFor = (gender, currentBF, goalKey) => {
    const isMale = gender === "male";
    const floor = isMale ? 8 : 16;   // realistic athletic floor
    const cutFloor = isMale ? 10 : 18;
    const bulkCeil = isMale ? 18 : 26;

    let target = currentBF;
    if (goalKey === "weight_loss") target = Math.max(currentBF - 4, floor + 4);
    else if (goalKey === "cut") target = Math.max(currentBF - 6, cutFloor);
    else if (goalKey === "bulk") target = Math.min(currentBF + 2, bulkCeil);
    // maintenance: unchanged
    return +target.toFixed(1);
};

/** Besoin hydrique journalier (litres) */
export const computeWaterNeeds = (weightKg, workoutsPerWeek) => {
    const baseMl = 35 * weightKg;
    const trainingExtraMl = (workoutsPerWeek / 7) * 500;
    return +((baseMl + trainingExtraMl) / 1000).toFixed(1);
};

/** Poids cible recommandé selon objectif (basé sur IMC sain ~22) */
export const computeTargetWeight = (gender, weightKg, heightCm, goalKey) => {
    const m = heightCm / 100;
    const idealBMI = gender === "male" ? 22.5 : 21.5;
    const idealWeight = +(idealBMI * m * m).toFixed(1);
    const goal = GOALS[goalKey];
    if (goal.direction === 0) return weightKg;
    if (goal.direction === -1) {
        // perte / sèche : viser entre poids actuel et idéal
        return +Math.max(idealWeight, weightKg - 5).toFixed(1);
    }
    // bulk : +5 kg réaliste
    return +(weightKg + 5).toFixed(1);
};

/** Estimation semaines pour atteindre la cible */
export const computeWeeksToGoal = (weightKg, targetWeight, goalKey) => {
    const goal = GOALS[goalKey];
    if (goal.weeklyKg === 0) return 0;
    const diff = Math.abs(targetWeight - weightKg);
    return Math.max(1, Math.round(diff / goal.weeklyKg));
};

/** Courbe progression : tableau de points {week, weight} */
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
        // courbe légèrement non-linéaire (rapide au début, ralentit)
        const progress = 1 - Math.pow(1 - w / total, 1.4);
        const weight =
            +(weightKg + (targetWeight - weightKg) * progress).toFixed(1);
        data.push({ week: Math.round(w), weight, label: `S${Math.round(w)}` });
    }
    return data;
};

export const computePlan = (profile) => {
    const { gender, age, height, weight, activity, goal, workouts } = profile;

    const bmr = computeBMR(gender, weight, height, age);
    const factor = ACTIVITY_FACTORS[activity].factor;
    const tdee = bmr * factor;

    const adjustment = GOALS[goal].adjustment;
    const targetCalories = tdee * (1 + adjustment);

    /* ---------- Body composition (precision-aware) ---------- */
    // Determine effective body-fat % and source
    const inputBF = profile.bodyFatKnown ? clampBodyFat(profile.bodyFatInput) : null;
    const estimatedBF = computeBodyFat(gender, weight, height, age);
    const bodyFat = inputBF ?? estimatedBF;
    const bodyFatSource = inputBF != null ? "input" : "estimated";

    // Real lean / fat mass derived from chosen body-fat
    const fatMass = +((weight * bodyFat) / 100).toFixed(1);
    const leanMassReal = +(weight - fatMass).toFixed(1);
    // Boer formula kept as "anatomical" reference (used in PDF & comparison)
    const leanMassBoer = computeLeanMass(gender, weight, height);

    // Target body-fat & derived target masses
    const targetBodyFat = targetBodyFatFor(gender, bodyFat, goal);
    const targetWeight = computeTargetWeight(gender, weight, height, goal);
    const targetFatMass = +((targetWeight * targetBodyFat) / 100).toFixed(1);
    const targetLeanMass = +(targetWeight - targetFatMass).toFixed(1);

    /* ---------- Macros ---------- */
    // When user knows their BF, compute protein from lean mass (2.4 g/kg LBM)
    // and clamp to a sport-nutrition safe range (1.6 – 3.0 g/kg total weight).
    let proteinG;
    if (bodyFatSource === "input") {
        const fromLean = 2.4 * leanMassReal;
        const minP = 1.6 * weight;
        const maxP = 3.0 * weight;
        proteinG = +Math.round(Math.max(minP, Math.min(maxP, fromLean))).toFixed(0);
    } else {
        proteinG = +(2 * weight).toFixed(0);
    }
    const fatG = +(0.9 * weight).toFixed(0);
    const proteinKcal = proteinG * 4;
    const fatKcal = fatG * 9;
    const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
    const carbsG = +(remainingKcal / 4).toFixed(0);
    const carbsKcal = carbsG * 4;

    /* ---------- Other metrics ---------- */
    const bmi = computeBMI(weight, height);
    const water = computeWaterNeeds(weight, workouts);
    const weeksToGoal = computeWeeksToGoal(weight, targetWeight, goal);
    const progression = buildProgressionCurve(weight, targetWeight, weeksToGoal);

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        macros: {
            protein: { grams: proteinG, kcal: Math.round(proteinKcal) },
            carbs: { grams: carbsG, kcal: Math.round(carbsKcal) },
            fat: { grams: fatG, kcal: Math.round(fatKcal) },
        },
        body: {
            bmi,
            bmiCategory: bmiCategory(bmi),
            // legacy field kept (Boer estimation) for backward compatibility
            leanMass: leanMassBoer,
            // new precision fields
            bodyFat,
            bodyFatSource, // "input" | "estimated"
            fatMass,
            leanMassReal,
            water,
            targetWeight,
            targetBodyFat,
            targetFatMass,
            targetLeanMass,
            weeksToGoal,
        },
        progression,
        meta: {
            activityLabel: ACTIVITY_FACTORS[activity].label,
            goalLabel: GOALS[goal].label,
            sportLabel: SPORTS[profile.sport],
        },
    };
};

export const tipsForGoal = (goal, sport) => {
    const common = [
        "Hydrate-toi : minimum 35 ml/kg de poids de corps par jour.",
        "Privilégie 4 à 5 repas quotidiens pour stabiliser ton énergie.",
        "Dors 7 à 9 h par nuit : la récupération conditionne la performance.",
    ];
    const goalSpecific = {
        weight_loss: [
            "Cible un déficit modéré : pèse-toi 1×/semaine, pas tous les jours.",
            "Augmente les protéines à 2.2 g/kg si la faim devient un frein.",
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
            "Surveille ton taux de gras : limite la prise de masse grasse pour faciliter la sèche.",
        ],
        cut: [
            "Maintiens des protéines hautes pour préserver ta masse musculaire.",
            "Concentre les glucides autour de l'entraînement.",
            "Intègre 2-3 séances de cardio modéré par semaine.",
            "Vise une baisse précise du taux de masse grasse — re-mesure tous les 15 jours.",
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

/**
 * Generate a sample meal plan adapted to goal and macros
 * Returns an array of meals with foods (label, qty, p/c/f estimate kcal split)
 */
export const buildMealPlan = (plan) => {
    const { macros, targetCalories } = plan;
    // distribution typique: PtitDej 25%, Déjeuner 35%, Collation 10%, Dîner 30%
    const split = { breakfast: 0.25, lunch: 0.35, snack: 0.1, dinner: 0.3 };

    const meal = (key, name, kcal, foods) => ({
        key,
        name,
        kcal: Math.round(kcal),
        protein: Math.round(macros.protein.grams * split[key]),
        carbs: Math.round(macros.carbs.grams * split[key]),
        fat: Math.round(macros.fat.grams * split[key]),
        foods,
    });

    return [
        meal("breakfast", "Petit-déjeuner", targetCalories * split.breakfast, [
            { food: "Flocons d'avoine", qty: "80 g" },
            { food: "Lait demi-écrémé", qty: "250 ml" },
            { food: "Oeufs entiers", qty: "2" },
            { food: "Banane", qty: "1" },
            { food: "Beurre de cacahuète", qty: "15 g" },
        ]),
        meal("lunch", "Déjeuner", targetCalories * split.lunch, [
            { food: "Poulet grillé / dinde", qty: "180 g" },
            { food: "Riz basmati cuit", qty: "200 g" },
            { food: "Légumes verts (brocoli, haricots)", qty: "200 g" },
            { food: "Huile d'olive", qty: "1 c. à soupe" },
            { food: "Fromage blanc 0 %", qty: "100 g" },
        ]),
        meal("snack", "Collation", targetCalories * split.snack, [
            { food: "Whey isolate", qty: "30 g" },
            { food: "Amandes", qty: "20 g" },
            { food: "Pomme ou fruit de saison", qty: "1" },
        ]),
        meal("dinner", "Dîner", targetCalories * split.dinner, [
            { food: "Saumon ou cabillaud", qty: "180 g" },
            { food: "Patate douce", qty: "200 g" },
            { food: "Salade verte + crudités", qty: "à volonté" },
            { food: "Avocat", qty: "1/2" },
            { food: "Yaourt grec nature", qty: "150 g" },
        ]),
    ];
};

/** Training recommendations adapted to goal */
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
