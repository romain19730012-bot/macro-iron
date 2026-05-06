/**
 * Email plan delivery — currently MOCKED frontend-only.
 *
 * To activate real email sending, plug a backend (Resend / SendGrid / etc.)
 * inside `sendEmailPlan` below. The frontend is already calling this function
 * with the user's email + plan summary. Until then we simply persist the
 * email locally and display a clear "scheduled" message — never claim the
 * email was actually sent.
 *
 * Local storage key:
 *   iron-calculator-emails  →  array<{ email, savedAt, planSummary }>
 */

const STORAGE_KEY = "iron-calculator-emails";

const isValidEmail = (raw) =>
    typeof raw === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());

/** @returns {Array<{email:string,savedAt:string,planSummary:object}>} */
export const readSavedEmails = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const saveEmailLocally = (entry) => {
    try {
        const existing = readSavedEmails();
        // De-duplicate by email
        const next = [
            ...existing.filter((e) => e.email !== entry.email),
            entry,
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return true;
    } catch {
        return false;
    }
};

/**
 * Persist the email locally and (later) trigger backend delivery.
 *
 * @param {string} email
 * @param {{profile:object, plan:object}} payload
 * @returns {Promise<{status:'queued'|'sent'|'invalid', message:string}>}
 *
 * NOTE: when a backend becomes available, replace the body of the
 * `if (BACKEND_ENABLED)` block below with a real fetch() call.
 */
export const sendEmailPlan = async (email, payload) => {
    if (!isValidEmail(email)) {
        return { status: "invalid", message: "Email invalide." };
    }

    const planSummary = {
        targetCalories: payload?.plan?.targetCalories,
        protein: payload?.plan?.macros?.protein?.grams,
        carbs: payload?.plan?.macros?.carbs?.grams,
        fat: payload?.plan?.macros?.fat?.grams,
        bodyFat: payload?.plan?.body?.bodyFat,
        goal: payload?.plan?.meta?.goalLabel,
    };

    saveEmailLocally({
        email: email.trim(),
        savedAt: new Date().toISOString(),
        planSummary,
    });

    // ─── Backend hook (currently disabled) ──────────────────────────────
    // const BACKEND_ENABLED = false;
    // if (BACKEND_ENABLED) {
    //     try {
    //         const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/email/plan`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ email, plan: payload.plan, profile: payload.profile }),
    //         });
    //         if (!res.ok) throw new Error("backend rejected");
    //         return { status: "sent", message: "Email envoyé avec succès." };
    //     } catch {
    //         // Even if backend fails, the local copy is saved → tell user it's queued.
    //         return {
    //             status: "queued",
    //             message: "Email enregistré. L'envoi automatique sera activé prochainement.",
    //         };
    //     }
    // }
    // ────────────────────────────────────────────────────────────────────

    return {
        status: "queued",
        message: "Email enregistré. L'envoi automatique sera activé prochainement.",
    };
};
