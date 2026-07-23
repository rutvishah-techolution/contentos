import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCampaign, canAccessCampaign } from "@/lib/brain";

// Gates every /campaigns/[slug]/* page: you must own or have joined it.
export default async function CampaignLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, campaign] = await Promise.all([auth(), getCampaign(slug)]);
  if (!campaign) notFound();
  if (!canAccessCampaign(campaign, session?.user?.id)) notFound();
  return <>{children}</>;
}
