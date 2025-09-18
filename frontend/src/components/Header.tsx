"use client"

import {Navbar, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle,} from "@heroui/navbar";
import {link as linkStyles} from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import {siteConfig} from "@/src/config/site";
import {Logo,} from "@/src/components/Icons";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {SearchBar} from "./SearchBar";
import {useEffect, useState} from 'react'
import {usePathname, useRouter} from "next/navigation";
import {apiFetch} from '@/src/lib/api'
import {Avatar} from '@/src/components/Avatar'
import {emitAuthChanged, onAuthChanged} from '@/src/lib/events'
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/dropdown";
import LogoutButton from '@/src/components/LogoutButton'

type User = { id: number; email: string; name: string }

export const Header = () => {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        let mounted = true

        async function load() {
            try {
                const res = await apiFetch('/api/auth/me')
                if (!mounted) return
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch {
                if (mounted) setUser(null)
            }
        }

        load()
        const off = onAuthChanged(() => {
            load()
        })
        return () => {
            mounted = false;
            off()
        }
    }, [pathname])

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
                {user ? (
                    <NavbarItem>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <Button color="primary" variant="solid" className="px-2">
                                    <span className="flex items-center gap-2">
                                        <Avatar name={user.name} email={user.email} size={24}/>
                                        <span className="hidden lg:inline">Profile</span>
                                    </span>
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Profile menu"
                                onAction={async (key) => {
                                    const k = String(key)
                                    if (k === 'profile') router.push('/profile')
                                    else if (k === 'settings') router.push('/settings')
                                    else if (k === 'logout') {
                                        try {
                                            await apiFetch('/api/auth/logout', {method: 'POST'})
                                        } finally {
                                            emitAuthChanged()
                                            router.replace('/login')
                                        }
                                    }
                                }}
                            >
                                <DropdownItem key="profile">Profile</DropdownItem>
                                <DropdownItem key="settings">Settings</DropdownItem>
                                <DropdownItem key="logout" className="text-danger" color="danger">Logout</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavbarItem>
                ) : (
                    <NavbarItem>
                        <Button color="primary">
                            <NextLink color={"primary"} href={isHome ? "/signup" : "/login"}>
                                {isHome ? "Get Started" : "Log In"}
                            </NextLink>
                        </Button>
                    </NavbarItem>
                )}

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
                                href={item.href}
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                    {user ? (
                        <>
                            <NavbarMenuItem>
                                <NextLink href="/profile" className="flex items-center gap-2">
                                    <Avatar name={user.name} email={user.email} size={28}/>
                                    <span>Profile</span>
                                </NextLink>
                            </NavbarMenuItem>
                            <NavbarMenuItem>
                                <LogoutButton/>
                            </NavbarMenuItem>
                        </>
                    ) : (
                        <NavbarMenuItem>
                            <NextLink href={isHome ? "/signup" : "/login"}>
                                {isHome ? "Get Started" : "Log In"}
                            </NextLink>
                        </NavbarMenuItem>
                    )}
                </div>
            </NavbarMenu>
        </Navbar>
    );
};
