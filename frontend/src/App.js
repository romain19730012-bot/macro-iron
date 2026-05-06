import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IronCalculator from "./pages/IronCalculator";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";

const THEME_KEY = "iron-calculator-theme";

function App() {
    const [theme, setTheme] = useState("dark");

    // Initialise theme from localStorage; default = dark
    useEffect(() => {
        const stored = localStorage.getItem(THEME_KEY);
        const initial = stored === "light" ? "light" : "dark";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem(THEME_KEY, next);
        document.documentElement.classList.toggle("dark", next === "dark");
    };

    return (
        <div className="App">
            <ErrorBoundary>
                <BrowserRouter>
                    <Routes>
                        <Route
                            path="/"
                            element={<IronCalculator theme={theme} toggleTheme={toggleTheme} />}
                        />
                    </Routes>
                </BrowserRouter>
                <Toaster richColors position="bottom-right" />
            </ErrorBoundary>
        </div>
    );
}

export default App;
