"use client"

import {Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle,} from "@heroui/navbar";
import {Input} from "@heroui/input";
import {link as linkStyles} from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import {siteConfig} from "@/src/config/site";
import {Logo, SearchIcon,} from "@/src/components/Icons";
import {Button} from "@heroui/button";
import { Link } from "@heroui/link";
import { SearchBar } from "./SearchBar";
import {usePathname} from "next/navigation";

export const Header = () => {

    const pathname = usePathname();

    const isHome = pathname === "/";

    return (
        <Navbar
            maxWidth="xl"
            className="sticky top-0 z-50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-default-100/40"
        >
            {/*Left*/}
            <NavbarContent justify="start">
                {/*Logo + Name, always shown*/}
                <NextLink className="flex justify-start items-center gap-2"
                          href="/">
                    <Logo/>
                    <p className="font-bold text-inherit">Boardy</p>
                </NextLink>
                {/*Desktop Header Content*/}
                <ul className="hidden md:flex gap-4 justify-start ml-2">
                    {siteConfig.navItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <NextLink
                                className={clsx(
                                    linkStyles({color: "foreground"}),
                                    "data-[active=true]:text-primary data-[active=true]:font-medium",
                                )}
                                color="foreground"
                                href={item.href}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            {/*Right, desktop*/}
            <NavbarContent justify="end" className="hidden basis-1/5 md:flex gap-2">
                {/*If home page is active*/}
                {!isHome && (
                    <NavbarItem>
                        <SearchBar/>
                    </NavbarItem>
                )}
                <NavbarItem>
                    <Button color="primary">
                        <NextLink color={"primary"} href={isHome ? "/signup" : "/login"}>
                            {isHome ? "Get Started" : "Log In"}
                        </NextLink>
                    </Button>
                </NavbarItem>

            </NavbarContent>

            {/*Right, mobile*/}
            <NavbarContent justify="end" className="md:hidden">
                <NavbarMenuToggle/>
            </NavbarContent>

            {/*Mobile nav*/}
            <NavbarMenu>
                <SearchBar/>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index === siteConfig.navMenuItems.length - 1
                                            ? "danger"
                                            : "foreground"
                                }
                                href="#"
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </Navbar>
    );
};
