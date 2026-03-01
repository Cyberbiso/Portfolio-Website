export interface PortfolioProject {
  repo: string;
  title: string;
  description: string;
  href: string;
  image: string;
  stack: string[];
  ctaLabel?: string;
}

export const portfolioProjects: PortfolioProject[] = [
  {
    repo: "Gym",
    title: "Jack's Gym Mockup",
    description: "Landing page mockup for Jack's Gym focused on bold branding, clear offers, and conversion-ready calls to action.",
    href: "https://thabisoai.netlify.app/",
    image: "/images/projects/jacks-gym-mockup.jpg",
    stack: ["Fitness", "Landing Page", "Mockup"],
    ctaLabel: "Visit Website"
  },
  {
    repo: "Tourism",
    title: "Tourism Guide App",
    description: "Tourism guide app to explore Botswana destinations, travel spots, and local context.",
    href: "https://github.com/Cyberbiso/Tourism",
    image: "/images/projects/tourism-guide.jpg",
    stack: ["Mobile/Web", "Guides", "Botswana"]
  },
  {
    repo: "Bank-System",
    title: "Java ATM System",
    description: "Java banking and ATM simulation focused on account flows, transactions, and core logic.",
    href: "https://github.com/Cyberbiso/Bank-System-",
    image: "/images/projects/bank-system.jpg",
    stack: ["Java", "OOP", "Console"]
  },
  {
    repo: "Video-Game-Discovery",
    title: "Video Game Discovery",
    description: "React web app for discovering and browsing video games with a clean UI experience.",
    href: "https://biso-game-hub.vercel.app/",
    image: "/images/projects/video-game-discovery.jpg",
    stack: ["React", "UI", "Discovery"],
    ctaLabel: "Visit Website"
  },
  {
    repo: "will-you-be-my-valentine",
    title: "Valentine Proposal",
    description: "Interactive valentine proposal project with playful UI and custom interaction flow.",
    href: "https://cyberbiso.github.io/will-you-be-my-valentine/",
    image: "/images/projects/valentine-proposal.jpg",
    stack: ["Frontend", "Animation", "Interactive"],
    ctaLabel: "Visit Website"
  }
];
