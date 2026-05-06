# IRON CALCULATOR — PRD

## Original Problem Statement
Application web moderne de calculateur de calories pour sportifs (FR), pure frontend React + Tailwind. Calcule BMR (Mifflin-St Jeor), TDEE et macros selon profil + objectif.

## User Choices
- Téléchargement PDF
- Mode sombre par défaut
- Pure frontend (pas de backend)
- Français uniquement

## Architecture
- React 19 + Tailwind 3 + Recharts + jsPDF
- Single page: /app/frontend/src/pages/IronCalculator.jsx
- Composants: Hero, CalculatorForm, ResultDashboard, MacroChart, ThemeToggle
- Logique: lib/calculations.js (BMR/TDEE/macros + tips), lib/pdf.js (export jsPDF)
- LocalStorage: iron-calculator-last (résultat), iron-calculator-theme (dark|light)

## Implemented (06/05/2026)
- Hero premium avec image fitness sombre + branding rouge
- Formulaire complet (sexe, âge, taille, poids, activité 5 niveaux, objectif 4, séances/sem, sport)
- Validation des champs numériques (plages réalistes)
- Calculs Mifflin-St Jeor + facteurs activité + ajustements objectif
- Macros: protéines 2g/kg, lipides 0.9g/kg, glucides = reste
- Dashboard résultat: BMR, TDEE, calories cibles, donut Recharts, cards macros, conseils
- Boutons Recalculer + Télécharger PDF (jsPDF, design rouge/noir)
- Toggle thème dark/light (default dark)
- LocalStorage persistance
- Animations fade-up, design "Performance Pro"

## Tested
- Iteration 1: 95% success. Math vérifiée correcte. Petits ajustements: toast position bottom-right, MacroChart minHeight.

## Backlog (P1/P2)
- Historique multi-calculs avec comparaison
- Plans repas suggérés selon macros
- Partage du plan via lien
- Profils multiples (membres famille / clients coach)
- Calcul du % de masse grasse (Navy/Tanita)

## Next Tasks
- Recueillir feedback utilisateur sur le PDF
- Considérer un mode coach (multiple profiles)
