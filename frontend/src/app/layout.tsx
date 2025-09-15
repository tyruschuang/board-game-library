import "@/src/styles/globals.css";
import {Metadata} from "next";
import clsx from "clsx";

import {Providers} from "./providers";

import {siteConfig} from "@/src/config/site";
import {fontSans} from "@/src/config/fonts";
import {Header} from "@/src/components/Header";
import {Footer} from "@/src/components/Footer";
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html suppressHydrationWarning lang="en">
        <head/>
        <body
            className={clsx(
                "min-h-screen text-foreground bg-background font-sans antialiased",
                fontSans.variable,
            )}
        >
        <Providers>
            <Analytics/>
            <SpeedInsights/>
            <main className="container mx-auto max-w-7xl relative flex flex-col h-screen">
                <Header/>
                <section className="pt-2 px-6 flex-grow md:px-12">
                    {children}
                </section>
                <Footer/>
            </main>
        </Providers>
        </body>
        </html>
    );
}
