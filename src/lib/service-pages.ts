import type { ServiceStep } from "@/components/pages/ServiceSteps";

/*
 * The six individual service pages (/[slug], e.g. /content-creation). Copy comes from the "Website Services Page"
 * document (JOVENS BUZZ – SERVICE PAGES); service names are the ones the homepage services accordion
 * already uses. Headings are split into the white lead and the orange accent of the page design.
 */

type Accent = { lead: string; accent: string };
type Img = { src: string; alt: string; width: number; height: number };

export interface ServicePage {
  slug: string;
  /** Full service name (nav, breadcrumb, eyebrow) */
  name: string;
  /** "SERVICE 01 / SMM" label from the document */
  code: string;
  seoTitle: string;
  seoDescription: string;
  /** Document line 1 (shown under the H1) */
  tagline: string;
  /** Document line 2 (the H1) */
  headline: Accent;
  /** "The Service" paragraph */
  intro: string;
  problem: { title: Accent; text: string; image: Img };
  steps: [ServiceStep, ServiceStep, ServiceStep, ServiceStep];
  toolkit: string[];
  /** Optional one-line description under each toolkit item (shown with "Step one"… labels) */
  toolkitDetails?: string[];
  outcome: { title: Accent; text: string };
  closing: Accent;
}

const img = (src: string, alt: string, width: number, height: number): Img => ({ src: `/assets/images/${src}`, alt, width, height });

// One-line description under each "What This Can Include" item (same five lines on every service page)
const TOOLKIT_DETAILS = [
  "We align goals, audience, scope, and success metrics.",
  "We define messaging, visual mood, and layout priorities.",
  "We craft screens, components, and key visuals with a clear hierarchy.",
  "We iterate fast, validate details, and polish for consistency.",
  "We ship final files, handoff docs, and launch-ready assets.",
];

