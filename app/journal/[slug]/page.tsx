import { Placeholder } from "@/components/site/placeholder";

export default function JournalSlugPage({ params }: { params: { slug: string } }) {
  return (
    <Placeholder
      kicker={`Journal · ${params.slug}`}
      title="This entry is still cooking."
      copy="The post you're after hasn't been served yet. Check back soon."
    />
  );
}
