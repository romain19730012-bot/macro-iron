import jsPDF from "jspdf";
import { tipsForGoal, buildTrainingPlan } from "./calculations";

/**
 * Premium 3-page PDF — branded coaching document.
 * Layout entirely vector (no images required).
 *
 * Defensive: tolerates missing optional fields (uses '—' fallbacks) and never
 * throws. Caller is expected to wrap the call in try/catch but we also
 * gracefully degrade so even partial data still produces a usable PDF.
 */
export const downloadPlanPDF = (profile, plan) => {
    if (!plan || !plan.macros || !plan.body || !plan.meta) {
        throw new Error("Plan incomplet — impossible de générer le PDF");
    }
    const safe = (v, fallback = "—") =>
        v === undefined || v === null || (typeof v === "number" && !Number.isFinite(v))
            ? fallback
            : v;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 16;
    const RED = [230, 0, 0];
    const BLACK = [10, 10, 10];
    const GRAY = [110, 110, 110];

    const today = new Date().toLocaleDateString("fr-FR");

    /* ---------- Helpers ---------- */
    const setColor = (rgb, fn = "setTextColor") => doc[fn](rgb[0], rgb[1], rgb[2]);

    const headerBand = (subtitle) => {
        doc.setFillColor(...BLACK);
        doc.rect(0, 0, W, 26, "F");
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

        doc.setTextColor(255, 255, 255);
        doc.text(today, W - M, 19, { align: "right" });

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
        setColor(BLACK);
        doc.setFont("helvetica", "bold");
        doc.text(`${v}`, opts.x || M + 70, y);
        return y + 6.5;
    };

    /* ===================== PAGE 1 — DASHBOARD ===================== */
    headerBand("Plan nutritionnel personnalisé · Page 01 / 03");
    let y = 38;

    y = sectionTitle("Profil sportif", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    [
        ["Sexe", profile.gender === "male" ? "Homme" : "Femme"],
        ["Âge", `${safe(profile.age)} ans`],
        ["Taille", `${safe(profile.height)} cm`],
        ["Poids", `${safe(profile.weight)} kg`],
        ["Activité", safe(plan.meta.activityLabel)],
        ["Objectif", safe(plan.meta.goalLabel)],
        ["Sport principal", safe(plan.meta.sportLabel)],
        ["Entraînements / semaine", `${safe(profile.workouts)}`],
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
    doc.text(`${safe(plan.targetCalories)} KCAL / JOUR`, W / 2, y + 16, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const adjPct = plan.body?.adjustmentPct;
    const adjLabel =
        Number.isFinite(adjPct) && adjPct !== 0
            ? ` · ${adjPct > 0 ? "+" : ""}${(adjPct * 100).toFixed(0)} %`
            : "";
    doc.text(
        `${(plan.meta.goalLabel || "").toUpperCase()}  ·  ${(plan.meta.activityLabel || "").toUpperCase()}${adjLabel}`,
        W / 2,
        y + 22.5,
        { align: "center" }
    );
    y += 34;

    // 3 metrics row: BMR / TDEE / Δ kcal
    const cellW = (W - M * 2) / 3;
    const cells = [
        ["BMR", `${safe(plan.bmr)}`, "kcal"],
        ["TDEE", `${safe(plan.tdee)}`, "kcal"],
        [
            "Δ Kcal",
            Number.isFinite(plan.body?.adjustmentKcal)
                ? `${plan.body.adjustmentKcal >= 0 ? "+" : ""}${plan.body.adjustmentKcal}`
                : "—",
            "vs TDEE",
        ],
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

    // Macros
    y = sectionTitle("Macronutriments", y);
    const macroRow = (label, grams, kcal, color) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(M, y - 4, 3, 8, "F");
        setColor(BLACK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(label, M + 8, y);
        setColor(BLACK);
        doc.text(`${safe(grams)} g`, M + 70, y);
        setColor(GRAY);
        doc.setFont("helvetica", "normal");
        doc.text(`${safe(kcal)} kcal`, M + 110, y);
        return y + 8;
    };
    y = macroRow("Protéines", plan.macros.protein?.grams, plan.macros.protein?.kcal, RED);
    y = macroRow("Glucides", plan.macros.carbs?.grams, plan.macros.carbs?.kcal, [60, 60, 60]);
    y = macroRow("Lipides", plan.macros.fat?.grams, plan.macros.fat?.kcal, [150, 150, 150]);
    y += 6;

    // Body composition (precision-aware)
    y = sectionTitle("Composition corporelle", y);
    const bf = plan.body?.bodyFat;
    const bfSource = plan.body?.bodyFatSource === "input" ? "renseigné" : "estimation Deurenberg";
    [
        ["Taux de masse grasse", `${safe(bf)} %  (${bfSource})`],
        ["Masse grasse", `${safe(plan.body?.fatMass)} kg`],
        ["Masse maigre", `${safe(plan.body?.leanMassReal ?? plan.body?.leanMass)} kg`],
        ["Hydratation conseillée", `${safe(plan.body?.water)} L / jour`],
        ["Poids cible", `${safe(plan.body?.targetWeight)} kg`],
        [
            "BF cible",
            Number.isFinite(plan.body?.targetBodyFat)
                ? `${plan.body.targetBodyFat} %  (${safe(plan.body?.targetFatMass)} kg de graisse)`
                : "—",
        ],
        [
            "Délai estimé",
            plan.body?.weeksToGoal > 0
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
        "Distribution: 25% petit-déjeuner · 35% déjeuner · 10% collation · 30% dîner",
        M,
        y
    );
    y += 8;

    // Use the meal plan already computed inside `plan` (correct shape: {meals, totals, target, deltas})
    const mealPlan = plan.mealPlan || {};
    const meals = Array.isArray(mealPlan.meals) ? mealPlan.meals : [];

    if (meals.length === 0) {
        setColor(GRAY);
        doc.text("Plan alimentaire indisponible.", M, y);
        y += 8;
    } else {
        meals.forEach((m) => {
            setColor(BLACK);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text((m.name || "").toUpperCase(), M, y);
            setColor(RED);
            doc.text(`${safe(m.kcal)} kcal`, W - M, y, { align: "right" });
            y += 4;
            doc.setDrawColor(...RED);
            doc.setLineWidth(0.5);
            doc.line(M, y, M + 24, y);
            y += 5;

            setColor(GRAY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text(
                `P ${safe(m.protein)} g    G ${safe(m.carbs)} g    L ${safe(m.fat)} g`,
                M,
                y
            );
            y += 6;

            setColor(BLACK);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            (m.foods || []).forEach((f) => {
                doc.text(`•  ${f.food}`, M + 2, y);
                setColor(GRAY);
                doc.text(safe(f.qty), W - M, y, { align: "right" });
                setColor(BLACK);
                y += 5.5;
            });

            y += 3;
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.2);
            doc.line(M, y, W - M, y);
            y += 6;

            if (y > H - 50) {
                footer(2, 3);
                doc.addPage();
                headerBand("Plan alimentaire (suite) · Page 02 / 03");
                y = 38;
            }
        });
    }

    // Total du plan
    if (mealPlan.totals && mealPlan.target && mealPlan.deltas) {
        if (y > H - 50) {
            footer(2, 3);
            doc.addPage();
            headerBand("Plan alimentaire (suite) · Page 02 / 03");
            y = 38;
        }
        y = sectionTitle("Total journalier du plan", y);
        const T = mealPlan.totals;
        const G = mealPlan.target;
        const D = mealPlan.deltas;
        const sign = (n) => (n > 0 ? `+${n}` : `${n}`);
        const totalRow = (label, actual, target, delta, unit) => {
            setColor(BLACK);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(label, M, y);
            setColor(BLACK);
            doc.setFont("helvetica", "normal");
            doc.text(`${actual} ${unit}`, M + 60, y);
            setColor(GRAY);
            doc.text(`cible ${target}`, M + 100, y);
            doc.text(`Δ ${sign(delta)}`, M + 140, y);
            return y + 6.5;
        };
        y = totalRow("Calories", safe(T.kcal), safe(G.kcal), safe(D.kcal), "kcal");
        y = totalRow("Protéines", safe(T.p), safe(G.p), safe(D.p), "g");
        y = totalRow("Glucides", safe(T.c), safe(G.c), safe(D.c), "g");
        y = totalRow("Lipides", safe(T.f), safe(G.f), safe(D.f), "g");
    }

    footer(2, 3);

    /* ===================== PAGE 3 — TRAINING + TIPS ===================== */
    doc.addPage();
    headerBand("Recommandations & conseils · Page 03 / 03");
    y = 38;

    y = sectionTitle("Entraînement", y);
    let tp = null;
    try {
        tp = buildTrainingPlan(profile.goal, profile.sport, profile.workouts);
    } catch {
        tp = null;
    }
    if (tp) {
        setColor(BLACK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const introLines = doc.splitTextToSize(tp.intro || "", W - M * 2);
        doc.text(introLines, M, y);
        y += introLines.length * 5 + 4;

        [
            ["Fréquence", `${safe(tp.sessions)} séances / semaine`],
            ["Cardio", safe(tp.cardio, "")],
            ["Sommeil", safe(tp.sleep, "")],
            ["Hydratation", safe(tp.hydration, "")],
            ["Timing protéines", safe(tp.proteinTiming, "")],
        ].forEach(([k, v]) => {
            setColor(RED);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text(k.toUpperCase(), M, y);
            setColor(BLACK);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(`${v}`, W - M * 2);
            doc.text(lines, M, y + 5);
            y += 5 + lines.length * 5 + 4;
        });

        if (Array.isArray(tp.recovery) && tp.recovery.length) {
            y = sectionTitle("Récupération", y);
            setColor(BLACK);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            tp.recovery.forEach((r) => {
                doc.text(`•  ${r}`, M + 2, y);
                y += 6;
            });
            y += 4;
        }
    }

    y = sectionTitle("Conseils nutritionnels", y);
    let tips = [];
    try {
        tips = tipsForGoal(profile.goal, profile.sport) || [];
    } catch {
        tips = [];
    }
    setColor(BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
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
