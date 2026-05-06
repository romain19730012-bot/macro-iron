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
        let cancelled = false;

        const settle = () => {
            // Two extra rAFs after first non-zero measurement → guarantees
            // the inner ResponsiveContainer has finished its own measurement
            // pass and never sees a zero-width parent.
            requestAnimationFrame(() => {
                if (cancelled) return;
                requestAnimationFrame(() => {
                    if (!cancelled) setReady(true);
                });
            });
        };

        const check = () => {
            if (cancelled || !ref.current) return;
            const { width, height } = ref.current.getBoundingClientRect();
            if (width > 1 && height > 1) {
                settle();
                return;
            }
            rafId = requestAnimationFrame(check);
        };

        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                if (width > 1 && height > 1) {
                    settle();
                }
            }
        });
        ro.observe(node);
        rafId = requestAnimationFrame(check);

        return () => {
            cancelled = true;
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
