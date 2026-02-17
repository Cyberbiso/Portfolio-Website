import { describe, expect, it } from "vitest";
import cvKnowledge from "@/data/cv-knowledge.json";
import siteFacts from "@/data/site-facts.json";
import { buildSystemPrompt, getAllowedCitations } from "@/lib/prompt";

describe("buildSystemPrompt", () => {
  it("includes grounding and anti-fabrication guardrails", () => {
    const prompt = buildSystemPrompt(cvKnowledge, siteFacts);

    expect(prompt).toContain("Never fabricate credentials");
    expect(prompt).toContain("answer ONLY using the profile data");
    expect(prompt).toContain("SITE FACTS");
    expect(prompt).toContain("CV SECTIONS");
  });

  it("produces allowed citation labels", () => {
    const citations = getAllowedCitations(cvKnowledge);

    expect(citations).toContain("Summary");
    expect(citations).toContain("Experience");
    expect(citations).toContain("Site Facts");
  });
});
