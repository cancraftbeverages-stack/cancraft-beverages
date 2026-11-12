export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Capabilities", href: "/capabilities" },
  { label: "Beverages", href: "/beverages" },
  { label: "Private Label", href: "/private-label" },
  { label: "Contract Manufacturing", href: "/contract-manufacturing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  // INFINITY is linked from the footer only while its page is held.
  { label: "Contact", href: "/contact" },
];

export const startProjectHref = "/start-your-project";