const step = (number: string, name: string, text: string, image: Img): ServiceStep => ({ number, name, text, image });

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "social-media-marketing",
    name: "Social Media Marketing",
    code: "Service 01 / SMM",
    seoTitle: "Social Media Marketing – Jovens Buzz",
    seoDescription:
      "Social media marketing with a plan: content themes, platform priorities, posting rhythm and performance reviews that make every post move your brand forward.",
    tagline: "What to post, when to post and why.",
    headline: { lead: "Make every post move your", accent: "brand forward." },
    intro:
      "Being active on social media is easy. Being consistent, recognisable and purposeful takes a plan. We turn your social channels into a clear, connected presence—so every post has a reason to exist and every platform has a role to play.",
    problem: {
      title: { lead: "Posting more isn’t the", accent: "same as growing." },
      text: "Without a clear direction, content can feel random: one week you post often, the next week you disappear. A considered social media strategy gives your brand a steady voice, a recognisable look and a better chance of reaching the people who matter.",
      image: img("services/social-media-marketing-overview.webp", "A smiling man on a beanbag working on a laptop, surrounded by social media icons", 577, 536),
    },
    steps: [
      step("01", "Understand your brand", "We learn about your business, audience, goals, voice and current social presence.", img("services/social-media-marketing-step-1.png", "Team members reviewing brand colour swatches on a tablet", 258, 276)),
      step("02", "Build the strategy", "We shape content themes, platform priorities, posting rhythm and campaign direction around your objectives.", img("services/social-media-marketing-step-2.png", "Hands holding a Branding card and colour swatches in front of a screen of brand visuals", 258, 276)),
      step("03", "Create and publish", "We plan the calendar, develop the content and keep your channels active and consistent.", img("services/social-media-marketing-step-3.png", "Planning social content with sticky notes and wireframes beside a phone and laptop", 258, 276)),
      step("04", "Review and refine", "We look at audience response and performance signals, then use those insights to improve what comes next.", img("services/social-media-marketing-step-4.png", "Two colleagues reviewing performance charts on a tablet", 258, 276)),
    ],
    toolkit: ["Social media strategy", "Content calendar and planning", "Platform-specific content", "Publishing and consistency", "Performance review and optimisation"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "A social presence", accent: "with purpose." },
      text: "Your audience gets a clearer picture of who you are, what you offer and why they should pay attention. You get a more organised way to show up online—without having to figure out every post from scratch.",
    },
    closing: { lead: "Let’s give your social media", accent: "a clearer direction." },
  },
  {
    slug: "content-creation",
    name: "Content Creation",
    code: "Service 02 / Content",
    seoTitle: "Content Creation – Jovens Buzz",
    seoDescription:
      "Content creation that sounds like you: captions, scripts, carousel and campaign copy that make your value clear and give people a reason to remember your brand.",
    tagline: "Give your brand something worth saying.",
    headline: { lead: "Words that connect, stories", accent: "that build trust." },
    intro:
      "Good content does more than fill a feed. It helps people understand your value, relate to your brand and feel confident taking the next step. We shape ideas into clear, engaging content that sounds like you and speaks to the people you want to reach.",
    problem: {
      title: { lead: "If your message isn’t clear,", accent: "your value gets missed." },
      text: "Your audience should not have to work to understand what you do. The right words, story and structure make your message easier to follow—and give people a reason to remember it.",
      image: img("services/content-creation-overview.webp", "A smiling content creator filming with a camera on a handheld rig", 577, 663),
    },
    steps: [
      step("01", "Find the story", "We understand your audience, brand voice, offering and the questions customers already ask.", img("services/content-creation-step-1.png", "A team gathered around a table mapping ideas on sticky notes", 258, 276)),
      step("02", "Shape the idea", "We turn insights into useful angles, strong hooks and content concepts with a clear purpose.", img("services/content-creation-step-2.png", "A creator at her desk beneath a glowing lightbulb idea sketch", 258, 276)),
      step("03", "Write and create", "We develop captions, scripts, carousel copy, campaign messages and other content suited to the format.", img("services/content-creation-step-3.png", "Team members brainstorming content around a table covered in notes", 258, 276)),
      step("04", "Polish for connection", "We refine the language, flow and call to action so every piece feels clear, natural and on-brand.", img("services/content-creation-step-4.png", "Hands at a laptop with the word Content on screen", 258, 276)),
    ],
    toolkit: ["Content ideas and themes", "Captions and social copy", "Reel and video scripts", "Carousel and campaign copy", "Brand messaging and storytelling"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "Content people can understand—", accent: "and remember." },
      text: "From a quick scroll to a closer look, your content gives people a reason to stay, learn and connect. Every message feels more consistent, more intentional and more recognisably yours.",
    },
    closing: { lead: "Let’s find the stories", accent: "your brand should be telling." },
  },
  {
    slug: "short-form-video-reels",
    name: "Short-form Video & Reels",
    code: "Service 03 / Video",
    seoTitle: "Short-form Video & Reels – Jovens Buzz",
    seoDescription:
      "Short-form video and reels with a strong hook, a clear story and platform-ready editing—videos that turn a passing scroll into a reason to stay.",
    tagline: "Turn a passing scroll into a reason to stay.",
    headline: { lead: "From first glance to can’t-", accent: "stop-watching." },
    intro:
      "Short-form video gives your brand a chance to show its personality, explain its value and make an impression quickly. We bring the idea, script, visuals and edit together to create videos that feel engaging, purposeful and made for the platform.",
    problem: {
      title: { lead: "You have seconds to earn attention.", accent: "Make them count." },
      text: "A video needs more than a trending sound or a quick cut. It needs a strong opening, a story worth following and a clear point to leave with. That’s how a short video becomes more than just another post.",
      image: img("services/short-form-video-reels-overview.webp", "A smiling man in an armchair beside a phone playing a short-form video", 577, 633),
    },
    steps: [
      step("01", "Start with the hook", "We identify the message and opening moment that can make the right viewer pause.", img("services/short-form-video-reels-step-1.png", "A phone on a tripod showing the words Hook in 3 seconds", 258, 276)),
      step("02", "Build the story", "We shape a concise script or shot plan with a clear beginning, middle and takeaway.", img("services/short-form-video-reels-step-2.png", "Hands sketching a storyboard of video shots on paper", 258, 276)),
      step("03", "Bring it to screen", "We coordinate the visuals, footage, editing, pacing, captions and sound to suit the concept.", img("services/short-form-video-reels-step-3.png", "A phone on a tripod recording a creator in a studio", 258, 276)),
      step("04", "Finish with purpose", "We refine the final cut for the platform and add a clear next step where it makes sense.", img("services/short-form-video-reels-step-4.png", "An editor finishing a video on a multi-monitor editing setup", 258, 276)),
    ],
    toolkit: ["Reel concepts and creative direction", "Short-form scripts and shot plans", "Video editing and pacing", "Text, captions and sound treatment", "Platform-ready video formats"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "More than views—", accent: "a stronger brand impression." },
      text: "Your audience gets to see, hear and understand your brand in a format that feels immediate. Use video to introduce an offer, answer a question, show a process or put a human face to your business.",
    },
    closing: { lead: "Have an idea?", accent: "Let’s bring it to the screen." },
  },
  {
    slug: "creative-marketing-design",
    name: "Creative Marketing Design",
    code: "Service 04 / Design",
    seoTitle: "Creative Marketing Design – Jovens Buzz",
    seoDescription:
      "Creative marketing design for social media, campaigns and digital ads—attention-grabbing visuals that make your message clear and your brand easy to recognise.",
    tagline: "Make your message impossible to miss.",
    headline: { lead: "Turn bold ideas into", accent: "memorable visuals." },
    intro:
      "People often notice the visual before they read the words. We turn your message into thoughtful, attention-grabbing designs that make information easier to understand and your brand easier to recognise—across social media and marketing touchpoints.",
    problem: {
      title: { lead: "Good design should do", accent: "more than look good." },
      text: "A strong visual has a job: draw attention, guide the eye and make the message clear. When design is disconnected from the purpose, even a beautiful post can leave people wondering what it means.",
      image: img("services/creative-marketing-design-overview.webp", "A phone surrounded by colourful social media marketing creatives", 687, 586),
    },
    steps: [
      step("01", "Understand the message", "We identify the audience, communication goal, key information and action the design should encourage.", img("services/creative-marketing-design-step-1.png", "A designer's desk with logo sketches, sticky notes and a keyboard", 258, 276)),
      step("02", "Explore the direction", "We choose a visual approach, layout, typography and imagery that fit the idea and brand.", img("services/creative-marketing-design-step-2.png", "Two designers discussing concepts on a screen titled Explore Concepts", 258, 276)),
      step("03", "Design with clarity", "We create the artwork, balancing visual impact with readability and a clear message hierarchy.", img("services/creative-marketing-design-step-3.png", "A spread of printed magazine and poster layouts", 258, 276)),
      step("04", "Prepare for use", "We refine and adapt the final creative to the required platforms and formats.", img("services/creative-marketing-design-step-4.png", "A design file open on a monitor above printed layout sketches", 258, 276)),
    ],
    toolkit: ["Social media creatives", "Campaign and promotional graphics", "Digital ads and marketing assets", "Event and announcement designs", "Format adaptations for platforms"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "Visuals that attract attention", accent: "and make sense." },
      text: "Your message becomes easier to notice, understand and remember. Consistent creative design also helps your brand look considered at every touchpoint.",
    },
    closing: { lead: "Let’s turn your next", accent: "idea into a standout visual." },
  },
  {
    slug: "brand-identity-branding",
    name: "Brand Identity & Branding",
    code: "Service 05 / Branding",
    seoTitle: "Brand Identity & Branding – Jovens Buzz",
    seoDescription:
      "Brand identity and branding: discovery, logo and visual identity, colour and typography direction and guidelines—one consistent impression people recognise.",
    // Document: "Be recognised before you're even road" — "road" corrected to "read"
    tagline: "Be recognised before you’re even read.",
    headline: { lead: "Give your brand a", accent: "look people recognise." },
    intro:
      "A brand is more than a logo. It is the feeling, voice and visual character people come to associate with your business. We help bring those elements together into an identity that feels distinctive, consistent and ready to grow with you.",
    problem: {
      title: { lead: "A recognisable brand", accent: "builds familiarity." },
      text: "When your visuals and messaging change from one touchpoint to another, it becomes harder for people to remember you. A clear identity gives your business a consistent way to show up—and helps customers know they’re in the right place.",
      image: img("services/brand-identity-branding-overview.webp", "Hands holding a phone showing a branded fashion app design", 724, 487),
    },
    steps: [
      step("01", "Discover the brand", "We explore your business, audience, values, positioning and the impression you want to create.", img("services/brand-identity-branding-step-1.png", "Hands on a laptop with audience and target icons overlaid", 258, 276)),
      step("02", "Define the direction", "We develop a creative route for the brand’s visual personality and communication style.", img("services/brand-identity-branding-step-2.png", "A laptop showing a Branding presentation slide on a desk", 258, 276)),
      step("03", "Create the identity", "We shape the core visual elements and supporting brand assets into a cohesive system.", img("services/brand-identity-branding-step-3.png", "Hands arranging colour swatches and brand layouts on a table", 258, 276)),
      step("04", "Bring it together", "We organise the identity so it can be used consistently across your digital and marketing touchpoints.", img("services/brand-identity-branding-step-4.png", "Two colleagues presenting brand charts on a screen in a meeting room", 258, 276)),
    ],
    toolkit: ["Brand discovery and direction", "Logo and visual identity development", "Colour and typography direction", "Supporting brand elements", "Brand guidelines and usage direction"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "One identity.", accent: "A consistent impression." },
      text: "Your business gets a recognisable visual and verbal foundation—making it easier to create future content, communicate clearly and build familiarity over time.",
    },
    closing: { lead: "Let’s build an identity", accent: "people remember." },
  },
  {
    slug: "website-development",
    name: "Website Development",
    code: "Service 06 / Web",
    seoTitle: "Website Development – Jovens Buzz",
    seoDescription:
      "Website development from page planning and UI/UX design to responsive build, testing and launch—a clear website that makes the next step easy on desktop and mobile.",
    tagline: "Give your business a place to grow online.",
    headline: { lead: "Build beautifully, perform seamlessly,", accent: "convert effortlessly." },
    intro:
      "Your website is often where interest turns into a decision. We create clear, considered websites that introduce your business, guide visitors through what you offer and make it easy to take the next step—on desktop and mobile.",
    problem: {
      title: { lead: "Your website should work as hard", accent: "as your business." },
      text: "A confusing layout, unclear message or difficult enquiry path can make interested visitors leave without acting. A well-planned website brings your information, design and user journey together so people can find what they need with less effort.",
      image: img("laptop-img.png", "A laptop displaying a responsive website design", 619, 675),
    },
    steps: [
      step("01", "Plan the experience", "We understand your goals, audience, content needs and the actions visitors should take.", img("Plan-the-experience.png", "A strategist mapping a plan on a whiteboard for two colleagues", 464, 348)),
      step("02", "Structure the pages", "We organise the information into a clear sitemap and page flow, with useful navigation and content hierarchy.", img("Structure-the-pages.png", "Team planning a campaign with charts, notes and sketches on a desk", 560, 560)),
      step("03", "Design and develop", "We bring the approved direction to life with responsive layouts and functional website elements.", img("Design-and-develop.png", "Hands typing on a laptop beside a coffee", 560, 560)),
      step("04", "Test and launch", "We check key pages and interactions across screen sizes, refine the experience and prepare the site for launch.", img("Test-and-launch.png", "A team analysing results charts during a meeting", 464, 348)),
    ],
    toolkit: ["Website structure and page planning", "UI/UX design", "Responsive website development", "Content placement and page layout", "Testing and launch support"],
    toolkitDetails: TOOLKIT_DETAILS,
    outcome: {
      title: { lead: "A website that makes", accent: "the next step clear." },
      text: "Visitors can understand your offer, explore your services and contact you with confidence. Your business gets a digital home that supports credibility, communication and growth.",
    },
    closing: { lead: "Let’s build a website that", accent: "moves your business forward." },
  },
];

export const serviceHref = (slug: string) => `/${slug}`;
export const findServicePage = (slug: string) => SERVICE_PAGES.find((s) => s.slug === slug);
/** Name + link for the header dropdown, footers and cross-links */
export const SERVICE_NAV = SERVICE_PAGES.map((s) => ({ name: s.name, href: serviceHref(s.slug), slug: s.slug }));
