"use client";

import {ThemeProvider as NextThemesProvider} from "next-themes";

import * as React from "react";
import {HeroUIProvider} from "@heroui/system";
import {useRouter} from "next/navigation";

export function Providers({children}: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push}>
            <NextThemesProvider attribute="class" forcedTheme="light" defaultTheme="light">
                {children}
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
