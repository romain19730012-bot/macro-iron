import { Component } from "react";

/**
 * App-wide error boundary. Catches any rendering / lifecycle error inside
 * children and displays a recovery UI with a "Reset and reload" action that
 * wipes the local cache before reloading. Guarantees the app can never end
 * up on a permanent black screen.
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Log to console for debugging — useful both in preview and prod
        // eslint-disable-next-line no-console
        console.error("[IronCalculator] Caught render error:", error, info);
    }

    handleReset = () => {
        try {
            // Wipe known caches so any stale shape is dropped before reload
            localStorage.removeItem("iron-calculator-last");
        } catch {
            /* ignore storage errors */
        }
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div
                data-testid="app-error-boundary"
                className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center"
            >
                <div className="mx-auto inline-flex h-16 w-16 items-center justify-center bg-[#E60000] font-heading text-2xl uppercase text-white">
                    IC
                </div>
                <div className="mt-8 flex items-center gap-3">
                    <span className="h-px w-10 bg-[#E60000]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E60000]">
                        Erreur inattendue
                    </span>
                    <span className="h-px w-10 bg-[#E60000]" />
                </div>
                <h1 className="mt-6 max-w-xl font-heading text-4xl uppercase tracking-tight text-white sm:text-5xl">
                    Une erreur a interrompu l'application
                </h1>
                <p className="mt-4 max-w-md text-sm text-gray-400">
                    Pas de panique. Réinitialise les données locales et relance —
                    tes calculs seront régénérés avec ton profil au prochain envoi.
                </p>
                <button
                    type="button"
                    onClick={this.handleReset}
                    className="mt-8 inline-flex items-center gap-3 bg-[#E60000] px-6 py-3 font-heading text-base uppercase tracking-wider text-white transition-colors hover:bg-[#FF1A1A]"
                >
                    Réinitialiser et recharger
                </button>
            </div>
        );
    }
}
