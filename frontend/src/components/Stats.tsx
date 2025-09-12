"use client";

import React from "react";
import {Card, CardBody} from "@heroui/card";

type Stat = {
    id: string;
    label: string;
    value: number;
    suffix?: string;
    decimals?: number;
    sublabel?: string;
    icon?: React.ReactNode;
};

function useInView(ref: React.RefObject<Element>, rootMargin = "0px") {
    const [inView, setInView] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            {root: null, rootMargin, threshold: 0.2}
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [ref, rootMargin]);
    return inView;
}

function Counter({
                     value,
                     duration = 1200,
                     suffix,
                     decimals = 0,
                 }: { value: number; duration?: number; suffix?: string; decimals?: number }) {
    const ref = React.useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, "-20% 0px");
    const [display, setDisplay] = React.useState(0);
    const startedRef = React.useRef(false);

    React.useEffect(() => {
        if (!inView || startedRef.current) return;
        startedRef.current = true;
        const start = 0;
        const end = value;
        const startTime = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        let raf = 0;
        const tick = () => {
            const now = performance.now();
            const p = Math.min(1, (now - startTime) / duration);
            const eased = easeOutCubic(p);
            const v = start + (end - start) * eased;
            setDisplay(v);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, value, duration]);

    return (
        <span ref={ref}>
      {display.toFixed(decimals)}{suffix ?? ""}
    </span>
    );
}

export function StatsSection() {
    const stats: Stat[] = [
        {id: "games", label: "Games Tracked", value: 342, suffix: "+", icon: "🎲"},
        {id: "hours", label: "Hours Logged", value: 1234, suffix: "h", icon: "⏱️"},
        {id: "rating", label: "Avg Rating", value: 7.8, decimals: 1, icon: "⭐"},
        {id: "collections", label: "Collections", value: 6, icon: "🗂️"},
        {id: "tags", label: "Tags", value: 42, icon: "🏷️"},
        {id: "players", label: "Players Hosted", value: 88, suffix: "+", icon: "👥"},
    ];

    return (
        <section className="relative container mx-auto max-w-7xl">
            {/* Background flair */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-48 blur-3xl opacity-40 dark:opacity-30 bg-gradient-to-r from-primary/30 via-fuchsia-500/20 to-cyan-400/20 rounded-full"/>
            </div>

            <div className="flex items-end justify-between gap-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">By the numbers</h2>
                <p className="text-foreground-500 hidden md:block">Snapshot of your growing library</p>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map((s) => (
                    <div key={s.id}
                         className="rounded-2xl p-[1px] bg-gradient-to-br from-primary/70 via-fuchsia-500/40 to-transparent dark:from-primary/40">
                        <Card shadow="sm" className="bg-content1/70 backdrop-blur-md">
                            <CardBody className="p-4 flex flex-col gap-1">
                                <div className="text-2xl md:text-3xl font-bold tracking-tight">
                                    <Counter value={s.value} suffix={s.suffix} decimals={s.decimals}/>
                                </div>
                                <div className="text-foreground-500 text-xs md:text-sm">{s.label}</div>
                                {s.icon ? <div className="mt-2 text-xl md:text-2xl opacity-80">{s.icon}</div> : null}
                            </CardBody>
                        </Card>
                    </div>
                ))}
            </div>
        </section>
    );
}

