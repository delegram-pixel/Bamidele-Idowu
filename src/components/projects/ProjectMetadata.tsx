import { ExternalLink, Github } from "lucide-react";

import { MetaRow, MetaTable } from "@/components/ui/MetaTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils/cn";
import { isSafeExternalUrl } from "@/lib/utils/url";
import type { Project } from "@/types";

/**
 * Compact project metadata: role, stack, status, and any verified outbound
 * links.
 *
 * Shared between the homepage spreads and the case-study header so the two can
 * never drift apart.
 *
 * Every outbound link passes through `isSafeExternalUrl` before being rendered
 * (backend-schema section 10), and unset links are omitted entirely rather than
 * shown disabled — a dead "Visit" button is worse than no button.
 *
 * The previous version laid this out as a three-column card grid. It is now a
 * single label/value table, which is the reference's device and reads as a spec
 * sheet rather than as a dashboard widget: the labels form one clean vertical
 * edge on the left and the values stack into another on the right, so the eye
 * can run down either column. It also degrades better — a `grid-cols-3` card
 * grid leaves orphans when one project has a repository link and another does
 * not, where a table simply has fewer rows.
 */
export function ProjectMetadata({
  project,
  tone = "light",
}: {
  project: Project;
  tone?: "light" | "invert";
}) {
  const hasLiveUrl = isSafeExternalUrl(project.liveUrl);
  const hasRepositoryUrl = isSafeExternalUrl(project.repositoryUrl);

  // The underline is the only affordance on these links, so it has to stay
  // visible on both tones. `line-strong` is mixed from claret and disappears
  // against a claret panel, hence the explicit invert branch.
  const linkClassName = cn(
    "inline-flex items-center gap-1.5 underline underline-offset-4",
    tone === "invert"
      ? "decoration-invert-line hover:decoration-invert-ink"
      : "decoration-line-strong hover:decoration-ink",
  );

  return (
    <MetaTable>
      <MetaRow label="Role" tone={tone}>
        {project.role}
      </MetaRow>

      <MetaRow label="Stack" tone={tone}>
        {project.stack.join(", ")}
      </MetaRow>

      <MetaRow label="Status" tone={tone}>
        <StatusBadge status={project.status} tone={tone} />
      </MetaRow>

      {hasLiveUrl ? (
        <MetaRow label="Live" tone={tone}>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            Visit site
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        </MetaRow>
      ) : null}

      {hasRepositoryUrl ? (
        <MetaRow label="Code" tone={tone}>
          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            Repository
            <Github aria-hidden="true" className="size-3.5" />
          </a>
        </MetaRow>
      ) : null}
    </MetaTable>
  );
}
