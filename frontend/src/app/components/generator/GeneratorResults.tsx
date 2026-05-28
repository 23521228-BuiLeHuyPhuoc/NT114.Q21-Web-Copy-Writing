import { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  History,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Markdown } from '@/app/components/common/Markdown';
import { looksLikeHtml, sanitizeHtml } from '@/lib/richText';

interface Props {
  isGenerating: boolean;
  isSaving?: boolean;
  streamText: string;
  results: string[];
  selectedResult: number;
  qualityScores: number[];
  variations: number;
  onSelectResult: (i: number) => void;
  onResultChange: (i: number, value: string) => void;
  onCopy: (text: string) => void;
  onSave: (text: string) => void;
  onDownload: (text: string) => void;
  onRegenerate: () => void;
}

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

function countWords(text: string) {
  return text
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function GeneratorResults({
  isGenerating,
  isSaving = false,
  streamText,
  results,
  selectedResult,
  qualityScores,
  variations,
  onSelectResult,
  onResultChange,
  onCopy,
  onSave,
  onDownload,
  onRegenerate,
}: Props) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const activeResult = results[selectedResult] || '';
  const activeQuality = qualityScores[selectedResult] || 90;

  useEffect(() => {
    if (!isGenerating && results.length > 0) {
      setViewMode('preview');
    }
  }, [isGenerating, results.length]);

  if (isGenerating || results.length > 0) {
    return (
      <div className="space-y-4">
        {isGenerating && !streamText && (
          <Card className="p-5 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">Đang gửi prompt đến model...</span>
            </div>
            <p className="text-sm text-foreground/70">
              Nội dung sẽ xuất hiện ở đây sau khi model trả kết quả.
            </p>
          </Card>
        )}

        {isGenerating && streamText && (
          <Card className="p-5 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">Đang tạo phiên bản 1/{variations}...</span>
            </div>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {streamText}
              <span className="animate-pulse">▌</span>
            </p>
          </Card>
        )}

        {!isGenerating && results.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {results.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectResult(i);
                    setViewMode('preview');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedResult === i
                      ? 'bg-primary text-white'
                      : 'bg-muted text-foreground/70 hover:bg-gray-200'
                  }`}
                >
                  Phiên bản {i + 1}
                  {qualityScores[i] && <span className="ml-1.5 text-xs opacity-80">CL {qualityScores[i]}%</span>}
                </button>
              ))}
            </div>

            {activeResult && (
              <Card className="p-5 border-2 border-primary/20">
                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                      Chất lượng: {activeQuality}%
                    </div>
                    <span className="text-xs text-muted-foreground">{countWords(activeResult)} từ</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex items-center gap-1 mr-2 bg-muted rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          viewMode === 'preview'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        <Eye className="w-3 h-3" /> Xem trước
                      </button>
                      <button
                        onClick={() => setViewMode('edit')}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                          viewMode === 'edit'
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        <Pencil className="w-3 h-3" /> Chỉnh sửa
                      </button>
                    </div>
                    <button className="p-1.5 hover:bg-muted rounded" onClick={() => toast.success('Đã đánh giá tốt!')}>
                      <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded" onClick={() => toast.success('Cảm ơn phản hồi!')}>
                      <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {viewMode === 'edit' ? (
                  <div className="overflow-hidden rounded-md border bg-card">
                    <Editor
                      apiKey={tinymceApiKey}
                      value={activeResult}
                      onEditorChange={(value: string) => onResultChange(selectedResult, value)}
                      init={{
                        height: 320,
                        menubar: false,
                        branding: false,
                        plugins: 'lists link table code wordcount autoresize',
                        toolbar:
                          'undo redo | blocks | bold italic underline | bullist numlist | link table | removeformat | code',
                        content_style:
                          'body { font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 1.65; color: #1f2937; } p { margin: 0 0 12px; } ul, ol { margin: 0 0 12px 22px; padding: 0; } li { margin: 4px 0; } h1, h2, h3 { margin: 0 0 12px; line-height: 1.3; }',
                      }}
                    />
                  </div>
                ) : (
                  <div className="min-h-40 bg-surface-muted rounded-md p-4 text-sm leading-relaxed">
                    {looksLikeHtml(activeResult) ? (
                      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeResult) }} />
                    ) : (
                      <Markdown>{activeResult}</Markdown>
                    )}
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onCopy(activeResult)}>
                    <Copy className="w-4 h-4 mr-1" /> Sao chép
                  </Button>
                  <Button size="sm" variant="outline" disabled={isSaving} onClick={() => onSave(activeResult)}>
                    <Save className="w-4 h-4 mr-1" /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownload(activeResult)}>
                    <Download className="w-4 h-4 mr-1" /> Tải xuống
                  </Button>
                  <Button size="sm" variant="outline" onClick={onRegenerate}>
                    <RefreshCw className="w-4 h-4 mr-1" /> Tạo lại
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="p-12 text-center border-2 border-dashed border-border">
      <div className="bg-gradient-to-r from-green-100 to-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-bold text-foreground mb-2">Sẵn sàng tạo copy?</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Chọn ngành nghề, loại nội dung, tone giọng và model AI. Nhấn "Tạo Copy Ngay" để bắt đầu.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
        {[
          { icon: Zap, label: 'Tạo nhanh', color: 'text-amber-600 bg-warning/10' },
          { icon: Star, label: 'Chỉnh sửa rich text', color: 'text-primary bg-primary/5' },
          { icon: History, label: 'Lưu thủ công', color: 'text-primary bg-primary/5' },
          { icon: CheckCircle2, label: 'Đa phiên bản', color: 'text-primary bg-primary/5' },
        ].map(f => {
          const Icon = f.icon;
          return (
            <div key={f.label} className={`flex items-center gap-2 p-2.5 rounded-lg ${f.color}`}>
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{f.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
