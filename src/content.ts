// All site copy lives here. Source: "Sixthroute Webpage.pdf" brief + Figma "Writing" frame.
// Items marked TODO need real details from the client before launch.

export const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "About Us", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "/contact/" },
];

export const CONTACT_HREF = "/contact/";
export const EMAIL = "hello@sixthroute.com"; // TODO: confirm the professional email address.

export const HERO = {
  eyebrow: "Creative · Strategy · Technology",
  headline: ["The future doesn't", "follow a route."],
  accent: "It creates one.",
  body:
    "We bring creativity, strategy, design, and technology together to build brands and digital experiences ready for what's next.",
  primary: "Let's Build Something",
  secondary: "Explore Our Work",
};

export const INTRO = {
  eyebrow: "About Sixth Route",
  headline: "A sharper route from idea to impact.",
  lead:
    "We believe the best ideas begin where conventional thinking ends. By connecting creativity, strategy, and technology, we find fresh perspectives and build smarter ways forward.",
  body:
    "Sixthroute brings creative, strategic, and technical thinking together under one roof. Instead of treating each service separately, we connect the dots to create cohesive solutions that move businesses forward.",
  statement: "Beyond the obvious.",
  link: "Discover Our Story",
};

// Name story. Written from the brand line "Beyond the obvious"; confirm the wording with the client.
export const NAME_STORY = {
  eyebrow: "Why “Sixth Route”",
  headline: ["Every brief arrives with", "five obvious routes."],
  accent: "We take the sixth.",
  body:
    "The safe one, the familiar one, the one everyone expects, the one copied from a competitor, the one chasing this month's trend. They all lead somewhere — usually somewhere already crowded. The sixth route is the one that hasn't been drawn yet. Finding it is the job, and it's where our name comes from.",
  routes: ["The safe route", "The familiar route", "The expected route", "The copied route", "The trending route"],
  sixth: "The sixth route",
};

export const MANIFESTO = [
  "What if we took a different route?",
  "Let's make ideas meaningful.",
  "Experiences accessible.",
  "Possibilities limitless.",
  "Let's make the unexpected official.",
  "The ordinary innovative.",
  "The static dynamic.",
  "And the future… something we create.",
  "Different thinking.",
  "A better direction.",
  "This is just the beginning.",
  "Welcome to Sixthroute.",
];

// The manifesto as a sequence of reroutes: the obvious word gets struck out, the new one underlined.
export const MANIFESTO_SCENE = {
  question: ["What if we took a", "different route?"],
  verb: "Let's make",
  pairs: [
    ["ideas", "meaningful."],
    ["experiences", "accessible."],
    ["possibilities", "limitless."],
    ["the unexpected", "official."],
    ["the ordinary", "innovative."],
    ["the static", "dynamic."],
  ] as [string, string][],
  future: ["And the future…", "something we create."],
  closers: ["Different thinking.", "A better direction.", "This is just the beginning."],
  welcome: "Welcome to Sixthroute.",
};

export type IconName = "spark" | "arrow" | "circles" | "squares" | "layers" | "dots" | "radial" | "plus";

export const CAPABILITIES: { title: string; body: string; icon: IconName }[] = [
  { title: "Creative & Design", body: "Graphic design, branding, art direction and visual identity.", icon: "spark" },
  { title: "Marketing & Advertising", body: "Digital marketing, paid ads, campaigns and lead generation.", icon: "arrow" },
  { title: "Social Media", body: "Social media management, content calendars and platform growth.", icon: "circles" },
  { title: "Content & Production", body: "Content creation, video editing, photography and production.", icon: "squares" },
  { title: "3D & Visualization", body: "3D design, CGI, rendering, animation and virtual staging.", icon: "layers" },
  { title: "Technology & Web", body: "Website design, development, UI/UX and technical solutions.", icon: "dots" },
  { title: "SEO & Online Presence", body: "SEO, AEO, website optimization and organic visibility.", icon: "radial" },
  {
    title: "Strategy & Creative Innovation",
    body: "Brand strategy, creative concepts, campaign planning and future-facing creative solutions.",
    icon: "plus",
  },
];

export const CAPABILITIES_HEAD = {
  eyebrow: "What We Do",
  headline: "Eight disciplines. One bigger picture.",
  body:
    "From creative and marketing to technology and strategy, we bring diverse expertise together to solve challenges, seize opportunities, and help businesses move forward.",
};

export type ProjectArtKind = "identity" | "render" | "campaign" | "web" | "social" | "search";

