import { useMemo, useState } from 'react';
import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Textarea } from '@/app/components/ui/textarea';
import {
  useAdminGenerateOptions,
  useCreateGenerateOption,
  useRemoveGenerateOption,
  useUpdateGenerateOption,
} from '@/hooks/queries/useGenerateOptions';
import type { GenerateOption, GenerateOptionGroup } from '@/services/generateOptionService';

interface Props {
  group: GenerateOptionGroup;
  title: string;
  description: string;
  noun: string;
  iconHint: string;
  colorHint?: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '',
  order: '0',
  isActive: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
