/**
 * IRON CALCULATOR — Nutrition calculation engine
 * Formules:
 *  - BMR via Mifflin-St Jeor
 *  - TDEE = BMR * facteur d'activité
 *  - Calories objectif = TDEE +/- pourcentage selon objectif
 *  - Macros: Protéines 2 g/kg, Lipides 0.9 g/kg, Glucides = reste
 */

export const ACTIVITY_FACTORS = {
    sedentary: { factor: 1.2, label: "Sédentaire" },
    light: { factor: 1.375, label: "Légèrement actif" },
    active: { factor: 1.55, label: "Actif" },
    very_active: { factor: 1.725, label: "Très actif" },
    intense: { factor: 1.9, label: "Sportif intensif" },
};

export const GOALS = {
    weight_loss: { adjustment: -0.15, label: "Perte de poids" },
    maintenance: { adjustment: 0, label: "Maintien" },
    bulk: { adjustment: 0.10, label: "Prise de masse" },
    cut: { adjustment: -0.20, label: "Sèche sportive" },
};

export const SPORTS = {
    musculation: "Musculation",
    crossfit: "Crossfit",
    running: "Course à pied",
    team: "Sport collectif",
    endurance: "Endurance",
    mixed: "Mixte",
};

/**
 * Compute Basal Metabolic Rate (Mifflin-St Jeor)
 * @param {"male"|"female"} gender
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} ageYears
 */
export const computeBMR = (gender, weightKg, heightCm, ageYears) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return gender === "male" ? base + 5 : base - 161;
};

/**
 * Full nutrition plan computation
 * @param {{
 *   gender: "male"|"female",
 *   age: number, height: number, weight: number,
 *   activity: keyof typeof ACTIVITY_FACTORS,
 *   goal: keyof typeof GOALS,
 *   workouts: number, sport: keyof typeof SPORTS
 * }} profile
 */
export const computePlan = (profile) => {
    const { gender, age, height, weight, activity, goal } = profile;

    const bmr = computeBMR(gender, weight, height, age);
    const factor = ACTIVITY_FACTORS[activity].factor;
    const tdee = bmr * factor;

    const adjustment = GOALS[goal].adjustment;
    const targetCalories = tdee * (1 + adjustment);

    // Macro split: priority on protein and fat per kg, carbs fill the gap
    const proteinG = +(2 * weight).toFixed(0);
    const fatG = +(0.9 * weight).toFixed(0);
    const proteinKcal = proteinG * 4;
    const fatKcal = fatG * 9;
    const remainingKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
    const carbsG = +(remainingKcal / 4).toFixed(0);
    const carbsKcal = carbsG * 4;

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories: Math.round(targetCalories),
        macros: {
            protein: { grams: proteinG, kcal: Math.round(proteinKcal) },
            carbs: { grams: carbsG, kcal: Math.round(carbsKcal) },
            fat: { grams: fatG, kcal: Math.round(fatKcal) },
        },
        meta: {
            activityLabel: ACTIVITY_FACTORS[activity].label,
            goalLabel: GOALS[goal].label,
            sportLabel: SPORTS[profile.sport],
        },
    };
};

/**
 * Generate personalised nutrition tips based on the goal
 */
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
        ],
        maintenance: [
            "Surveille tes performances en salle : c'est le meilleur indicateur.",
            "Adapte légèrement tes glucides selon les jours d'entraînement.",
            "Mange varié : 30 plantes différentes/semaine pour le microbiote.",
        ],
        bulk: [
            "Privilégie une prise de masse propre : +0,3 kg/semaine maximum.",
            "Ajoute 30 g de glucides post-training pour optimiser la recharge.",
            "Ne néglige pas les légumes — la digestion détermine l'assimilation.",
        ],
        cut: [
            "Maintiens des protéines hautes pour préserver ta masse musculaire.",
            "Concentre les glucides autour de l'entraînement.",
            "Intègre 2-3 séances de cardio modéré par semaine.",
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