// TODO: replace the concepts with real case studies as they become available.
export const PROJECTS: {
  title: string;
  kind: ProjectArtKind;
  label: "Studio project" | "Self-initiated concept";
  disciplines: string[];
  challenge: string;
  approach: string;
  decisions: string;
}[] = [
  {
    title: "Sixth Route identity",
    kind: "identity",
    label: "Studio project",
    disciplines: ["Branding", "Visual identity", "Art direction"],
    challenge: "Give a multidisciplinary studio one mark that can carry creative, marketing and technology work without favouring any of them.",
    approach: "We started from a single idea — a route that bends away from the obvious — and drew it as one continuous line that resolves into a 6.",
    decisions: "A warm orange for energy, a deep maroon for depth, a heavy/light wordmark pairing, and a glow reserved for dark surfaces.",
  },
  {
    title: "Ember product renders",
    kind: "render",
    label: "Self-initiated concept",
    disciplines: ["3D & Visualization", "CGI", "Lighting"],
    challenge: "Show how 3D visualization can sell a product before a single prototype exists.",
    approach: "Studio-lit CGI scenes with glossy materials, built so every angle and colourway can be re-rendered on demand.",
    decisions: "One light source, warm rim light and a dark set so the form does the talking.",
  },
  {
    title: "Beyond the Obvious campaign",
    kind: "campaign",
    label: "Self-initiated concept",
    disciplines: ["Campaigns", "Copywriting", "Out-of-home"],
    challenge: "Launch a brand line that has to work on a billboard, a story and a search ad at once.",
    approach: "A typographic system that scales from a 48-sheet poster to a 9:16 frame without losing the idea.",
    decisions: "Big type, one accent colour, and copy that asks a question instead of making a claim.",
  },
  {
    title: "Atlas studio website",
    kind: "web",
    label: "Self-initiated concept",
    disciplines: ["UI/UX", "Web development", "SEO foundations"],
    challenge: "Make a services-heavy website feel simple to navigate.",
    approach: "Task-led navigation, a component library, and pages written around the questions visitors actually ask.",
    decisions: "Generous type, clear hierarchy and performance budgets set before design started.",
  },
  {
    title: "Daybreak social system",
    kind: "social",
    label: "Self-initiated concept",
    disciplines: ["Social media", "Content", "Templates"],
    challenge: "Keep a high-volume content calendar on brand across five platforms.",
    approach: "A modular template kit and a monthly content plan the in-house team can run with.",
    decisions: "Platform-native ratios, motion-first stories and a recognisable colour block.",
  },
  {
    title: "Signal search visibility",
    kind: "search",
    label: "Self-initiated concept",
    disciplines: ["SEO", "AEO", "Analytics"],
    challenge: "Be the answer when customers search — and when they ask an AI assistant.",
    approach: "Technical fixes, structured content and answer-ready pages, measured against a clear baseline.",
    decisions: "Write for people first, mark up for machines second, and report on what actually moves.",
  },
];

export const PROJECTS_HEAD = {
  eyebrow: "Featured Projects",
  headline: "Ideas in action.",
  body:
    "A selection of projects exploring creative thinking, strategic problem-solving, and digital execution. Each one offers a closer look at the thinking, process, and craft behind the work.",
};

export const WHY = {
  eyebrow: "Why Sixthroute",
  headline: ["Less juggling.", "More connected thinking."],
  body:
    "Sixthroute brings diverse expertise into one coordinated process, connecting strategy with execution while adapting the team and approach to each project's needs.",
  points: [
    { title: "One point of contact", body: "One team holds the whole brief, so nothing gets lost between vendors." },
    { title: "Clearer collaboration", body: "Strategy, creative and technology sit in the same room from day one." },
    { title: "One direction", body: "Every deliverable moves the same way, toward the same goal." },
  ],
};

export const PROCESS_HEAD = {
  eyebrow: "Our Process",
  headline: "How We Make Things Happen",
  body:
    "Every project needs the right mix of thinking, talent, and execution. Our process connects the dots between your business goals and the work required to bring them to life.",
};

export const PROCESS = [
  {
    title: "Discover & Understand",
    body: "We learn about your business, audience, challenges, and goals to understand what the project needs.",
  },
  {
    title: "Strategise & Align",
    body: "We define the scope, select the right capabilities, and establish a clear direction, timeline, and deliverables.",
  },
  {
    title: "Create & Execute",
    body: "We bring together the right expertise across creative, marketing, content, 3D, technology, and strategy to deliver the work.",
  },
  {
    title: "Launch & Evolve",
    body: "We deliver the final work, review outcomes where applicable, and identify opportunities to improve or build on what comes next.",
  },
];

export const PROOF = {
  eyebrow: "Proof, not promises",
  headline: "The Work Speaks for Itself.",
  body: "Explore how we approach creative challenges, connect disciplines, and turn ideas into considered solutions.",
  items: [
    { title: "Selected projects", body: "Real work and clearly labelled self-initiated concepts.", href: "#work", icon: "squares" as IconName },
    { title: "Behind the work", body: "The challenge, approach, and design decisions behind each project.", href: "#work", icon: "spark" as IconName },
    { title: "Our capabilities", body: "Relevant examples of design, marketing, content, and technology work.", href: "#services", icon: "layers" as IconName },
  ],
};

