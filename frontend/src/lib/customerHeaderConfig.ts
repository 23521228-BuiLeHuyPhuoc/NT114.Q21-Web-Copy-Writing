import { Brain, CreditCard, FileText, FolderOpen, Wand2 } from 'lucide-react';

export const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/generate': 'AI Generator',
  '/contents': 'My content',
  '/projects': 'Projects',
  '/templates': 'Templates',
  '/fine-tune': 'Fine-tuning',
  '/plagiarism-check': 'Plagiarism check',
  '/profile': 'Profile',
  '/billing': 'Billing',
  '/notifications': 'Notifications',
};

export const QUICK_ACTIONS = [
  { label: 'Generate', icon: Wand2, path: '/generate', color: 'bg-green-500' },
  { label: 'Content', icon: FileText, path: '/contents', color: 'bg-green-500' },
  { label: 'Projects', icon: FolderOpen, path: '/projects', color: 'bg-emerald-500' },
  { label: 'Fine-tune', icon: Brain, path: '/fine-tune', color: 'bg-teal-500' },
  { label: 'Billing', icon: CreditCard, path: '/billing', color: 'bg-slate-500' },
];
