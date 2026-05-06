import { Moon, Sun } from "lucide-react";

export const ThemeToggle = ({ theme, toggleTheme }) => {
    const isDark = theme === "dark";
    return (
        <button
            type="button"
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
            aria-label="Changer de thème"
            className="group relative inline-flex h-10 w-10 items-center justify-center border border-white/10 dark:border-white/10 text-foreground transition-colors hover:border-[#E60000]"
        >
            {isDark ? (
                <Sun className="h-4 w-4 transition-transform group-hover:rotate-45" strokeWidth={1.5} />
            ) : (
                <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12" strokeWidth={1.5} />
            )}
        </button>
    );
};
