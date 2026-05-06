import { useEffect, useRef, useState } from "react";

/**
 * Wraps Recharts ResponsiveContainer-based charts so they only mount AFTER
 * their parent has measured non-zero dimensions. Prevents the
 * "width(-1) and height(-1) of chart should be greater than 0" warning when
 * a chart is rendered inside a hidden / not-yet-laid-out container
 * (e.g. lazy-mounted route, animated reveal, off-screen tab).
 *
 * Usage:
 *   <SafeChart minHeight={240}>
 *     <ResponsiveContainer ...>
 *       <PieChart ... />
 *     </ResponsiveContainer>
 *   </SafeChart>
 */
export const SafeChart = ({ children, minHeight = 220, className = "" }) => {
    const ref = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        let rafId = 0;
        const check = () => {
            if (!ref.current) return;
            const { width, height } = ref.current.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setReady(true);
                return;
            }
            rafId = requestAnimationFrame(check);
        };

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setReady(true);
                }
            }
        });
        ro.observe(node);
        rafId = requestAnimationFrame(check);

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`relative w-full ${className}`}
            style={{ minHeight }}
        >
            {ready ? children : null}
        </div>
    );
};
