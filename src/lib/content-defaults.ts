import type { FaqItem, ServiceItem, SiteContent } from "@/types/api";

// Fallback copy, used only when the API is unreachable (e.g. during a build without the
// backend). Mirrors the seeded database content so the page never renders empty.

// Official contact email and social profiles. These always win over API/database values.
export const CONTACT_EMAIL = "hello@jovensbuzz.com";
export const SOCIAL_URLS = {
  social_linkedin: "https://www.linkedin.com/company/144002640/",
  social_facebook: "https://www.facebook.com/profile.php?id=61595132745256",
  social_instagram: "https://www.instagram.com/jovens_buzz?rpxt=aWFqaTE1bWs4Mmpi",
} as const;

export const DEFAULT_CONTENT: SiteContent = {
  hero_eyebrow: "Creative. Strategic. Results-Driven.",
  hero_headline: "Making Small Businesses Look Big",
  hero_description:
    "Strategy, content, design and digital experiences that help ambitious businesses build visibility and grow.",
  hero_primary_cta: "Explore Services",
  hero_secondary_cta: "Let's Talk",
  about_title: "The Creative Power Behind Your Growth.",
  about_description:
    "We build goal-driven strategies that attract the right audience, strengthen your brand, and drive business growth.",
  about_body:
    "Jovens Buzz is a social media growth and creative agency. We bring strategy, content, design and short-form video together under one team, so small businesses can show up consistently and look as credible online as the brands they compete with. Every post serves a purpose, every design builds recognition, and every plan is tied to a business goal.",
  strategy_title: "The Strategy Behind Every Successful Brand.",
  strategy_description:
    "Strategy decides what to say and to whom. Creative execution makes people stop and pay attention. Consistent communication builds the familiarity and trust that turn followers into enquiries. We plan all three together so your marketing compounds instead of starting over every month.",
  footer_description:
    "A creative, strategic and results-driven digital growth agency helping small businesses look big online.",
  contact_office: "Dallas, TX, USA",
  contact_phone: "+1 (959) 200-0495",
  contact_email: CONTACT_EMAIL,
  ...SOCIAL_URLS,
  social_youtube: "https://youtube.com/@jovensbuzz",
  social_x: "",
  social_dribbble: "",
  social_behance: "",
};

const service = (displayOrder: number, title: string, slug: string, icon: string, description: string): ServiceItem => ({
  displayOrder,
  title,
  slug,
  icon,
  description,
  published: true,
});

export const DEFAULT_SERVICES: ServiceItem[] = [
  service(1, "Social Media Strategy", "social-media-strategy", "strategy", "A clear plan for what to post, why and when to maximize reach and drive business revenue."),
  service(2, "Content Creation", "content-creation", "content", "Captions, stories, carousels and high-converting graphics that build brand trust and engagement."),
  service(3, "Creative Design", "creative-design", "design", "Scroll-stopping graphics, custom illustrations and visual assets that make your brand memorable."),
  service(4, "Short-Form Video Production", "short-form-video", "video", "Reels, TikToks and YouTube Shorts scripted and edited to capture attention in seconds."),
  service(5, "Social Media Management", "social-media-management", "management", "Full-service publishing, community moderation and monthly performance reporting so you can run your business."),
  service(6, "Brand Identity", "brand-identity", "branding", "Logo systems, color palettes, typography and guidelines for a unified presence across all channels."),
  service(7, "Website Design and Development", "website-design-development", "web", "Modern, high-performance, responsive websites engineered to convert visitors into clients."),
  service(8, "Digital Marketing Campaigns", "digital-marketing-campaigns", "campaigns", "Targeted paid social, search and multi-channel campaigns to accelerate lead acquisition."),
];

// The original homepage FAQ (also seeded in the database by Flyway V2)
export const DEFAULT_FAQS: FaqItem[] = [
  {
    displayOrder: 1,
    published: true,
    question: "My business gets likes, but no enquiries. What needs to change?",
    answer:
      "Likes alone don’t guarantee business results. We assess your content, audience, profile, messaging and calls to action to identify where potential customers may be dropping off. We then build content around customer needs, trust and clear next steps to encourage meaningful enquiries.",
  },
  {
    displayOrder: 2,
    published: true,
    question: "Can you create content for my business if I don’t have professional photos or videos?",
    answer:
      "Yes. We can create branded graphics, educational carousels, promotional creatives and text-led content using the assets available. Where original photography or on-location video is important, we’ll discuss the resources needed and suitable options before production.",
  },
  {
    displayOrder: 3,
    published: true,
    question: "How do you market a business in a crowded local market?",
    answer:
      "We look at your competitors, target customers and what makes your business different. From there, we develop content that communicates your strengths, answers customer questions and gives people a reason to choose you instead of another local option.",
  },
  {
    displayOrder: 4,
    published: true,
    question: "What if I don’t know what to post every week?",
    answer:
      "You don’t need to come up with ideas yourself. We plan a content calendar around your business goals, audience interests, services, seasonal opportunities and promotional priorities. Your content can include educational posts, brand stories, offers, short-form videos and customer-focused topics.",
  },
  {
    displayOrder: 5,
    published: true,
    question: "Can social media help my business get discovered by nearby customers?",
    answer:
      "Yes. We can create locally relevant content, optimize your social profiles and support your local visibility strategy. Depending on your needs, Google Business Profile optimization and location-targeted paid campaigns can also help potential customers discover your business.",
  },
  {
    displayOrder: 6,
    published: true,
    question: "Do I need to run paid ads, or can organic content grow my business?",
    answer:
      "You can build awareness and engagement through organic content without running ads. Paid campaigns may help you reach specific audiences faster or support lead-generation goals. The right approach depends on your objectives, competition and budget; advertising spend is separate from management fees unless explicitly included in your package.",
  },
  {
    displayOrder: 7,
    published: true,
    question: "How do you measure whether your content is generating business value?",
    answer:
      "We evaluate performance against your goals, not just likes. Depending on the campaign, we review reach, engagement, profile visits, website clicks, enquiries and other available conversion data. These insights help us identify which content deserves more attention and what needs improvement.",
  },
  {
    displayOrder: 8,
    published: true,
    question: "How much time will I need to spend working with your team each month?",
    answer:
      "We handle the agreed planning, content creation and publishing tasks so you can focus on running your business. You’ll need to provide initial business information, share relevant updates or assets, and review content for approval. The time required depends on your package and how quickly feedback is provided.",
  },
];

