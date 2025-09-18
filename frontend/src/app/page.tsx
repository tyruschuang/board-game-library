import {Link} from "@heroui/link";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {Button} from "@heroui/button";

import {siteConfig} from "@/src/config/site";
import {title} from "@/src/components/primitives";
import {Carousel} from "@/src/components/Carousel";
import {sampleGames} from "@/src/config/sampleGames";
import {StatsSection} from "@/src/components/Stats";
import {SearchBar} from "@/src/components/SearchBar";
import Image from "next/image";

export default function Home() {
    return (
        <div className="relative flex flex-col gap-18 overflow-hidden">
            {/*Hero*/}
            <section
                id="hero"
                className="container mx-auto max-w-7xl relative min-h-[85vh] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
            >
                {/* Hero backdrop: gradient + subtle fade texture */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -z-20 left-1/2 -translate-x-1/2 top-[-6%] h-[120%] w-[140%] rounded-[48px] bg-gradient-to-b from-primary/10 via-fuchsia-500/5 to-transparent dark:from-primary/15 [mask-image:radial-gradient(1100px_600px_at_50%_15%,black,transparent_70%)]"
                />
                <div className="md:basis-1/2 flex flex-col gap-5">
                    <span className={title()}>
                        {siteConfig.description}
                    </span>
                    {/* CTA block */}
                    <div className="flex flex-col gap-3 md:gap-4">
                        <SearchBar/>
                        <div className="flex flex-row gap-3">
                            <Button color="primary" size="lg" className="basis-full">Get Started</Button>
                            {/*TODO: HRef to search page*/}
                            <Button as={Link} href="#carousel" variant="bordered" size="lg" className="basis-full">Browse
                                Games</Button>
                        </div>
                    </div>
                </div>
                {/*image here*/}
                <div className="hidden md:block md:basis-1/2">
                    <Image
                        src="/images/hero.png"
                        alt="Board Game"
                        width={2400}
                        height={2400}
                        priority
                        className="select-none motion-safe:animate-float-slow motion-reduce:animate-none will-change-transform transition-transform duration-700 ease-out drop-shadow-[0_20px_60px_rgba(56,189,248,0.25)] dark:drop-shadow-[0_16px_50px_rgba(99,102,241,0.25)] hover:-rotate-1 hover:scale-[1.02]"
                    />
                </div>
            </section>

            {/*Features*/}
            <section className="container mx-auto max-w-7xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    All your board gaming needs in one place
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
            <StatsSection/>
        </div>
    );
}
