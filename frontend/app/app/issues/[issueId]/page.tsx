import { IssueAiPanel } from "@/components/ai/issue-ai-panel";

export default async function IssueDetailPage({
  params
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = await params;

  return <IssueAiPanel issueId={issueId} />;
}
