import {
    Navbar as HeroUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from "@heroui/navbar";
import {Button} from "@heroui/button";
import {Link} from "@heroui/link";
import {Input} from "@heroui/input";
import {link as linkStyles} from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import {siteConfig} from "@/src/config/site";
import {HeartFilledIcon, Logo, SearchIcon,} from "@/src/components/icons";

export const Navbar = () => {
    const searchInput = (
        <Input
            aria-label="Search"
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
            }}
            labelPlacement="outside"
            placeholder="Search Board Games"
            startContent={
                <SearchIcon
                    className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
            }
            type="search"
        />
    );

    return (
        <HeroUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                {/*Logo + Name*/}
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink className="flex justify-start items-center gap-1"
                              href="/frontend/public">
                        <Logo/>
                        <p className="font-bold text-inherit">Boardy</p>
                    </NextLink>
                </NavbarBrand>
                {/*Desktop Navbar Content*/}
                <ul className="hidden lg:flex gap-4 justify-start ml-2">
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

            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end"
            >
                {/*Search Bar*/}
                <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
                <NavbarItem className="hidden md:flex">
                    <Button
                        isExternal
                        as={Link}
                        className="text-sm font-normal text-default-600 bg-default-100"
                        href={siteConfig.links.sponsor}
                        startContent={<HeartFilledIcon className="text-danger"/>}
                        variant="flat"
                    >
                        Sponsor
                    </Button>
                </NavbarItem>
            </NavbarContent>

            {/* Mobile Navbar Content */}
            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <NavbarMenuToggle/>
            </NavbarContent>

            <NavbarMenu>
                {searchInput}
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
    );
};
