/*
 * FAQs for the six individual service pages, keyed by service slug (see service-pages.ts).
 * Copy is used exactly as supplied.
 */

export type ServiceFaqItem = { question: string; answer: string };
export type ServiceFaqs = {
  /** e.g. "SERVICE 01 / SMM • FAQ" */
  label: string;
  description: string;
  items: ServiceFaqItem[];
};

export const SERVICE_FAQS: Record<string, ServiceFaqs> = {
  "social-media-marketing": {
    label: "SERVICE 01 / SMM • FAQ",
    description: "Common questions about social media management.",
    items: [
      {
        question: "What does social media management include?",
        answer: "It can include strategy, content themes, platform priorities, a content calendar, publishing and performance reviews.",
      },
      {
        question: "How do you choose the right platforms for my business?",
        answer: "We consider your audience, business goals and current social presence before setting platform priorities.",
      },
      {
        question: "How often should my business post?",
        answer:
          "We build a posting rhythm around your goals and content plan, focusing on consistency rather than posting just to stay active.",
      },
      {
        question: "Do you plan posts in advance?",
        answer: "Yes. A content calendar helps organise themes, timing and planned posts so your channels have a clear direction.",
      },
      {
        question: "Will you create and publish the content?",
        answer:
          "The service can include developing platform-specific content and publishing it to keep your channels active and consistent.",
      },
      {
        question: "How do you review social media performance?",
        answer: "We look at audience response and performance signals, then use those insights to refine future content and strategy.",
      },
      {
        question: "Can you work with my existing social media accounts?",
        answer: "Yes. We begin by reviewing your current social presence and understanding what your brand already communicates.",
      },
    ],
  },
  "content-creation": {
    label: "SERVICE 02 / CONTENT • FAQ",
    description: "Common questions about content creation.",
    items: [
      {
        question: "What types of content can Jovens Buzz create?",
        answer:
          "We develop content ideas, captions, social copy, Reel and video scripts, carousel copy, campaign messages and brand storytelling.",
      },
      {
        question: "How do you make content sound like my brand?",
        answer: "We learn your brand voice, audience and offering, then shape language that feels clear, natural and recognisably yours.",
      },
      {
        question: "Where do content ideas come from?",
        answer: "We start with your audience, business offering and customer questions, then turn those insights into useful angles and concepts.",
      },
      {
        question: "Can you write for different social media formats?",
        answer: "Yes. We shape each message to suit its format, whether it is a caption, script, carousel or campaign.",
      },
      {
        question: "Can you help explain what my business offers more clearly?",
        answer: "Yes. We use clear words, story and structure to help people understand your value without having to work it out.",
      },
      {
        question: "Do you write video scripts and carousel copy?",
        answer: "Yes. Reel and video scripts, carousel copy and campaign messages are part of the content toolkit.",
      },
      {
        question: "Can you include a call to action?",
        answer: "Yes. We refine the call to action so it fits the message and gives the audience a clear next step.",
      },
    ],
  },
  "short-form-video-reels": {
    label: "SERVICE 03 / VIDEO • FAQ",
    description: "Common questions about short-form video.",
    items: [
      {
        question: "What type of videos do you create?",
        answer: "We focus on short-form videos that help brands show personality, explain value and make a quick impression.",
      },
      {
        question: "Do you help develop the video idea and script?",
        answer: "Yes. We shape the concept, hook and concise script or shot plan before bringing the video to screen.",
      },
      {
        question: "What makes a short-form video effective?",
        answer: "A strong opening, a story worth following and a clear takeaway help turn a quick view into a meaningful impression.",
      },
      {
        question: "Can you plan the shots before production?",
        answer: "Yes. We create shot plans with a clear beginning, middle and takeaway, helping guide the visuals and footage needed.",
      },
      {
        question: "Does your service include video editing?",
        answer: "Yes. Editing, pacing, captions and sound treatment are part of the video process.",
      },
      {
        question: "Can videos be prepared for different platforms?",
        answer: "We refine the final cut and prepare platform-ready formats to suit the intended social channels.",
      },
      {
        question: "What can my business use short-form video for?",
        answer: "Use it to introduce an offer, answer a customer question, show a process or put a human face to your business.",
      },
    ],
  },
  "creative-marketing-design": {
    label: "SERVICE 04 / DESIGN • FAQ",
    description: "Common questions about graphic design.",
    items: [
      {
        question: "What types of designs can you create?",
        answer: "We create social media graphics, campaign and promotional visuals, digital ad assets, event designs and announcements.",
      },
      {
        question: "Can you design creatives that match my brand?",
        answer: "Yes. We choose a visual approach, layout, typography and imagery that fit your idea and brand.",
      },
      {
        question: "How do you decide what a design should communicate?",
        answer: "We start with your audience, communication goal, key information and the action the design should encourage.",
      },
      {
        question: "Will the designs be easy to read?",
        answer: "We balance visual impact with readability and a clear message hierarchy, so people can follow the information.",
      },
      {
        question: "Can you adapt designs for different platforms and sizes?",
        answer: "Yes. We refine and adapt final creative to the formats and platforms you need.",
      },
      {
        question: "Can you create promotional and event graphics?",
        answer: "Yes. Campaign graphics, promotional assets, event designs and announcements are included in the design toolkit.",
      },
      {
        question: "What should I provide before a design project starts?",
        answer: "Share the key message, intended audience, important details and the response you want the design to encourage.",
      },
    ],
  },
  "brand-identity-branding": {
    label: "SERVICE 05 / BRANDING • FAQ",
    description: "Common questions about brand identity.",
    items: [
      {
        question: "Is branding just about creating a logo?",
        answer: "No. A brand includes the feeling, voice and visual character people associate with your business, not just its logo.",
      },
      {
        question: "What is included in a brand identity?",
        answer: "It can include logo development, colour and typography direction, supporting brand elements and brand guidelines.",
      },
      {
        question: "How do you understand my business before designing its identity?",
        answer: "We explore your business, audience, values, positioning and the impression you want your brand to create.",
      },
      {
        question: "Can you help define my brand's visual style and voice?",
        answer: "Yes. We develop a creative direction for the brand's visual personality and communication style.",
      },
      {
        question: "Why is brand consistency important?",
        answer:
          "Consistent visuals and messaging make your business easier to recognise and help customers know they are in the right place.",
      },
      {
        question: "Will I receive brand guidelines?",
        answer: "Yes. Brand guidelines and usage direction help you apply the identity consistently across your marketing touchpoints.",
      },
      {
        question: "How can a brand identity support my business over time?",
        answer:
          "A cohesive identity gives you a recognisable foundation for future content, clearer communication and stronger familiarity.",
      },
    ],
  },
  "website-development": {
    label: "SERVICE 06 / WEB • FAQ",
    description: "Common questions about website development.",
    items: [
      {
        question: "What is included in your website service?",
        answer:
          "It can include website planning, UI/UX design, responsive development, content placement, page layouts, testing and launch support.",
      },
      {
        question: "Will my website work on mobile devices?",
        answer: "We create responsive layouts and check key pages and interactions across screen sizes before launch.",
      },
      {
        question: "How do you organise the pages on a website?",
        answer: "We create a clear sitemap and page flow, with useful navigation and a logical content hierarchy.",
      },
      {
        question: "Can you help arrange the content on my website?",
        answer: "Yes. We plan content placement and page layouts so visitors can find important information with less effort.",
      },
      {
        question: "How do you make sure the website supports my business goals?",
        answer: "We start by understanding your goals, audience, content needs and the actions visitors should take.",
      },
      {
        question: "Do you test the website before it goes live?",
        answer: "Yes. We check key pages and interactions across screen sizes, refine the experience and prepare the site for launch.",
      },
      {
        question: "How will the website help visitors contact my business?",
        answer:
          "We organise information and the visitor journey so people can understand your offer, explore services and find a clear next step.",
      },
    ],
  },
};