export const FAQ_HEAD = {
  eyebrow: "FAQs",
  headline: "Have a different question?",
  body: "Let's talk about your next move.",
};

export const FAQS = [
  {
    q: "What does Sixthroute do?",
    a: "Sixthroute is a multidisciplinary creative, marketing, and technology agency that brings strategy, design, content, digital marketing, 3D visualization, web development, and SEO together to help businesses build their presence and grow.",
  },
  {
    q: "What services does Sixthroute offer?",
    a: "Our services span creative and graphic design, branding, visual identity, digital marketing, paid advertising, social media management, content production, video editing, 3D design and animation, website design and development, UI/UX, SEO, AEO, and creative strategy.",
  },
  {
    q: "Can I hire Sixthroute for a single service?",
    a: "Yes. You can work with us on a specific requirement, such as a brand identity, website, marketing campaign, or content project, or combine multiple services into a coordinated solution.",
  },
  {
    q: "How does Sixthroute approach a new project?",
    a: "We begin by understanding your business, audience, objectives, and challenges. From there, we define the scope, identify the right expertise, establish a clear direction, and move into creation, execution, and delivery.",
  },
  {
    q: "Does Sixthroute work with startups and established businesses?",
    a: "We work with businesses at different stages, from startups building their identity and digital presence to established companies looking to strengthen their marketing, improve their digital experiences, or explore new opportunities.",
  },
  {
    q: "Can Sixthroute handle an entire project from strategy to execution?",
    a: "Where the project scope allows, yes. We can connect strategic planning with design, content, marketing, and technical execution, helping maintain consistency across the different parts of a project.",
  },
  {
    q: "Does Sixthroute create custom solutions or use standard packages?",
    a: "Our approach depends on your goals, scope, and budget. We tailor the combination of services and deliverables to the project rather than forcing every business into the same solution.",
  },
  {
    q: "How do I get started with Sixthroute?",
    a: "Tell us about your business, what you want to achieve, and the challenge you need to solve. We'll discuss your requirements, recommend a suitable approach, and outline the next steps.",
  },
];

export const CTA = {
  eyebrow: "Start a project",
  headline: ["Have a Vision?", "Let's Give It Direction."],
  primary: "Start a Project",
  secondary: "Tell Us About Your Project",
};

export const FOOTER = {
  description:
    "Sixthroute is a multidisciplinary creative, marketing and technology studio. We connect strategy, design, content and code to build brands ready for what's next.",
  columns: [
    {
      title: "Main Pages",
      links: [
        { label: "Home", href: "#top" },
        { label: "Services", href: "#services" },
        { label: "Work", href: "#work" },
        { label: "About", href: "#about" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "/contact/" },
      ],
    },
    {
      title: "Services",
      links: [
        { label: "Creative & Design", href: "#services" },
        { label: "Marketing & Advertising", href: "#services" },
        { label: "Social Media", href: "#services" },
        { label: "3D & Visualization", href: "#services" },
        { label: "Technology & Web", href: "#services" },
        { label: "SEO & Online Presence", href: "#services" },
      ],
    },
    {
      title: "Utility Pages",
      links: [
        { label: "Contact form", href: "/contact/#brief" },
        { label: "404", href: "/404.html" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" }, // TODO: add page
        { label: "Terms of Service", href: "/terms" }, // TODO: add page
      ],
    },
    {
      title: "Social",
      // TODO: replace with the studio's verified profile URLs.
      links: [
        { label: "Instagram", href: "https://instagram.com/" },
        { label: "LinkedIn", href: "https://linkedin.com/" },
        { label: "Behance", href: "https://behance.net/" },
        { label: "X", href: "https://x.com/" },
      ],
    },
  ],
};

export const CONTACT_PAGE = {
  eyebrow: "Contact Us",
  headline: "Have a vision?",
  accent: "Let's give it direction.",
  body:
    "Tell us about your business, what you want to achieve, and the challenge you need to solve. We'll discuss your requirements, recommend a suitable approach, and outline the next steps.",
  next: [
    { title: "You share the brief", body: "A few lines about your business, your goals and what's in the way." },
    { title: "We talk it through", body: "We discuss your requirements and ask the questions that shape the scope." },
    { title: "We recommend a route", body: "You get a suitable approach, the right mix of capabilities and clear next steps." },
  ],
  timelines: ["As soon as possible", "In the next 3 months", "Later this year", "Not sure yet"],
};

export const NOT_FOUND = {
  headline: "This route doesn't go anywhere.",
  body: "The link may be broken, or the page may have moved. Pick a route below to get back on track.",
  links: [
    { label: "Services", href: "/#services" },
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#about" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact/" },
  ],
};
