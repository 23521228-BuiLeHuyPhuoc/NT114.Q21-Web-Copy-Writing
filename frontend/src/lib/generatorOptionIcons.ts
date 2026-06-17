import {
  BarChart3,
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Laptop,
  Laugh,
  Mail,
  Megaphone,
  MessageSquare,
  Plane,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  Star,
  Target,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export const GENERATOR_ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Briefcase,
  Building2,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  Laptop,
  Laugh,
  Mail,
  Megaphone,
  MessageSquare,
  Plane,
  Shirt,
  ShoppingBag,
  Smile,
  Sparkles,
  Star,
  Target,
  Utensils,
  barChart3: BarChart3,
  briefcase: Briefcase,
  building2: Building2,
  dollarSign: DollarSign,
  fileText: FileText,
  globe: Globe,
  graduationCap: GraduationCap,
  heart: Heart,
  laptop: Laptop,
  laugh: Laugh,
  mail: Mail,
  megaphone: Megaphone,
  messageSquare: MessageSquare,
  plane: Plane,
  shirt: Shirt,
  shoppingBag: ShoppingBag,
  smile: Smile,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  utensils: Utensils,
};

export const TONE_ICON_LABELS: Record<string, string> = {
  fire: '🔥',
  briefcase: '💼',
  smile: '😊',
  sparkles: '✨',
  laugh: '😄',
  heart: '❤️',
};

export function resolveGeneratorIcon(icon?: string | LucideIcon, fallback: LucideIcon = Sparkles) {
  if (typeof icon === 'function') return icon;
  if (!icon) return fallback;
  return GENERATOR_ICON_MAP[icon] || fallback;
}

export function resolveToneIcon(icon?: string) {
  if (!icon) return '•';
  return TONE_ICON_LABELS[icon] || icon;
}
