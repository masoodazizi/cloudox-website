export const SITE = {
  name: "CloudoX",
  tagline: "Intelligent Cloud Knowledge Platform",
  description:
    "CloudoX is the intelligent cloud knowledge platform. It turns AWS-native evidence into a knowledge graph, interprets it, and projects audience-specific understanding for executives, architects, operations, security, and FinOps. Understand any cloud environment in under 30 minutes — AWS-first today, multi-cloud tomorrow.",
  url: "https://cloudox.io",
  ogImage: "/og/cloudox-og.svg",
  twitter: "",
  github: "",
  /**
   * Booking link for a 1:1 call. Uses Zeeg under the hood; centralising it
   * here so it can be updated in one place if the scheduling provider
   * changes.
   */
  bookingUrl: "https://zeeg.me/cloudox",
} as const;

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { label: "Product", href: "/product" },
  { label: "Knowledge Views", href: "/knowledge-views" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Early Access", href: "/contact" },
];

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Overview", href: "/product" },
      { label: "Knowledge Views", href: "/knowledge-views" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Use Cases", href: "/use-cases" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "RSS", href: "/rss.xml" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "Early Access", href: "/contact" },
      { label: "Book a call", href: "https://zeeg.me/cloudox", external: true },
    ],
  },
];
