import { Suspense } from "react";
import { WorkspaceSelector } from "@/components/workspace/contribution-workspace";

export default function ContributionsPage() {
  return (
    <Suspense fallback={<div className="openforge-card p-5 text-sm text-muted-foreground">Loading Workspace...</div>}>
      <WorkspaceSelector />
    </Suspense>
  );
}
