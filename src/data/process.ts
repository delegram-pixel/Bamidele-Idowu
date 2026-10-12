import type { ProcessStep } from "@/types";

/**
 * The four-step process (PRD section 7.5, app-flow section 7).
 *
 * Written for a non-technical client: no jargon, no implied obligation, and no
 * invented guarantees about timelines or outcomes.
 */
export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We talk about the problem, who it is for, and what success looks like. I ask the awkward questions early so they are cheap to answer.",
  },
  {
    number: "02",
    title: "Planning",
    description:
      "I turn that conversation into a written scope: what is included, what is not, what it costs, and roughly how long it takes. Nothing starts until you agree to it.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "I design and build in visible stages, so you see progress as it happens rather than waiting for a single reveal at the end.",
  },
  {
    number: "04",
    title: "Launch & Support",
    description:
      "We deploy, check the real thing on real devices, and agree what support looks like afterwards. You get the code and a walkthrough either way.",
  },
];
