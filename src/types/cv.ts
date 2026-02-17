export interface CvProfile {
  name: string;
  location: string;
  email: string;
  phone: string;
}

export interface CvSection {
  title: string;
  lines: string[];
}

export interface CvKnowledge {
  generatedAt: string;
  sourceFile: string;
  profile: CvProfile;
  sections: CvSection[];
  rawText: string;
}

export interface SiteFacts {
  name: string;
  role: string;
  tagline: string;
  email: string;
  linkedinUrl: string;
  location: string;
  services: string[];
  audience: string;
  goals: string[];
  cta: {
    emailLabel: string;
    linkedinLabel: string;
    cvLabel: string;
  };
}
