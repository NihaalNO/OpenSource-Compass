import { ContributionWorkspacePage } from "@/components/workspace/contribution-workspace";

export default async function RepositoryWorkspaceRoute({
  params
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  return <ContributionWorkspacePage owner={decodeURIComponent(owner)} repo={decodeURIComponent(repo)} />;
}
