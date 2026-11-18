import type { FaqItem } from "@/types/api";

function faq(displayOrder: number, question: string, answer: string): FaqItem {
  return { displayOrder, published: true, question, answer };
}

export const ABOUT_FAQS = [
  faq(
    1,
    "What does Jovens Buzz do?",
    "We help small businesses build a stronger online presence through social media strategy, content, creative design, video and other digital services.",
  ),
  faq(
    2,
    "Who do you work with?",
    "We work with small businesses across different industries, including restaurants, clinics, retail, real estate, fitness, professional services and more.",
  ),
  faq(
    3,
    "Which platforms do you work on?",
    "We create content for Instagram, Facebook, LinkedIn and YouTube Shorts, depending on your business and where your audience is most active.",
  ),
  faq(
    4,
    "Do I need to create the content myself?",
    "No. We can handle ideas, planning, copy, design and video. Your input and approvals help keep everything accurate and true to your brand.",
  ),
  faq(
    5,
    "How will I know if the content is working?",
    "We review signals such as reach, engagement, enquiries and audience response, then use those insights to improve the content and strategy",
  ),
  faq(
    6,
    "Can I start with one service and add more later?",
    "Yes. Start with what your business needs now, then explore additional services as your goals and needs change",
  ),
  faq(
    7,
    "Do you work with businesses that are just starting out?",
    "Yes. We can help new and growing businesses establish their online presence, communicate clearly and build consistency from the beginning",
  ),
];

export const HOW_WE_WORK_FAQS = [
  faq(
    1,
    "What happens after I contact Jovens Buzz?",
    "We start with a conversation about your business, goals, audience, current presence and the support you need. This helps us understand where to begin",
  ),
  faq(
    2,
    "How do you plan content for my business?",
    "We use your goals, audience, services, customer questions and brand voice to shape themes and build a content calendar with a clear purpose",
  ),
  faq(
    3,
    "Do I get to review content before it is published?",
    "Yes. Content is shared for your review and approval before publishing, so you can check details and make sure it feels right for your brand",
  ),
  faq(
    4,
    "How much input do you need from me each month?",
    "We need your key updates, feedback and approvals. We keep the process organised so you can contribute without having to manage every content task",
  ),
  faq(
    5,
    "What do I receive each month?",
    "Depending on your plan, deliverables may include a content calendar, custom designs, captions, short-form videos, publishing and scheduling, performance insights and a strategy review",
  ),
  faq(
    6,
    "How do you manage changes or timely updates?",
    "We plan ahead but leave room to adapt. If business priorities, offers or timely opportunities change, we discuss the update and adjust the calendar where possible",
  ),
  faq(
    7,
    "How do you improve content over time?",
    "We review performance and audience response, discuss what is working and what needs adjusting, then use those insights to guide the next content cycle",
  ),
];
