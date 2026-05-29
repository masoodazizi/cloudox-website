export const SITE = {
  name: "CloudoX",
  tagline: "Intelligent Cloud Knowledge Platform",
  description:
    "CloudoX is the intelligent cloud knowledge platform that continuously discovers, documents, analyzes, and tracks the evolution of your cloud infrastructure. Understand any cloud environment in under 30 minutes — AWS-first today, multi-cloud tomorrow.",
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
  { label: "Use Cases", href: "/use-cases" },
  { label: "How It Works", href: "/how-it-works" },
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
