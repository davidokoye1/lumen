import { ChartColumn, Dumbbell, GraduationCap, House, Library, Settings, Trophy, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; mobile?: boolean };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: House, mobile: true },
  { href: "/learn", label: "Program", icon: GraduationCap, mobile: true },
  { href: "/train", label: "Practice", icon: Dumbbell, mobile: true },
  { href: "/library", label: "Library", icon: Library, mobile: true },
  { href: "/analytics", label: "Progress", icon: ChartColumn, mobile: true },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

export const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: Settings };
