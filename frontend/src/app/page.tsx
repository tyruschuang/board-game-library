import {Link} from "@heroui/link";
import {Snippet} from "@heroui/snippet";
import {Code} from "@heroui/code";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {button as buttonStyles} from "@heroui/theme";
import {Button} from "@heroui/button";
import {Chip} from "@heroui/chip";

import {siteConfig} from "@/src/config/site";
import {subtitle, title} from "@/src/components/primitives";
import {GithubIcon} from "@/src/components/Icons";
import {Carousel} from "@/src/components/Carousel";
import {sampleGames} from "@/src/data/sampleGames";
import {StatsSection} from "@/src/components/Stats";
import {SearchBar} from "@/src/components/SearchBar";
import clsx from "clsx";
import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-col gap-18">
            {/*Hero*/}
            <section
                id="hero"
                className="container mx-auto max-w-7xl relative min-h-[85vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
            >
                <div className="md:basis-1/2 flex flex-col gap-5">
                    <span className={title()}>
                        Organize your games. Discover new favorites. Plan the perfect game night.
                    </span>
                    {/* CTA block */}
                    <div className="flex flex-col gap-3 md:gap-4">
                        <SearchBar/>
                        <div className="flex flex-row gap-3">
                            <Button color="primary" size="lg" className="basis-full">Get Started</Button>
                            {/*TODO: HRef to search page*/}
                            <Button as={Link} href="#carousel" variant="bordered" size="lg" className="basis-full">Browse Games</Button>
                        </div>
                    </div>
                </div>
                {/*image here*/}
                <div className="hidden md:block md:basis-1/2">
                    <Image src="/images/hero.jpg" alt="Board Game" width={2400} height={2400}/>
                </div>
            </section>

            {/*Features*/}
            <section className="container mx-auto max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Everything you need to play more, faster
                </h2>
                <p className="text-foreground-500 mt-2">
                    Curate collections, discover similar games, and plan unforgettable game nights.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {siteConfig.features.map((f) => (
                        <Card key={f.name} className="bg-content1/50 backdrop-blur-md">
                            <CardHeader className="flex items-center gap-3">
                                <div className="text-2xl">{f.icon}</div>
                                <h3 className="text-xl font-semibold">{f.name}</h3>
                            </CardHeader>
                            <CardBody className="pt-0 text-foreground-600">
                                {f.desc}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </section>

            {/*Carousel*/}
            <section id="carousel" className="container mx-auto max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Hundreds of board games at your fingertips
                </h2>
                <p className="text-foreground-500 mt-2">
                    Browse highlights from classics to new hotness.
                </p>
                <div className="mt-6">
                    <Carousel
                        items={sampleGames.map(g => ({
                            id: g.id,
                            title: g.name,
                            image: g.image,
                            subtitle: g.year ? `${g.year} • ${g.players ?? ""}`.trim() : g.players,
                        }))}
                    />
                </div>
            </section>

            {/*Stats*/}
            <StatsSection />
        </div>
    );
}
