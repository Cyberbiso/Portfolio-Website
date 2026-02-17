export interface PortfolioProject {
  repo: string;
  title: string;
  description: string;
  href: string;
  image: string;
  stack: string[];
}

export const portfolioProjects: PortfolioProject[] = [
  {
    repo: "Cyberbiso/Tourism",
    title: "Tourism Guide App",
    description: "Tourism guide app to explore Botswana destinations, travel spots, and local context.",
    href: "https://github.com/Cyberbiso/Tourism",
    image: "/images/projects/tourism-guide.jpg",
    stack: ["Mobile/Web", "Guides", "Botswana"]
  },
  {
    repo: "Cyberbiso/Bank-System-",
    title: "Java ATM System",
    description: "Java banking and ATM simulation focused on account flows, transactions, and core logic.",
    href: "https://github.com/Cyberbiso/Bank-System-",
    image: "/images/projects/bank-system.jpg",
    stack: ["Java", "OOP", "Console"]
  },
  {
    repo: "Cyberbiso/Video-Game-Discovery",
    title: "Video Game Discovery",
    description: "React web app for discovering and browsing video games with a clean UI experience.",
    href: "https://github.com/Cyberbiso/Video-Game-Discovery",
    image: "/images/projects/video-game-discovery.jpg",
    stack: ["React", "UI", "Discovery"]
  },
  {
    repo: "Cyberbiso/will-you-be-my-valentine",
    title: "Valentine Proposal",
    description: "Interactive valentine proposal project with playful UI and custom interaction flow.",
    href: "https://github.com/Cyberbiso/will-you-be-my-valentine",
    image: "/images/projects/valentine-proposal.jpg",
    stack: ["Frontend", "Animation", "Interactive"]
  }
];
