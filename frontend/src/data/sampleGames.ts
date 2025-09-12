export type Game = {
    id: string;
    name: string;
    image: string;
    year?: number;
    rating?: number;
    players?: string;
};

export const sampleGames: Game[] = [
    { id: "catan", name: "Catan", image: "https://picsum.photos/seed/catan/800/600", year: 1995, players: "3–4" },
    { id: "gloomhaven", name: "Gloomhaven", image: "https://picsum.photos/seed/gloomhaven/800/600", year: 2017, players: "1–4" },
    { id: "azul", name: "Azul", image: "https://picsum.photos/seed/azul/800/600", year: 2017, players: "2–4" },
    { id: "wingspan", name: "Wingspan", image: "https://picsum.photos/seed/wingspan/800/600", year: 2019, players: "1–5" },
    { id: "terraforming-mars", name: "Terraforming Mars", image: "https://picsum.photos/seed/terraforming/800/600", year: 2016, players: "1–5" },
    { id: "ticket-to-ride", name: "Ticket to Ride", image: "https://picsum.photos/seed/ticket/800/600", year: 2004, players: "2–5" },
    { id: "root", name: "Root", image: "https://picsum.photos/seed/root/800/600", year: 2018, players: "2–4" },
    { id: "7wonders", name: "7 Wonders", image: "https://picsum.photos/seed/7wonders/800/600", year: 2010, players: "2–7" },
    { id: "pandemic", name: "Pandemic", image: "https://picsum.photos/seed/pandemic/800/600", year: 2008, players: "2–4" },
    { id: "brass", name: "Brass: Birmingham", image: "https://picsum.photos/seed/brass/800/600", year: 2018, players: "2–4" },
    { id: "carcassonne", name: "Carcassonne", image: "https://picsum.photos/seed/carcassonne/800/600", year: 2000, players: "2–5" },
    { id: "dune", name: "Dune: Imperium", image: "https://picsum.photos/seed/dune/800/600", year: 2020, players: "1–4" },
];

