import type { NavItem } from "@/types";

/**
 * Primary navigation (design-brief section 7).
 *
 * In-page anchors on the homepage. The order matches the reading sequence a
 * prospective client follows: what I do, proof, who I am, how it works, cost,
 * then contact.
 */
export const navItems: NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

/** Section ids used as scroll targets and by the active-section observer. */
export const SECTION_IDS = {
  hero: "hero",
  services: "services",
  work: "work",
  about: "about",
  process: "process",
  pricing: "pricing",
  contact: "contact",
} as const;
