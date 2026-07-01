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
  { id: 'openrouter-free', name: 'OpenRouter Free Router', badge: 'OpenRouter', color: 'text-sky-600', desc: 'Uses the configured OpenRouter free model router for production generation.', latency: '~2-20s', tokens: 'provider' },
  { id: 'openrouter-qwen-free', name: 'Qwen Free (OpenRouter)', badge: 'OpenRouter', color: 'text-cyan-600', desc: 'Free Qwen model through OpenRouter, useful for Vietnamese marketing drafts.', latency: '~2-20s', tokens: 'provider' },
  { id: 'openrouter-gemma-free', name: 'Gemma Free (OpenRouter)', badge: 'OpenRouter', color: 'text-blue-600', desc: 'Free Gemma model through OpenRouter for general copywriting.', latency: '~2-20s', tokens: 'provider' },
  { id: 'openrouter-nemotron-free', name: 'Nemotron Free (OpenRouter)', badge: 'OpenRouter', color: 'text-indigo-600', desc: 'Free NVIDIA Nemotron model through OpenRouter.', latency: '~2-20s', tokens: 'provider' },
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', badge: 'Google', color: 'text-green-600', desc: 'Fast Google Gemini model for common marketing copy.', latency: '~2s', tokens: '1M' },
  { id: 'gemini-flash-lite', name: 'Gemini 2.5 Flash Lite', badge: 'Google', color: 'text-teal-600', desc: 'Lightweight Gemini model for quick requests.', latency: '~1s', tokens: '1M' },
  { id: 'groq-llama-3-3-70b', name: 'Llama 3.3 70B (Groq)', badge: 'Groq', color: 'text-orange-600', desc: 'Groq-hosted Llama for longer copy and stronger reasoning.', latency: '~1-3s', tokens: '128K' },
  { id: 'groq-llama-3-1-8b', name: 'Llama 3.1 8B Instant', badge: 'Groq', color: 'text-amber-600', desc: 'Fast Llama option for drafts and bulk generation.', latency: '<1s', tokens: '128K' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: 'Google', color: 'text-emerald-600', desc: 'Preview Gemini model exposed by the configured provider.', latency: '~2s', tokens: '1M' },
  { id: 'gemma-4-26b', name: 'Gemma 4 26B', badge: 'Google', color: 'text-orange-600', desc: 'Gemma model through the configured Gemini API.', latency: '~30-90s', tokens: '262K' },
  { id: 'freegpt4-gpt-4', name: 'GPT-4 Free API', badge: 'FreeGPT4', color: 'text-indigo-600', desc: 'Online FreeGPT4 endpoint configured by FREEGPT4_BASE_URL.', latency: '~5-30s', tokens: 'provider' },
  { id: 'freegpt4-gpt-4o', name: 'GPT-4o Free API', badge: 'FreeGPT4', color: 'text-violet-600', desc: 'Online FreeGPT4 GPT-4o compatible route.', latency: '~5-30s', tokens: 'provider' },
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
