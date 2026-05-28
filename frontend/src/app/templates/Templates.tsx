import { useMemo, useState } from 'react';
import { AlertCircle, FileText, Sparkles, Wand2 } from 'lucide-react';

import { Layout } from '@/app/components/Layout';
import { CopyExamples } from '@/app/components/CopyExamples';
import { TipsSection } from '@/app/components/TipsSection';
import { IndustrySelector } from '@/app/components/IndustrySelector';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useTemplates } from '@/hooks/queries/useTemplates';
import type { CopyTemplate } from '@/services/templateService';

const CATEGORY_LABELS: Record<string, string> = {
  seo: 'Blog SEO',
  product: 'Mô tả sản phẩm',
  social: 'Mạng xã hội',
  email: 'Email marketing',
  ads: 'Quảng cáo',
  landing: 'Landing page',
  review: 'Review & proof',
  b2b: 'B2B sales',
  industry: 'Chuyên ngành',
};

const TYPE_LABELS: Record<string, string> = {
  headline: 'Headline',
  description: 'Mô tả',
  social: 'Social',
  email: 'Email',
  cta: 'CTA',
  landing: 'Landing page',
  seo: 'SEO',
  review: 'Review',
};

function formatCategory(value: string) {
  return CATEGORY_LABELS[value] || value;
}

function formatType(value: string) {
  return TYPE_LABELS[value] || value;
}

function TemplateCard({ template }: { template: CopyTemplate }) {
  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        </div>
        <Badge className={template.isSystem ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-foreground border-0'}>
          {template.isSystem ? 'System' : 'Cá nhân'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{formatCategory(template.category)}</Badge>
        <Badge variant="outline">{formatType(template.type)}</Badge>
        <Badge variant="outline">{template.usageCount} lượt dùng</Badge>
      </div>

      <p className="text-xs text-foreground/70 bg-surface-muted border rounded p-3 line-clamp-4 whitespace-pre-wrap">
        {template.systemPrompt}
      </p>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-muted-foreground">
          {template.variables.length ? `${template.variables.length} biến prompt` : 'Sẵn sàng dùng ngay'}
        </span>
        <Button asChild size="sm">
          <a href={`/generate?templateId=${template.id}`}>
            <Wand2 className="w-4 h-4 mr-2" />
            Dùng mẫu
          </a>
        </Button>
      </div>
    </Card>
  );
}

export function CustomerTemplates() {
  const [selectedIndustry, setSelectedIndustry] = useState('ecommerce');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: templates = [], isLoading, error } = useTemplates();

  const categories = useMemo(() => {
    const unique = Array.from(new Set(templates.map((template) => template.category))).filter(Boolean);
    return ['all', ...unique];
  }, [templates]);

  const visibleTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter((template) => template.category === selectedCategory);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Thư Viện Mẫu Copy</h1>
          <p className="text-foreground/70">Chọn template từ backend để dùng trực tiếp khi generate nội dung.</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Templates từ API</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 text-sm rounded border transition-colors ${
                  selectedCategory === category
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground/80 hover:border-primary/40'
                }`}
              >
                {category === 'all' ? 'Tất cả' : formatCategory(category)}
              </button>
            ))}
          </div>

          {isLoading && (
            <Card className="p-6 text-sm text-muted-foreground">Đang tải templates...</Card>
          )}

          {error && (
            <Card className="p-4 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              Không thể tải template API. Kiểm tra backend hoặc đăng nhập lại.
            </Card>
          )}

          {!isLoading && !error && visibleTemplates.length === 0 && (
            <Card className="p-6 text-sm text-muted-foreground">Chưa có template nào trong danh mục này.</Card>
          )}

          {visibleTemplates.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {visibleTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Chọn ngành nghề tham khảo</h2>
          <IndustrySelector
            selectedIndustry={selectedIndustry}
            onSelectIndustry={setSelectedIndustry}
          />
        </div>

        <div className="mb-8">
          <CopyExamples industry={selectedIndustry} />
        </div>

        <TipsSection />
      </div>
    </Layout>
  );
}
