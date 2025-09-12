"use client"

import {Navbar as HeroUINavbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle,} from "@heroui/navbar";
import {Input} from "@heroui/input";
import {link as linkStyles} from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import {siteConfig} from "@/src/config/site";
import {Logo, SearchIcon,} from "@/src/components/icons";
import {Button} from "@heroui/button";
import { Link } from "@heroui/link";
import { SearchBar } from "./SearchBar";
import {usePathname} from "next/navigation";

export const Header = () => {

    const pathname = usePathname();

    const isHome = pathname === "/";

    return (
        <HeroUINavbar maxWidth="xl" position="static">
            {/*Left*/}
            <NavbarContent justify="start">
                {/*Logo + Name, always shown*/}
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1"
                              href="/">
                        <Logo/>
                        <p className="font-bold text-inherit">Boardy</p>
                    </NextLink>
                </NavbarBrand>
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
            <NavbarContent justify="end" className="hidden basis-1/5 md:flex">
                {/*If home page is active*/}
                {!isHome && (
                    <NavbarItem>
                        <SearchBar/>
                    </NavbarItem>
                )}
                <NavbarItem>
                    <Button color={"primary"}>
                        {isHome ? "Get Started" : "Log In"}
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
        </HeroUINavbar>
        //
        //     <NavbarContent
        //         className="hidden sm:flex basis-1/5 sm:basis-full"
        //         justify="end"
        //     >
        //         {/*Search Bar*/}
        //         <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        //         <NavbarItem className="hidden md:flex">
        //             <Button
        //                 isExternal
        //                 as={Link}
        //                 className="text-sm font-normal text-default-600 bg-default-100"
        //                 href={siteConfig.links.sponsor}
        //                 startContent={<HeartFilledIcon className="text-danger"/>}
        //                 variant="flat"
        //             >
        //                 Sponsor
        //             </Button>
        //         </NavbarItem>
        //     </NavbarContent>
        //
        //     {/* Mobile Header Content */}
        //     <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        //         <NavbarMenuToggle/>
        //     </NavbarContent>
        //
        //     <NavbarMenu>
        //         {searchInput}
        //         <div className="mx-4 mt-2 flex flex-col gap-2">
        //             {siteConfig.navMenuItems.map((item, index) => (
        //                 <NavbarMenuItem key={`${item}-${index}`}>
        //                     <Link
        //                         color={
        //                             index === 2
        //                                 ? "primary"
        //                                 : index === siteConfig.navMenuItems.length - 1
        //                                     ? "danger"
        //                                     : "foreground"
        //                         }
        //                         href="#"
        //                         size="lg"
        //                     >
        //                         {item.label}
        //                     </Link>
        //                 </NavbarMenuItem>
        //             ))}
        //         </div>
        //     </NavbarMenu>
        // </HeroUINavbar>
    );
};
