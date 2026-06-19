import {
  Building2,
  Cpu,
  GraduationCap,
  Heart,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export const INDUSTRY_MAP: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  ecommerce: { label: 'Ecommerce', color: 'bg-emerald-100 text-emerald-700', Icon: ShoppingBag },
  realestate: { label: 'Real estate', color: 'bg-green-100 text-green-700', Icon: Building2 },
  technology: { label: 'Technology', color: 'bg-teal-100 text-teal-700', Icon: Cpu },
  fnb: { label: 'F&B', color: 'bg-orange-100 text-orange-700', Icon: Utensils },
  healthcare: { label: 'Healthcare', color: 'bg-red-100 text-red-700', Icon: Heart },
  education: { label: 'Education', color: 'bg-green-100 text-green-700', Icon: GraduationCap },
};

export const TYPE_MAP: Record<string, string> = {
  headline: 'Headline',
  description: 'Description',
  cta: 'CTA',
  social: 'Social media',
  email: 'Email marketing',
  landing: 'Landing page',
  seo: 'SEO',
  review: 'Review',
};

export function getIndustryKey(tags?: string[], industry?: string) {
  return tags?.[0] || industry || 'general';
}

export function getIndustryLabel(key: string, fallback?: string) {
  return INDUSTRY_MAP[key]?.label || fallback || key || 'General';
}
