export const SITE = {
  name: "CloudoX",
  tagline: "Cloud Discovery, Intelligent Documentation.",
  description:
    "CloudoX helps consultants and cloud engineers understand cloud environments in under 30 minutes and generate stakeholder-ready discovery reports — AWS-first today, multi-cloud tomorrow.",
  url: "https://cloudox.io",
  ogImage: "/og/cloudox-og.svg",
  twitter: "",
  github: "",
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
      { label: "Contact", href: "/contact" },
    ],
  },
];
