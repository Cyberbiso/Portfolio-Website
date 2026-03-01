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

  it("maps common CV heading variants into canonical section titles", () => {
    const sample = [
      "Thabiso Nathaniel Seleke",
      "Gaborone, Botswana",
      "+267 72510263 | mrthabiso.seleke@gmail.com",
      "PROFESSIONAL PROFILE",
      "Lead Java Web Application Developer.",
      "PROFESSIONAL EXPERIENCE",
      "Lead Java Developer - Sales Platform System.",
      "PROJECTS",
      "Personal Portfolio Website.",
      "LEADERSHIP EXPERIENCE",
      "Technical focal point for backend tasks.",
      "EDUCATION",
      "University of Botswana",
      "CERTIFICATIONS",
      "AWS Cloud Foundations Certificate",
      "SKILLS",
      "Java (Spring Boot)"
    ].join("\n");

    const parsed = parseCvText(sample);

    const summary = parsed.sections.find((section) => section.title === "Summary");
    const experience = parsed.sections.find((section) => section.title === "Experience");
    const education = parsed.sections.find((section) => section.title === "Education");

    expect(summary?.lines).toContain("Lead Java Web Application Developer.");
    expect(experience?.lines).toContain("Lead Java Developer - Sales Platform System.");
    expect(experience?.lines).toContain("Personal Portfolio Website.");
    expect(experience?.lines).toContain("Technical focal point for backend tasks.");
    expect(education?.lines).toContain("University of Botswana");
  });
});
