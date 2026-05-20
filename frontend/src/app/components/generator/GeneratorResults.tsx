import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Separator } from '@/app/components/ui/separator';
import {
  RefreshCw, Copy, Save, Download, Sparkles, Zap, Star, History,
  CheckCircle2, ThumbsUp, ThumbsDown, Eye, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Markdown } from '@/app/components/common/Markdown';

interface Props {
  isGenerating: boolean;
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

export function GeneratorResults({
  isGenerating,
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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  if (isGenerating || results.length > 0) {
    return (
      <div className="space-y-4">
        {/* Streaming view */}
        {isGenerating && streamText && (
          <Card className="p-5 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm font-medium text-primary">Đang tạo phiên bản 1/{variations}...</span>
            </div>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{streamText}<span className="animate-pulse">▋</span></p>
          </Card>
        )}

        {/* Results tabs */}
        {!isGenerating && results.length > 0 && (
          <>
            {results.length > 1 && (
              <div className="flex gap-2">
                {results.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectResult(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedResult === i ? 'bg-primary text-white' : 'bg-muted text-foreground/70 hover:bg-gray-200'}`}
                  >
                    Phiên bản {i + 1}
                    {qualityScores[i] && <span className="ml-1.5 text-xs opacity-80">⭐{qualityScores[i]}%</span>}
                  </button>
                ))}
              </div>
            )}

            {results[selectedResult] && (
              <Card className="p-5 border-2 border-primary/20">
                {/* Quality score */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${qualityScores[selectedResult] >= 90 ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'}`}>
                      ⭐ Chất lượng: {qualityScores[selectedResult]}%
                    </div>
                    <span className="text-xs text-muted-foreground">{results[selectedResult].split(' ').length} từ</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex items-center gap-1 mr-2 bg-muted rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode('edit')}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${viewMode === 'edit' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'}`}
                      >
                        <Pencil className="w-3 h-3" /> Chỉnh sửa
                      </button>
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${viewMode === 'preview' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'}`}
                      >
                        <Eye className="w-3 h-3" /> Xem trước
                      </button>
                    </div>
                    <button className="p-1.5 hover:bg-muted rounded" onClick={() => toast.success('Đã đánh giá tốt!')}><ThumbsUp className="w-4 h-4 text-muted-foreground" /></button>
                    <button className="p-1.5 hover:bg-muted rounded" onClick={() => toast.success('Cảm ơn phản hồi!')}><ThumbsDown className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                </div>

                {/* Content */}
                {viewMode === 'edit' ? (
                  <Textarea
                    value={results[selectedResult]}
                    onChange={e => onResultChange(selectedResult, e.target.value)}
                    className="min-h-40 bg-surface-muted text-foreground whitespace-pre-wrap leading-relaxed resize-none border-0 focus-visible:ring-0 text-sm"
                  />
                ) : (
                  <div className="min-h-40 bg-surface-muted rounded-md p-3">
                    <Markdown>{results[selectedResult]}</Markdown>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => onCopy(results[selectedResult])}>
                    <Copy className="w-4 h-4 mr-1" /> Sao chép
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onSave(results[selectedResult])}>
                    <Save className="w-4 h-4 mr-1" /> Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDownload(results[selectedResult])}>
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

  /* Empty state */
  return (
    <Card className="p-12 text-center border-2 border-dashed border-border">
      <div className="bg-gradient-to-r from-green-100 to-green-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-bold text-foreground mb-2">Sẵn sàng tạo copy?</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Chọn ngành nghề, loại nội dung, tone giọng và model AI. Nhấn "Tạo Copy Ngay" để bắt đầu!
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
        {[
          { icon: Zap, label: 'Tạo trong 2 giây', color: 'text-amber-600 bg-warning/10' },
          { icon: Star, label: 'Chất lượng 90%+', color: 'text-primary bg-primary/5' },
          { icon: History, label: 'Lưu tự động', color: 'text-primary bg-primary/5' },
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
