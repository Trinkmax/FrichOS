import { DigitalTwin } from "@/components/manager/DigitalTwin";

export default async function TwinPage({ params }: { params: Promise<{ chainSlug: string }> }) {
  const { chainSlug } = await params;
  return <DigitalTwin chainSlug={chainSlug} />;
}
