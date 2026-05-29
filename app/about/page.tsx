import type { Metadata } from "next";
import { ChefFull } from "@/components/site/chef-full";

export const metadata: Metadata = {
  title: "About — Jawad Design",
  description:
    "Meet the chef. Jawad is a designer and developer running a one-chef studio — every site cooked by one pair of hands, brief to launch.",
};

export default function AboutPage() {
  return <ChefFull />;
}
