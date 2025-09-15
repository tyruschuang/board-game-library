export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Boardy | The Ultimate Board Game Manager",
  description: "Organize your games. Discover new favorites. Plan the perfect game night.",
  features: [
    {
      name: "Personalized Collections",
      desc:
          "Mark games as Owned, Wishlisted, or Played. Filter by time, weight, or tags.",
      icon: "🎛️",
    },
    {
      name: "Powerful Discovery",
      desc:
          "Search by mechanics, themes, or player counts to find your next favorite.",
      icon: "🔎",
    },
    {
      name: "Similarity Engine",
      desc:
          "See recommendations with transparent reasons: “shares deck-building + 2–4 players.”",
      icon: "🧠",
    },
    {
      name: "Social Shelves",
      desc:
          "Follow friends, compare overlaps, and build shared collections for game nights.",
      icon: "👥",
    },
    {
      name: "Game Night Planner",
      desc:
          "Propose dates, auto-suggest games that fit your group size, and track RSVPs.",
      icon: "📆",
    },
    {
      name: "Privacy Controls",
      desc:
          "Fine-grained visibility for shelves and activity—public, friends-only, or private.",
      icon: "🔒",
    },
  ],
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Discover",
      href: "/discover",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Discover",
      href: "/discover",
    },
  ],
};
