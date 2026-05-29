import type { Metadata } from "next";
import { WorkFull } from "@/components/site/work-full";

export const metadata: Metadata = {
  title: "Work — Jawad Design",
  description:
    "From the pass: weld, a two-sided developer marketplace designed and built solo — brand, product design, and a production Next.js build.",
};

export default function WorkPage() {
  return <WorkFull />;
}
