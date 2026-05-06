import jsPDF from "jspdf";
import { buildMealPlan, tipsForGoal, buildTrainingPlan } from "./calculations";

/**
 * Premium 3-4 page PDF — branded coaching document.
 * Layout entirely vector (no images required).
 */
export const downloadPlanPDF = (profile, plan) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 16; // margin
    const RED = [230, 0, 0];
    const BLACK = [10, 10, 10];
    const GRAY = [110, 110, 110];
    const LIGHT = [200, 200, 200];

    const today = new Date().toLocaleDateString("fr-FR");

    /* ---------- Helpers ---------- */
    const setColor = (rgb, fn = "setTextColor") => doc[fn](rgb[0], rgb[1], rgb[2]);

    const headerBand = (subtitle) => {
        doc.setFillColor(...BLACK);
        doc.rect(0, 0, W, 26, "F");
        // Logo block
        doc.setFillColor(...RED);
        doc.rect(M, 6, 14, 14, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("IC", M + 7, 15.5, { align: "center" });

        doc.setFontSize(16);
        doc.text("IRON CALCULATOR", M + 18, 13);
        setColor([200, 200, 200]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(subtitle, M + 18, 19);

        // Date right
        doc.setTextColor(255, 255, 255);
        doc.text(today, W - M, 19, { align: "right" });

        // Red accent line
        doc.setFillColor(...RED);
        doc.rect(0, 26, W, 1.2, "F");
    };

    const footer = (page, total) => {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(M, H - 14, W - M, H - 14);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        setColor(GRAY);
        doc.text(
            "IRON CALCULATOR · Plan généré automatiquement — à titre indicatif.",
            M,
            H - 9
        );
        doc.setFont("helvetica", "bold");
        doc.text(`PAGE ${page} / ${total}`, W - M, H - 9, { align: "right" });
    };

    const sectionTitle = (label, y) => {
        setColor(BLACK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text(label.toUpperCase(), M, y);
        doc.setDrawColor(...RED);
        doc.setLineWidth(0.8);
        doc.line(M, y + 2, M + 30, y + 2);
        return y + 10;
    };

    const kvLine = (k, v, y, opts = {}) => {
        setColor(GRAY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(opts.size || 10);
        doc.text(k, M, y);
        setColor(opts.valueColor || BLACK);
        doc.setFont("helvetica", "bold");
        doc.text(`${v}`, opts.x || M + 70, y);
        return y + 6.5;
    };

    /* ===================== PAGE 1 — DASHBOARD ===================== */
    headerBand("Plan nutritionnel personnalisé · Page 01 / 03");
    let y = 38;

    // Profile section
    y = sectionTitle("Profil sportif", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    [
        ["Sexe", profile.gender === "male" ? "Homme" : "Femme"],
        ["Âge", `${profile.age} ans`],
        ["Taille", `${profile.height} cm`],
        ["Poids", `${profile.weight} kg`],
        ["Activité", plan.meta.activityLabel],
        ["Objectif", plan.meta.goalLabel],
        ["Sport principal", plan.meta.sportLabel],
        ["Entraînements / semaine", `${profile.workouts}`],
    ].forEach(([k, v]) => {
        y = kvLine(k, v, y);
    });
    y += 4;

    // BIG CALORIES
    doc.setFillColor(...RED);
    doc.rect(M, y, W - M * 2, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`${plan.targetCalories} KCAL / JOUR`, W / 2, y + 16, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
        `${plan.meta.goalLabel.toUpperCase()}  ·  ${plan.meta.activityLabel.toUpperCase()}`,
        W / 2,
        y + 22.5,
        { align: "center" }
    );
    y += 34;

    // 3 metrics row
    const cellW = (W - M * 2) / 3;
    const cells = [
        ["BMR", `${plan.bmr}`, "kcal"],
        ["TDEE", `${plan.tdee}`, "kcal"],
        ["IMC", `${plan.body.bmi}`, plan.body.bmiCategory],
    ];
    doc.setDrawColor(220, 220, 220);
    cells.forEach(([k, v, u], i) => {
        const x = M + i * cellW;
        doc.rect(x, y, cellW, 22, "S");
        setColor(GRAY);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(k.toUpperCase(), x + 4, y + 6);
        setColor(BLACK);
        doc.setFontSize(20);
        doc.text(`${v}`, x + 4, y + 16);
        setColor(GRAY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(u, x + cellW - 4, y + 16, { align: "right" });
    });
    y += 30;

    // Macros section
    y = sectionTitle("Macronutriments", y);
    const macroRow = (label, grams, kcal, color) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(M, y - 4, 3, 8, "F");
        setColor(BLACK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(label, M + 8, y);
        setColor(BLACK);
        doc.text(`${grams} g`, M + 70, y);
        setColor(GRAY);
        doc.setFont("helvetica", "normal");
        doc.text(`${kcal} kcal`, M + 110, y);
        return y + 8;
    };
    y = macroRow("Protéines", plan.macros.protein.grams, plan.macros.protein.kcal, RED);
    y = macroRow("Glucides", plan.macros.carbs.grams, plan.macros.carbs.kcal, [60, 60, 60]);
    y = macroRow("Lipides", plan.macros.fat.grams, plan.macros.fat.kcal, [150, 150, 150]);
    y += 6;

    // Body composition
    y = sectionTitle("Composition corporelle", y);
    [
        ["Masse maigre estimée", `${plan.body.leanMass} kg`],
        ["Bodyfat estimé", `${plan.body.bodyFat} %`],
        ["Hydratation conseillée", `${plan.body.water} L / jour`],
        ["Poids cible", `${plan.body.targetWeight} kg`],
        [
            "Délai estimé",
            plan.body.weeksToGoal > 0
                ? `${plan.body.weeksToGoal} semaines`
                : "Maintien stable",
        ],
    ].forEach(([k, v]) => {
        y = kvLine(k, v, y);
    });

    footer(1, 3);

    /* ===================== PAGE 2 — MEAL PLAN ===================== */
    doc.addPage();
    headerBand("Plan alimentaire exemple · Page 02 / 03");
    y = 38;

    y = sectionTitle("Une journée type", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(GRAY);
    doc.text(
        `Distribution: 25% petit-déjeuner · 35% déjeuner · 10% collation · 30% dîner`,
        M,
        y
    );
    y += 8;

    const meals = buildMealPlan(plan);
    meals.forEach((m) => {
        // Block container
        const blockY = y;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        // Title bar
        setColor(BLACK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(m.name.toUpperCase(), M, y);
        setColor(RED);
        doc.text(`${m.kcal} kcal`, W - M, y, { align: "right" });
        y += 4;
        doc.setDrawColor(...RED);
        doc.setLineWidth(0.5);
        doc.line(M, y, M + 24, y);
        y += 5;

        // Macros line
        setColor(GRAY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(
            `P ${m.protein} g    G ${m.carbs} g    L ${m.fat} g`,
            M,
            y
        );
        y += 6;

        // Foods
        setColor(BLACK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        m.foods.forEach((f) => {
            doc.text(`•  ${f.food}`, M + 2, y);
            setColor(GRAY);
            doc.text(f.qty, W - M, y, { align: "right" });
            setColor(BLACK);
            y += 5.5;
        });

        // Separator
        y += 3;
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(M, y, W - M, y);
        y += 6;

        // page break safety
        if (y > H - 30) {
            footer(2, 3);
            doc.addPage();
            headerBand("Plan alimentaire (suite) · Page 02 / 03");
            y = 38;
        }
    });

    footer(2, 3);

    /* ===================== PAGE 3 — TRAINING + TIPS ===================== */
    doc.addPage();
    headerBand("Recommandations & conseils · Page 03 / 03");
    y = 38;

    y = sectionTitle("Entraînement", y);
    const tp = buildTrainingPlan(profile.goal, profile.sport, profile.workouts);

    setColor(BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const introLines = doc.splitTextToSize(tp.intro, W - M * 2);
    doc.text(introLines, M, y);
    y += introLines.length * 5 + 4;

    [
        ["Fréquence", `${tp.sessions} séances / semaine`],
        ["Cardio", tp.cardio],
        ["Sommeil", tp.sleep],
        ["Hydratation", tp.hydration],
        ["Timing protéines", tp.proteinTiming],
    ].forEach(([k, v]) => {
        setColor(RED);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(k.toUpperCase(), M, y);
        setColor(BLACK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(v, W - M * 2);
        doc.text(lines, M, y + 5);
        y += 5 + lines.length * 5 + 4;
    });

    y += 2;
    y = sectionTitle("Récupération", y);
    setColor(BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    tp.recovery.forEach((r) => {
        doc.text(`•  ${r}`, M + 2, y);
        y += 6;
    });

    y += 4;
    y = sectionTitle("Conseils nutritionnels", y);
    const tips = tipsForGoal(profile.goal, profile.sport);
    tips.forEach((t) => {
        const lines = doc.splitTextToSize(`•  ${t}`, W - M * 2 - 4);
        doc.text(lines, M + 2, y);
        y += lines.length * 5 + 1.5;
        if (y > H - 25) {
            footer(3, 3);
            doc.addPage();
            headerBand("Conseils (suite) · Page 03 / 03");
            y = 38;
        }
    });

    footer(3, 3);

    doc.save(`iron-calculator-plan-${today.replace(/\//g, "-")}.pdf`);
};
