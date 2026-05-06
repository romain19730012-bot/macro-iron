import jsPDF from "jspdf";

/**
 * Generate a clean, branded PDF for the user's nutrition plan
 */
export const downloadPlanPDF = (profile, plan) => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // Header band
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setTextColor(230, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("IRON CALCULATOR", margin, 19);

    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Plan nutritionnel personnalisé", margin, 25);

    // Date
    const today = new Date().toLocaleDateString("fr-FR");
    doc.text(today, pageWidth - margin, 25, { align: "right" });

    // Reset color
    doc.setTextColor(20, 20, 20);
    let y = 45;

    // Profile section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("PROFIL SPORTIF", margin, y);
    doc.setDrawColor(230, 0, 0);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 1.5, margin + 35, y + 1.5);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = [
        ["Sexe", profile.gender === "male" ? "Homme" : "Femme"],
        ["Âge", `${profile.age} ans`],
        ["Taille", `${profile.height} cm`],
        ["Poids", `${profile.weight} kg`],
        ["Activité", plan.meta.activityLabel],
        ["Objectif", plan.meta.goalLabel],
        ["Sport principal", plan.meta.sportLabel],
        ["Entraînements / semaine", `${profile.workouts}`],
    ];
    lines.forEach(([k, v]) => {
        doc.setTextColor(110, 110, 110);
        doc.text(k, margin, y);
        doc.setTextColor(20, 20, 20);
        doc.text(`${v}`, margin + 60, y);
        y += 7;
    });

    y += 6;

    // Calories section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text("BESOINS CALORIQUES", margin, y);
    doc.setDrawColor(230, 0, 0);
    doc.line(margin, y + 1.5, margin + 50, y + 1.5);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const calLines = [
        ["Métabolisme de base (BMR)", `${plan.bmr} kcal`],
        ["Dépense journalière (TDEE)", `${plan.tdee} kcal`],
        ["Calories cibles", `${plan.targetCalories} kcal`],
    ];
    calLines.forEach(([k, v]) => {
        doc.setTextColor(110, 110, 110);
        doc.text(k, margin, y);
        doc.setTextColor(20, 20, 20);
        doc.text(`${v}`, margin + 80, y);
        y += 7;
    });

    // Big calories box
    y += 4;
    doc.setFillColor(230, 0, 0);
    doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(`${plan.targetCalories} KCAL / JOUR`, pageWidth / 2, y + 14, {
        align: "center",
    });
    y += 30;

    // Macros section
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("MACRONUTRIMENTS", margin, y);
    doc.setDrawColor(230, 0, 0);
    doc.line(margin, y + 1.5, margin + 50, y + 1.5);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const macroLines = [
        ["Protéines", `${plan.macros.protein.grams} g`, `${plan.macros.protein.kcal} kcal`],
        ["Glucides", `${plan.macros.carbs.grams} g`, `${plan.macros.carbs.kcal} kcal`],
        ["Lipides", `${plan.macros.fat.grams} g`, `${plan.macros.fat.kcal} kcal`],
    ];
    macroLines.forEach(([k, g, c]) => {
        doc.setTextColor(110, 110, 110);
        doc.text(k, margin, y);
        doc.setTextColor(20, 20, 20);
        doc.text(g, margin + 60, y);
        doc.text(c, margin + 110, y);
        y += 7;
    });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
        "Plan généré par IRON CALCULATOR. À titre indicatif — consultez un professionnel de santé pour un suivi personnalisé.",
        margin,
        285,
        { maxWidth: pageWidth - margin * 2 }
    );

    doc.save(`iron-calculator-plan-${today.replace(/\//g, "-")}.pdf`);
};
