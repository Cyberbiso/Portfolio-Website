import { describe, expect, it } from "vitest";
import { parseCvText } from "../../scripts/ingest-cv";

describe("parseCvText", () => {
  it("extracts profile and section data from CV text", () => {
    const sample = [
      "Jane Developer",
      "Nairobi, Kenya",
      "+254700000000 | jane@example.com",
      "Summary",
      "Full-stack engineer.",
      "Education",
      "BSc Computer Science",
      "Certifications",
      "AWS CCP",
      "Skills",
      "Java, Angular",
      "Experience",
      "Built APIs",
      "References",
      "Available upon request"
    ].join("\n");

    const parsed = parseCvText(sample);

    expect(parsed.profile.name).toBe("Jane Developer");
    expect(parsed.profile.location).toBe("Nairobi, Kenya");
    expect(parsed.profile.email).toBe("jane@example.com");
    expect(parsed.profile.phone).toBe("+254700000000");

    const summary = parsed.sections.find((section) => section.title === "Summary");
    const experience = parsed.sections.find((section) => section.title === "Experience");

    expect(summary?.lines).toContain("Full-stack engineer.");
    expect(experience?.lines).toContain("Built APIs");
  });
});
