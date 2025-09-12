import {Link} from "@heroui/link";
import {Snippet} from "@heroui/snippet";
import {Code} from "@heroui/code";
import {Card, CardBody, CardHeader} from "@heroui/card";
import {button as buttonStyles} from "@heroui/theme";

import {siteConfig} from "@/src/config/site";
import {subtitle, title} from "@/src/components/primitives";
import {GithubIcon} from "@/src/components/icons";

export default function Home() {
    return (
        <div className="flex flex-col gap-24">
            {/*Hero*/}
            <section className="flex flex-col md:flex-row gap-4">
                <span className={title() + " md:basis-1/2"}>
                    Organize your games. Discover new favorites. Plan the perfect game night.
                </span>
                {/*image here*/}
                <span>
                    image
                </span>
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
        </div>
    );
}
