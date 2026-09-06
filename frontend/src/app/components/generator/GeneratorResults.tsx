import { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import {
  Copy,
  Download,
  Eye,
  Pencil,
  RefreshCw,
  Save,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Markdown } from '@/app/components/common/Markdown';
import { looksLikeHtml, sanitizeHtml } from '@/lib/richText';
import { tinymceBaseInit, tinymceEditorProps } from '@/lib/tinymce';
import type { GeneratedPlagiarism } from '@/services/contentService';
import { EditorialEmptyState } from '@/app/components/EditorialArtwork';

interface Props {
  isGenerating: boolean;
  isSaving?: boolean;
  streamText: string;
  results: string[];
  selectedResult: number;
  qualityScores: number[];
  plagiarism?: GeneratedPlagiarism | null;
  variations: number;
  onSelectResult: (i: number) => void;
  onResultChange: (i: number, value: string) => void;
  onCopy: (text: string) => void;
  onSave: (text: string) => void;
  onDownload: (text: string) => void;
  onRegenerate: () => void;
}

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
  plagiarism = null,
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
  const activeQuality = Number.isFinite(qualityScores[selectedResult]) ? qualityScores[selectedResult] : 0;

  useEffect(() => {
    if (!isGenerating && results.length > 0) {
      setViewMode('preview');
    }
  }, [isGenerating, results.length]);

  if (isGenerating || results.length > 0) {
    return (
      <div className="space-y-4">
        {isGenerating && !streamText && (
          <Card className="paper-noise border-2 border-foreground bg-card p-6">
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
          <Card className="paper-noise border-2 border-foreground bg-card p-6">
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
            <div className="flex flex-wrap gap-0 border-b-2 border-foreground">
              {results.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSelectResult(i);
                    setViewMode('preview');
                  }}
                  className={`border-x border-t border-foreground px-4 py-2 text-xs font-bold transition-colors ${
                    selectedResult === i
                      ? 'bg-foreground text-background'
                      : 'bg-card text-foreground/70 hover:bg-accent/35'
                  }`}
                >
                  Phiên bản {i + 1}
                  {Number.isFinite(qualityScores[i]) && <span className="ml-1.5 text-xs opacity-80">CL {qualityScores[i]}%</span>}
                </button>
              ))}
            </div>

            {activeResult && (
              <Card className="manuscript-results paper-noise border-2 border-foreground p-5 shadow-[7px_7px_0_rgba(23,32,51,.12)] md:p-6">
                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="border border-primary bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      Chất lượng: {activeQuality}%
                    </div>
                    {plagiarism && (
                      <div className={`border px-3 py-1 text-xs font-bold ${
                        plagiarism.similarityScore >= 45
                          ? 'border-destructive/40 bg-destructive/10 text-destructive'
                          : plagiarism.similarityScore >= 20
                            ? 'border-warning/50 bg-warning/15 text-warning-foreground'
                            : 'border-success/40 bg-success/10 text-success'
                      }`}>
                        Đạo văn: {Math.round(plagiarism.similarityScore)}%
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{countWords(activeResult)} từ</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="mr-2 flex items-center gap-1 border border-border bg-muted p-0.5">
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
                  <div className="overflow-hidden border-2 border-foreground bg-card">
                    <Editor
                      {...tinymceEditorProps}
                      value={activeResult}
                      onEditorChange={(value: string) => onResultChange(selectedResult, value)}
                      init={{
                        ...tinymceBaseInit,
                        height: 320,
                        menubar: false,
                        branding: false,
                        plugins: 'lists link table code wordcount autoresize',
                        toolbar:
                          'undo redo | blocks | bold italic underline | bullist numlist | link table | removeformat | code',
                        content_style:
                          'body { font-family: Georgia, serif; font-size: 15px; line-height: 1.75; color: #172033; background: #fffdf7; padding: 14px; } p { margin: 0 0 12px; } ul, ol { margin: 0 0 12px 22px; padding: 0; } li { margin: 4px 0; } h1, h2, h3 { margin: 0 0 12px; line-height: 1.2; }',
                      }}
                    />
                  </div>
                ) : (
                  <div className="min-h-52 border-l-2 border-primary bg-card p-5 text-[15px] leading-8">
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

  return <EditorialEmptyState title="Trang bản thảo đang chờ brief" description="Hoàn tất brief ở cột bên trái, chọn model rồi tạo các phiên bản. Kết quả có thể xem trước, chỉnh sửa và lưu ngay tại đây." />;
}
