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
  Luggage,
  Mail,
  Megaphone,
  MessageSquare,
  Shirt,
  ShoppingBag,
  Star,
  Target,
  Utensils,
} from 'lucide-react';

export const MODELS = [
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', badge: 'Google', color: 'text-green-600', desc: 'Fast Google Gemini model for common marketing copy.', latency: '~2s', tokens: '1M' },
  { id: 'gemini-3-5-flash-lite', name: 'Gemini 3.5 Flash Lite', badge: 'Google', color: 'text-teal-600', desc: 'Lightweight Gemini model for quick requests.', latency: '~2s', tokens: '1M' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: 'Google', color: 'text-emerald-600', desc: 'Preview Gemini model exposed by the configured provider.', latency: '~2s', tokens: '1M' },
  { id: 'gemini-3-6-flash', name: 'Gemini 3.6 Flash', badge: 'Google', color: 'text-green-700', desc: 'Stable Gemini 3.6 Flash model for marketing copy.', latency: '~5-20s', tokens: '1M' },
  { id: 'groq-gpt-oss-120b', name: 'GPT-OSS 120B (Groq)', badge: 'Groq', color: 'text-orange-700', desc: 'OpenAI open-weight reasoning model hosted on Groq.', latency: '~2-10s', tokens: '131K' },
  { id: 'groq-gpt-oss-20b', name: 'GPT-OSS 20B (Groq)', badge: 'Groq', color: 'text-orange-600', desc: 'Smaller GPT-OSS reasoning model for faster drafts.', latency: '~2-6s', tokens: '131K' },
  { id: 'groq-qwen-3-8-27b', name: 'Qwen 3.8 27B (Groq)', badge: 'Groq', color: 'text-amber-600', desc: 'Fast Qwen model on Groq for drafts and bulk generation.', latency: '~1s', tokens: '131K' },
];

export const COPY_TYPES = [
  { id: 'headline', name: 'Headline', icon: Megaphone, desc: 'Ad headline and hook' },
  { id: 'description', name: 'Product description', icon: FileText, desc: 'Detailed persuasive description' },
  { id: 'social', name: 'Social media post', icon: MessageSquare, desc: 'Facebook, Instagram, TikTok' },
  { id: 'email', name: 'Email marketing', icon: Mail, desc: 'Subject line and body' },
  { id: 'cta', name: 'Call to action', icon: Target, desc: 'Button copy and microcopy' },
  { id: 'landing', name: 'Landing page', icon: Globe, desc: 'Hero and section copy' },
  { id: 'seo', name: 'SEO content', icon: BarChart3, desc: 'SEO title and metadata' },
  { id: 'review', name: 'Review testimonial', icon: Star, desc: 'Proof and testimonial copy' },
];

export const TONES = [
  { id: 'urgent', name: 'Urgent', emoji: '!', desc: 'FOMO and limited-time framing' },
  { id: 'professional', name: 'Professional', emoji: '#', desc: 'Formal B2B tone' },
  { id: 'friendly', name: 'Friendly', emoji: ':)', desc: 'Conversational and approachable' },
  { id: 'luxury', name: 'Luxury', emoji: '*', desc: 'Premium and refined' },
  { id: 'humorous', name: 'Humorous', emoji: ':D', desc: 'Light and playful' },
  { id: 'emotional', name: 'Emotional', emoji: '<3', desc: 'Story-driven and warm' },
];

export const INDUSTRIES = [
  { id: 'ecommerce', name: 'Ecommerce', icon: ShoppingBag, color: 'bg-emerald-500' },
  { id: 'realestate', name: 'Real estate', icon: Building2, color: 'bg-green-500' },
  { id: 'technology', name: 'Technology', icon: Laptop, color: 'bg-teal-500' },
  { id: 'fnb', name: 'F&B', icon: Utensils, color: 'bg-orange-500' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-green-500' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'bg-emerald-500' },
  { id: 'fashion', name: 'Fashion', icon: Shirt, color: 'bg-pink-500' },
  { id: 'business', name: 'Business', icon: Briefcase, color: 'bg-slate-500' },
  { id: 'travel', name: 'Travel', icon: Luggage, color: 'bg-cyan-500' },
];
