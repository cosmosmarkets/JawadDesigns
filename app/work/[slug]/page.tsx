import { Placeholder } from "@/components/site/placeholder";

export default function WorkSlugPage({ params }: { params: { slug: string } }) {
  return (
    <Placeholder
      kicker={`Work · ${params.slug}`}
      title="Case study coming soon."
      copy="This project is still being plated. The full write-up arrives in a later service."
    />
  );
}
