import type { Metadata } from "next";
import { MenuFull } from "@/components/site/menu-full";

export const metadata: Metadata = {
  title: "Menu — Jawad Design",
  description:
    "The full menu: portfolio sites and landing pages across three prix-fixe tiers, plus what every plate comes with. One chef, made to order, plated in five days.",
};

export default function MenuPage() {
  return <MenuFull />;
}
