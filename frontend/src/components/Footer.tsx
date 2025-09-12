"use client";

import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {Input} from "@heroui/input";
import NextLink from "next/link";
import {siteConfig} from "@/src/config/site";
import {Logo, GithubIcon} from "@/src/components/Icons";

export const Footer = () => {
    const year = new Date().getFullYear();

    const productLinks = siteConfig.navItems.filter(n => n.href !== "/");

    return (
        <footer className="mt-16">
            <div className="container mx-auto max-w-7xl px-6 md:px-12 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="flex flex-col gap-3">
                        <NextLink href="/" className="flex items-center gap-2">
                            <Logo/>
                            <span className="font-semibold">Boardy</span>
                        </NextLink>
                        <p className="text-foreground-500 text-sm">
                            {siteConfig.description}
                        </p>
                        <div className="flex gap-3 pt-1">
                            <Link isExternal href={siteConfig.links.github} aria-label="GitHub" className="text-foreground-500 hover:text-foreground">
                                <GithubIcon/>
                            </Link>
                            <Link isExternal href={siteConfig.links.discord} aria-label="Discord" className="text-foreground-500 hover:text-foreground">
                                <span className="text-xl">💬</span>
                            </Link>
                            <Link isExternal href={siteConfig.links.twitter} aria-label="Twitter" className="text-foreground-500 hover:text-foreground">
                                <span className="text-xl">𝕏</span>
                            </Link>
                            <Link isExternal href={siteConfig.links.docs} aria-label="Docs" className="text-foreground-500 hover:text-foreground">
                                <span className="text-xl">📚</span>
                            </Link>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground-600">Product</h3>
                        <ul className="mt-3 space-y-2">
                            {productLinks.map((item) => (
                                <li key={item.href}>
                                    <NextLink href={item.href} className="text-sm text-foreground-500 hover:text-foreground transition-colors">
                                        {item.label}
                                    </NextLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground-600">Resources</h3>
                        <ul className="mt-3 space-y-2">
                            <li>
                                <Link isExternal href={siteConfig.links.docs} className="text-sm text-foreground-500 hover:text-foreground transition-colors">Docs</Link>
                            </li>
                            <li>
                                <NextLink href="/blog" className="text-sm text-foreground-500 hover:text-foreground transition-colors">Blog</NextLink>
                            </li>
                            <li>
                                <NextLink href="/pricing" className="text-sm text-foreground-500 hover:text-foreground transition-colors">Pricing</NextLink>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground-600">Stay in the loop</h3>
                        <p className="text-foreground-500 text-sm mt-3">Get updates on new features and curated game picks.</p>
                        <form className="mt-4 flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                aria-label="Email address"
                                className="sm:flex-1"
                            />
                            <Button color="primary" type="submit">Subscribe</Button>
                        </form>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-foreground-500">
                    <p>© {year} Boardy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
