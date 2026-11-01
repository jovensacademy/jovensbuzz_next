import {
  Clapperboard,
  Compass,
  Globe,
  Megaphone,
  MessageSquare,
  Palette,
  PenTool,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

// Service icon keys are stored in the database (services.icon); unknown keys fall back gracefully.
const ICONS: Record<string, LucideIcon> = {
  strategy: Target,
  content: PenTool,
  design: Palette,
  video: Clapperboard,
  management: MessageSquare,
  branding: Sparkles,
  web: Globe,
  campaigns: Megaphone,
};

export const SERVICE_ICON_KEYS = Object.keys(ICONS);

export function ServiceIcon({ name, size = 24 }: { name?: string | null; size?: number }) {
  const Icon = (name && ICONS[name]) || Compass;
  return <Icon size={size} aria-hidden strokeWidth={1.8} />;
}
