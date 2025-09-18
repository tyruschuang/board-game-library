"use client";

import React from "react";
import {Card, CardBody, CardFooter} from "@heroui/card";
import {Image} from "@heroui/image";
import {Button} from "@heroui/button";

type Item = {
    id: string;
    title: string;
    image: string;
    subtitle?: string;
};

export function Carousel({
                             items,
                             autoplay = true,
                             intervalMs = 3500,
                         }: {
    items: Item[];
    autoplay?: boolean;
    intervalMs?: number;
}) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [paused, setPaused] = React.useState(false);
    const [reduceMotion, setReduceMotion] = React.useState(false);

    const base = items.length; // start index of the middle group
    const tripled = React.useMemo(() => {
        // Triplicate items for infinite scroll illusion
        return [...items, ...items, ...items];
    }, [items]);

    // Respect reduced motion
    React.useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(mq.matches);
        update();
        try {
            mq.addEventListener("change", update);
            return () => mq.removeEventListener("change", update);
        } catch {
            mq.addListener(update);
            return () => mq.removeListener(update);
        }
    }, []);

    const scrollToIndex = (index: number, behavior: ScrollBehavior = "smooth") => {
        const el = containerRef.current;
        if (!el) return;
        const child = el.children[index] as HTMLElement | undefined;
        if (!child) return;
        const left = child.offsetLeft - (el.clientWidth - child.clientWidth) / 2;
        el.scrollTo({left, behavior});
    };

    // Nearest index to viewport center
    const getNearestIndex = (): number => {
        const el = containerRef.current;
        if (!el) return base;
        const center = el.scrollLeft + el.clientWidth / 2;
        let best = base,
            bestD = Number.POSITIVE_INFINITY;
        for (let i = 0; i < el.children.length; i++) {
            const c = el.children[i] as HTMLElement;
            const cc = c.offsetLeft + c.clientWidth / 2;
            const d = Math.abs(cc - center);
            if (d < bestD) {
                bestD = d;
                best = i;
            }
        }
        return best;
    };

    // Set initial scroll position to the middle group without animation
    React.useEffect(() => {
        scrollToIndex(tripled.length / 3, "instant");
    }, []);

    // Teleport when at either end
    React.useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onScroll = () => {
            const index = getNearestIndex();
            if (index < base / 2) {
                // Scrolled to the first group
                scrollToIndex(index + base, "instant");
            } else if (index >= base * 1.5) {
                // Scrolled to the last group
                scrollToIndex(index - base, "instant");
            }
        };
        el.addEventListener("scroll", onScroll, {passive: true});
        return () => el.removeEventListener("scroll", onScroll);
    });

    const scrollNext = () => scrollToIndex(getNearestIndex() + 1);
    const scrollPrev = () => scrollToIndex(getNearestIndex() - 1);

    // Autoplay
    React.useEffect(() => {
        if (!autoplay || reduceMotion) return;
        const id = window.setInterval(() => {
            if (paused || document.hidden) return;
            scrollNext();
        }, Math.max(1500, intervalMs));
        return () => window.clearInterval(id);
    }, [autoplay, paused, intervalMs, reduceMotion]);

    return (
        <div className="relative">
            {/* Edge fades */}
            <div
                className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 z-10 bg-gradient-to-r from-background to-transparent"/>
            <div
                className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 z-10 bg-gradient-to-l from-background to-transparent"/>

            {/* Controls */}
            <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2">
                <Button
                    isIconOnly
                    radius="full"
                    variant="shadow"
                    aria-label="Previous"
                    onPress={scrollPrev}
                    className="bg-background/30 backdrop-blur-md"
                >
                    <span className="text-2xl">‹</span>
                </Button>
            </div>
            <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2">
                <Button
                    isIconOnly
                    radius="full"
                    variant="shadow"
                    aria-label="Next"
                    onPress={scrollNext}
                    className="bg-background/30 backdrop-blur-md"
                >
                    <span className="text-2xl">›</span>
                </Button>
            </div>

            {/* Track */}
            <div
                ref={containerRef}
                className={`flex gap-4 overflow-x-auto overscroll-x-contain no-scrollbar snap-x snap-proximity scroll-smooth py-3 px-1 transition-opacity`}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                aria-label="Board games carousel"
            >
                {tripled.map((it, i) => (
                    <Card
                        key={`${it.id}-${i}`}
                        className="snap-center min-w-[220px] md:min-w-[260px] lg:min-w-[300px] bg-content1/60"
                    >
                        <CardBody className="p-0">
                            <Image
                                removeWrapper
                                alt={it.title}
                                className="h-[260px] w-full object-cover rounded-xl"
                                src={it.image}
                            />
                        </CardBody>
                        <CardFooter className="flex flex-col items-start gap-1">
                            <p className="text-base font-semibold leading-tight">{it.title}</p>
                            {it.subtitle ? (
                                <p className="text-foreground-500 text-sm">{it.subtitle}</p>
                            ) : null}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
