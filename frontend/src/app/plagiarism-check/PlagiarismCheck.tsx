import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Textarea } from '@/app/components/ui/textarea';
import { AlertTriangle, CheckCircle2, Clock, Database, FileCheck, FileText, RefreshCw, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCheckPlagiarism, usePlagiarismHistory } from '@/hooks/queries/usePlagiarism';
import type { PlagiarismReport, PlagiarismRiskLevel } from '@/services/plagiarismService';

const RISK: Record<PlagiarismRiskLevel, { label: string; cls: string }> = {
  safe: { label: 'An toàn', cls: 'bg-primary/10 text-primary border-primary/20' },
  review: { label: 'Cần rà soát', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  high: { label: 'Rủi ro cao', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  critical: { label: 'Trùng lặp cao', cls: 'bg-red-100 text-red-800 border-red-200' },
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scoreClass(score: number, similarity = false) {
  if (similarity) return score >= 45 ? 'text-red-600' : score >= 20 ? 'text-amber-600' : 'text-primary';
  return score >= 80 ? 'text-primary' : score >= 60 ? 'text-amber-600' : 'text-red-600';
}

function errorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Không thể kiểm tra đạo văn';
  }
  return error instanceof Error ? error.message : 'Không thể kiểm tra đạo văn';
}

function dateLabel(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

export function CustomerPlagiarismCheck() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<PlagiarismReport | null>(null);
  const { data: history } = usePlagiarismHistory({ limit: 5 });
  const check = useCheckPlagiarism();
  const words = countWords(text);
  const historyItems = history?.items || [];

  const handleCheck = () => {
    const trimmed = text.trim();
    if (trimmed.length < 20 || words < 5) {
      toast.error('Vui lòng nhập ít nhất 20 ký tự và 5 từ để kiểm tra');
      return;
    }
    check.mutate({ text: trimmed, threshold: 35, includeReferences: true }, {
      onSuccess: (report) => { setResult(report); toast.success('Kiểm tra đạo văn hoàn tất'); },
      onError: (error) => toast.error(errorMessage(error)),
    });
  };

  return (
    <Layout>
      <div className='mx-auto max-w-6xl space-y-6 p-6'>
        <h1 className='text-3xl font-bold text-foreground'>Kiểm tra đạo văn AI</h1>
        <Card className='p-5'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <div><h2 className='font-semibold text-foreground'>Nội dung cần kiểm tra</h2><p className='text-xs text-muted-foreground'>So khớp với nội dung đã lưu và nguồn tham chiếu demo.</p></div>
            <Badge variant='outline'>{words} từ</Badge>
          </div>
          <Textarea className='min-h-[220px] text-sm leading-6' placeholder='Dán nội dung AI hoặc bản nháp quảng cáo vào đây...' value={text} onChange={(event) => setText(event.target.value)} />
          <div className='mt-4 flex gap-3'>
            <Button className='h-11 flex-1 text-white' onClick={handleCheck} disabled={check.isPending}>{check.isPending ? <><RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Đang kiểm tra...</> : <><FileCheck className='mr-2 h-4 w-4' /> Kiểm tra đạo văn</>}</Button>
            <Button variant='outline' onClick={() => { setText(''); setResult(null); }}>Xóa</Button>
          </div>
        </Card>
        {result && (
          <Card className='p-5'>
            <div className='mb-4 flex items-start justify-between gap-4'>
              <div><h2 className='font-semibold text-foreground'>Kết quả phân tích</h2><p className='text-sm text-muted-foreground'>{result.summary}</p></div>
              <Badge variant='outline' className={RISK[result.riskLevel].cls}>{RISK[result.riskLevel].label}</Badge>
            </div>
            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Tính độc đáo</p><p className={`mt-2 text-3xl font-bold ${scoreClass(result.originalityScore)}`}>{result.originalityScore}%</p><Progress value={result.originalityScore} className='mt-3' /></div>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Độ tương đồng</p><p className={`mt-2 text-3xl font-bold ${scoreClass(result.similarityScore, true)}`}>{result.similarityScore}%</p><Progress value={result.similarityScore} className='mt-3' /></div>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Đoạn nghi vấn</p><p className='mt-2 text-3xl font-bold text-foreground'>{result.matches.length}</p><p className='mt-3 text-xs text-muted-foreground'>{result.modelUsed}</p></div>
            </div>
          </Card>
        )}
        {result && (
          <Card className='p-5'>
            <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><FileText className='h-4 w-4 text-primary' /> Văn bản đã kiểm tra</h2>
            <div className='max-h-[300px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-7 text-foreground'>{result.checkText}</div>
            {result.matches[0] && <p className='mt-3 rounded-lg bg-amber-100 p-3 text-sm text-amber-900'>Đoạn nghi vấn nổi bật: {result.matches[0].matchedText}</p>}
          </Card>
        )}
        {result && (
          <Card className='p-5'>
            <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><AlertTriangle className='h-4 w-4 text-amber-600' /> Nguồn tương đồng ({result.sources.length})</h2>
            <div className='space-y-3'>{result.sources.length === 0 ? <p className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>Không tìm thấy nguồn tương đồng đáng kể.</p> : result.sources.map((source, index) => <div key={`${source.source}-${index}`} className='rounded-lg border p-4'><div className='mb-2 flex items-center justify-between gap-2'><div className='min-w-0'><p className='truncate text-sm font-semibold text-foreground'>{source.sourceTitle || source.source}</p><p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'><Database className='h-3.5 w-3.5' /> {source.sourceType}</p></div><Badge className='border-0 bg-amber-100 text-amber-800'>{source.similarity}%</Badge></div><p className='text-sm italic text-muted-foreground'>{source.snippet}</p></div>)}</div>
          </Card>
        )}
        <Card className='p-5'>
          <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><Clock className='h-4 w-4 text-primary' /> Lịch sử gần đây</h2>
          <div className='mb-4 grid gap-3 sm:grid-cols-3'><div className='flex items-center gap-2 text-sm'><Search className='h-4 w-4 text-primary' /> {history?.pagination.totalItems || historyItems.length} lượt kiểm tra</div><div className='flex items-center gap-2 text-sm'><Shield className='h-4 w-4 text-primary' /> local-ngram-v1</div><div className='flex items-center gap-2 text-sm'><CheckCircle2 className='h-4 w-4 text-primary' /> ngưỡng 35%</div></div>
          {historyItems.length === 0 ? <p className='text-sm text-muted-foreground'>Chưa có report nào.</p> : <div className='space-y-3'>{historyItems.map((item) => <button key={item.id} type='button' onClick={() => setResult(item)} className='w-full rounded-lg border p-3 text-left hover:border-primary/50'><div className='mb-2 flex items-center justify-between gap-2'><span className='text-sm font-semibold text-foreground'>{item.originalityScore}% độc đáo</span><Badge variant='outline' className={RISK[item.riskLevel].cls}>{RISK[item.riskLevel].label}</Badge></div><p className='line-clamp-2 text-xs text-muted-foreground'>{item.checkText}</p><p className='mt-2 text-[11px] text-muted-foreground'>{dateLabel(item.createdAt)}</p></button>)}</div>}
        </Card>
      </div>
    </Layout>
  );
}
