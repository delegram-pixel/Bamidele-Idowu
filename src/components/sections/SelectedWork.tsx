import { Reveal } from "@/components/motion/Reveal";
import { ProjectRail } from "@/components/projects/ProjectRail";
import { ProjectSpread } from "@/components/projects/ProjectSpread";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SECTION_IDS } from "@/data/nav";
import { getFeaturedProjects } from "@/data/projects";

/**
 * Selected Work (PRD section 7.3, design-brief sections 8 and 9).
 *
 * A Server Component that fetches published, featured projects and hands the
 * pre-rendered spreads to the client-side rail as children. That split matters:
 * the rail needs to be a Client Component to manage scrolling, but the project
 * content itself stays server-rendered, so it is in the initial HTML and does
 * not inflate the client bundle.
 *
 * The rail owns the index counter and the index list, because it already owns
 * the `activeIndex` they render. Passing titles down for the list keeps that
 * state in one place rather than duplicating an observer here.
 */
export function SelectedWork() {
  const projects = getFeaturedProjects();

  if (projects.length === 0) {
    // Guarded rather than assumed: the content validator errors on an empty
    // set, so this branch should be unreachable in a built site.
    return null;
  }

  return (
    <Section id={SECTION_IDS.work} ariaLabel="Selected work">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Selected work"
            title="Things I have built"
            description="A few projects, with the problem each one solved and what I actually did. Screenshots are added once they are approved for public use."
          />
        </Reveal>
      </div>

      {/* The rail is wider than the text column on purpose: the horizontal
          presentation reads better with the next project visible at the edge. */}
      <div className="container-page mt-14 lg:mt-20">
        <ProjectRail
          itemCount={projects.length}
          labels={projects.map((project) => project.title)}
        >
          {projects.map((project, index) => (
            <ProjectSpread
              key={project.slug}
              project={project}
              index={index}
              total={projects.length}
            />
          ))}
        </ProjectRail>
      </div>
    </Section>
  );
}
