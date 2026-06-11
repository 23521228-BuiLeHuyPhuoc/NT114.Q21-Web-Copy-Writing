import { useState, type ReactNode } from 'react';
import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import { AlertTriangle, CheckCircle2, Clock, Database, FileCheck, FileText, RefreshCw, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCheckPlagiarism, usePlagiarismHistory } from '@/hooks/queries/usePlagiarism';
import type { PlagiarismReport, PlagiarismRiskLevel, PlagiarismSensitivity, PlagiarismSourceConfig, PlagiarismMatch, PlagiarismScoreBasis } from '@/services/plagiarismService';

const RISK: Record<PlagiarismRiskLevel, { label: string; cls: string }> = {
  safe: { label: 'An toàn', cls: 'bg-primary/10 text-primary border-primary/20' },
  review: { label: 'Cần rà soát', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  high: { label: 'Rủi ro cao', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  critical: { label: 'Trùng lặp cao', cls: 'bg-red-100 text-red-800 border-red-200' },
};

const SENSITIVITY: Record<PlagiarismSensitivity, { label: string; threshold: number }> = {
  lenient: { label: 'Nhẹ', threshold: 45 },
  balanced: { label: 'Cân bằng', threshold: 35 },
  strict: { label: 'Chặt', threshold: 25 },
};

const SOURCE_LABELS: Record<keyof PlagiarismSourceConfig, string> = {
  database: 'Nội dung đã lưu',
  references: 'Nguồn mẫu nội bộ',
  web: 'Common Crawl web',
  uploads: 'File tải lên',
};

const SCORE_BASIS_LABELS: Record<PlagiarismScoreBasis, string> = {
  exact: 'Trùng nguyên văn',
  phrase: 'Trùng cụm từ',
  word: 'Trùng từ khóa',
  none: 'Không có tín hiệu rõ',
};

const SCORE_BASIS_DESCRIPTIONS: Record<PlagiarismScoreBasis, string> = {
  exact: 'Đoạn sau khi chuẩn hóa xuất hiện gần như nguyên văn trong nguồn.',
  phrase: 'Nhiều cụm 3-5 từ liên tiếp trùng với nguồn được so sánh.',
  word: 'Tỷ lệ từ quan trọng trùng cao sau khi bỏ cụm CTA/câu mẫu phổ biến.',
  none: 'Điểm chưa vượt một tín hiệu cụ thể.',
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function scoreClass(score: number, similarity = false) {
  if (similarity) return score >= 45 ? 'text-red-600' : score >= 20 ? 'text-amber-600' : 'text-primary';
  return score >= 80 ? 'text-primary' : score >= 60 ? 'text-amber-600' : 'text-red-600';
}

function suspiciousHighlightClass(score: number) {
  if (score >= 70) return 'rounded border border-red-300 bg-red-200 px-1 py-0.5 text-red-950';
  if (score >= 45) return 'rounded border border-red-200 bg-red-100 px-1 py-0.5 text-red-900';
  return 'rounded border border-red-200 bg-red-50 px-1 py-0.5 text-red-800';
}

function scoreBadgeClass(score: number) {
  if (score >= 70) return 'border-0 bg-red-100 text-red-800';
  if (score >= 45) return 'border-0 bg-orange-100 text-orange-800';
  if (score >= 20) return 'border-0 bg-amber-100 text-amber-800';
  return 'border-0 bg-primary/10 text-primary';
}

function ratioLabel(matched: number, total: number, unit: string) {
  if (!total) return `0 ${unit}`;
  return `${matched}/${total} ${unit}`;
}

function basisLabel(value?: PlagiarismScoreBasis) {
  return SCORE_BASIS_LABELS[value || 'none'];
}

function basisDescription(value?: PlagiarismScoreBasis) {
  return SCORE_BASIS_DESCRIPTIONS[value || 'none'];
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

function mergeMatchRanges(matches: PlagiarismMatch[]) {
  const ranges = matches
    .map((match) => ({
      start: Math.max(0, Math.min(match.start, match.end)),
      end: Math.max(0, Math.max(match.start, match.end)),
      score: match.score,
      scoreBasis: match.scoreBasis,
      label: `${match.sourceTitle || match.sourceUrl || 'Nguồn'} · ${match.score}% · ${basisLabel(match.scoreBasis)}`,
    }))
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start || right.end - left.end);

  const merged: typeof ranges = [];
  ranges.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      return;
    }
    last.end = Math.max(last.end, range.end);
    if (range.score > last.score) {
      last.score = range.score;
      last.scoreBasis = range.scoreBasis;
      last.label = range.label;
    }
  });

  return merged;
}

function renderHighlightedText(text: string, matches: PlagiarismMatch[]) {
  const ranges = mergeMatchRanges(matches);
  if (ranges.length === 0) return <span>{text}</span>;

  const nodes: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, index) => {
    if (range.start > cursor) {
      nodes.push(<span key={`t-${index}-${cursor}`}>{text.slice(cursor, range.start)}</span>);
    }
    nodes.push(
      <mark
        key={`m-${index}-${range.start}-${range.end}`}
        title={range.label}
        className={suspiciousHighlightClass(range.score)}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`t-end-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return <>{nodes}</>;
}

function sourceTypeLabel(type: string) {
  if (type === 'database') return SOURCE_LABELS.database;
  if (type === 'reference' || type === 'references') return SOURCE_LABELS.references;
  if (type === 'web') return SOURCE_LABELS.web;
  if (type === 'uploads') return SOURCE_LABELS.uploads;
  return type;
}

function commonCrawlStatusLabel(status: string) {
  if (status === 'ok') return 'đã lấy được trang web để so khớp';
  if (status === 'empty') return 'đã truy vấn nhưng chưa có trang phù hợp';
  if (status === 'error') return 'truy vấn lỗi';
  return 'không bật';
}

function shortList(values: string[], max = 2) {
  if (values.length <= max) return values.join(', ');
  return `${values.slice(0, max).join(', ')} +${values.length - max}`;
}

export function CustomerPlagiarismCheck() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<PlagiarismReport | null>(null);
  const [sensitivity, setSensitivity] = useState<PlagiarismSensitivity>('balanced');
  const [sourceConfig, setSourceConfig] = useState<PlagiarismSourceConfig>({
    database: true,
    references: true,
    web: false,
    uploads: false,
  });
  const [ignoreCommonPhrases, setIgnoreCommonPhrases] = useState(true);
  const { data: history } = usePlagiarismHistory({ limit: 5 });
  const check = useCheckPlagiarism();
  const words = countWords(text);
  const historyItems = history?.items || [];
  const selectedSourceCount = Object.values(sourceConfig).filter(Boolean).length;

  const updateSource = (key: keyof PlagiarismSourceConfig, value: boolean) => {
    setSourceConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleCheck = () => {
    const trimmed = text.trim();
    if (trimmed.length < 20 || words < 5) {
      toast.error('Vui lòng nhập ít nhất 20 ký tự và 5 từ để kiểm tra');
      return;
    }
    if (selectedSourceCount === 0) {
      toast.error('Chọn ít nhất một nguồn để kiểm tra');
      return;
    }
    check.mutate({
      text: trimmed,
      threshold: SENSITIVITY[sensitivity].threshold,
      includeReferences: sourceConfig.references,
      sensitivity,
      ignoreCommonPhrases,
      sources: sourceConfig,
    }, {
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
          <div className='mt-4 grid gap-4 border-t pt-4 lg:grid-cols-[220px_1fr]'>
            <div>
              <p className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>Độ nhạy</p>
              <Select value={sensitivity} onValueChange={(value) => setSensitivity(value as PlagiarismSensitivity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SENSITIVITY).map(([value, item]) => (
                    <SelectItem key={value} value={value}>{item.label} · ngưỡng {item.threshold}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className='mb-2 text-xs font-semibold uppercase text-muted-foreground'>Phạm vi kiểm tra</p>
              <div className='grid gap-3 sm:grid-cols-2'>
                {(['database', 'references', 'web'] as const).map((key) => (
                  <label key={key} className='flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm'>
                    <span>{SOURCE_LABELS[key]}</span>
                    <Switch checked={sourceConfig[key]} onCheckedChange={(value) => updateSource(key, Boolean(value))} />
                  </label>
                ))}
                <label className='flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground'>
                  <span>{SOURCE_LABELS.uploads} <span className='text-xs'>(sắp có)</span></span>
                  <Switch checked={false} disabled />
                </label>
              </div>
              <label className='mt-3 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm'>
                <span>Bỏ qua cụm CTA/câu mẫu phổ biến</span>
                <Switch checked={ignoreCommonPhrases} onCheckedChange={(value) => setIgnoreCommonPhrases(Boolean(value))} />
              </label>
            </div>
          </div>
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
            <div className='mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]'>
              <div className='rounded-lg border bg-muted/30 p-4'>
                <h3 className='text-sm font-semibold text-foreground'>Căn cứ chấm điểm</h3>
                <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                  <div className='rounded-md border bg-background p-3'>
                    <p className='text-[11px] font-semibold uppercase text-muted-foreground'>Exact match</p>
                    <p className='mt-1 text-lg font-bold text-foreground'>{result.analysis.exactMatchScore}%</p>
                    <p className='mt-1 text-xs text-muted-foreground'>Trùng gần như nguyên văn sau chuẩn hóa.</p>
                  </div>
                  <div className='rounded-md border bg-background p-3'>
                    <p className='text-[11px] font-semibold uppercase text-muted-foreground'>N-gram</p>
                    <p className='mt-1 text-lg font-bold text-foreground'>{result.analysis.phraseOverlapScore}%</p>
                    <p className='mt-1 text-xs text-muted-foreground'>Tỷ lệ cụm 3-5 từ liên tiếp bị trùng.</p>
                  </div>
                  <div className='rounded-md border bg-background p-3'>
                    <p className='text-[11px] font-semibold uppercase text-muted-foreground'>Overlap từ</p>
                    <p className='mt-1 text-lg font-bold text-foreground'>{result.analysis.wordOverlapScore}%</p>
                    <p className='mt-1 text-xs text-muted-foreground'>Tỷ lệ từ quan trọng cùng xuất hiện.</p>
                  </div>
                </div>
                <p className='mt-3 text-xs text-muted-foreground'>Điểm tương đồng cuối cùng lấy mức cao nhất giữa điểm toàn văn và điểm từng đoạn; đoạn vượt ngưỡng {result.analysis.effectiveThreshold}% sẽ được bôi đỏ.</p>
              </div>
              <div className='rounded-lg border bg-muted/30 p-4 text-sm'>
                <h3 className='font-semibold text-foreground'>Thông số lần kiểm tra</h3>
                <div className='mt-3 space-y-2 text-xs text-muted-foreground'>
                  <p>Đã so với {result.analysis.candidateCount} nguồn: {result.analysis.checkedSourceTypes.map(sourceTypeLabel).join(', ') || 'không có nguồn'}.</p>
                  <p>Tìm thấy {result.analysis.matchCount || result.matches.length} đoạn vượt ngưỡng trong {result.wordCount} từ kiểm tra.</p>
                  <p>Chế độ: {SENSITIVITY[result.sensitivity].label}; {result.ignoreCommonPhrases ? 'đã bỏ qua cụm CTA/câu mẫu phổ biến' : 'không bỏ qua cụm phổ biến'}.</p>
                  {result.analysis.commonCrawl.enabled && (
                    <p>
                      Common Crawl: {commonCrawlStatusLabel(result.analysis.commonCrawl.status)}; {result.analysis.commonCrawl.queryCount} truy vấn, {result.analysis.commonCrawl.fetchedCount}/{result.analysis.commonCrawl.recordCount} WARC, {result.analysis.commonCrawl.candidateCount} trang so khớp{result.analysis.commonCrawl.indexes.length ? `; index ${shortList(result.analysis.commonCrawl.indexes)}` : ''}.
                    </p>
                  )}
                  {result.analysis.commonCrawl.status === 'error' && result.analysis.commonCrawl.error && <p className='text-red-700'>Common Crawl lỗi: {result.analysis.commonCrawl.error}</p>}
                  {result.analysis.unavailableSourceTypes.length > 0 && <p className='text-amber-700'>Chưa khả dụng: {result.analysis.unavailableSourceTypes.map(sourceTypeLabel).join(', ')}.</p>}
                </div>
              </div>
            </div>
          </Card>
        )}
        {result && (
          <Card className='p-5'>
            <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><FileText className='h-4 w-4 text-primary' /> Văn bản đã kiểm tra</h2>
            <div className='max-h-[300px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-7 text-foreground'>{renderHighlightedText(result.checkText, result.matches)}</div>
            {result.matches.length > 0 ? (
              <div className='mt-4 space-y-3'>
                <h3 className='text-sm font-semibold text-foreground'>Đoạn có khả năng đạo văn</h3>
                {result.matches.map((match, index) => (
                  <div key={`${match.start}-${match.end}-${index}`} className='rounded-lg border border-red-100 bg-red-50/50 p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <p className='text-sm font-semibold text-red-950'>Đoạn {index + 1}: {basisLabel(match.scoreBasis)}</p>
                        <p className='mt-1 text-xs text-red-800'>{basisDescription(match.scoreBasis)}</p>
                      </div>
                      <Badge className={scoreBadgeClass(match.score)}>{match.score}%</Badge>
                    </div>
                    <p className='mt-3 whitespace-pre-wrap rounded-md bg-background p-3 text-sm text-foreground'>{match.matchedText}</p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Exact</span><p className='font-semibold text-foreground'>{match.exactMatchScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>N-gram</span><p className='font-semibold text-foreground'>{match.phraseOverlapScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Overlap từ</span><p className='font-semibold text-foreground'>{match.wordOverlapScore}%</p></div>
                    </div>
                    <p className='mt-3 text-xs text-muted-foreground'>Trùng {ratioLabel(match.matchedWords, match.totalWords, 'từ')} và {ratioLabel(match.matchedPhrases, match.totalPhrases, 'cụm')} {match.phraseSize ? `(${match.phraseSize} từ/cụm)` : ''}.</p>
                    <div className='mt-3 rounded-md border bg-background p-3'>
                      <p className='text-xs font-semibold text-muted-foreground'>Nguồn gần nhất: {match.sourceTitle || sourceTypeLabel(match.sourceType)}</p>
                      <p className='mt-1 line-clamp-3 text-sm italic text-muted-foreground'>{match.sourceText}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='mt-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>Không có đoạn nào vượt ngưỡng để bôi đỏ.</p>
            )}
          </Card>
        )}
        {result && (
          <Card className='p-5'>
            <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><AlertTriangle className='h-4 w-4 text-amber-600' /> Nguồn tương đồng ({result.sources.length})</h2>
            <div className='space-y-3'>
              {result.sources.length === 0 ? (
                <p className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>Không tìm thấy nguồn tương đồng đáng kể.</p>
              ) : result.sources.map((source, index) => (
                <div key={`${source.source}-${index}`} className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-foreground'>{source.sourceTitle || source.source}</p>
                      <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'><Database className='h-3.5 w-3.5' /> {sourceTypeLabel(source.sourceType)} · {basisLabel(source.scoreBasis)}</p>
                    </div>
                    <Badge className={scoreBadgeClass(source.similarity)}>{source.similarity}%</Badge>
                  </div>
                  <p className='text-sm italic text-muted-foreground'>{source.snippet}</p>
                  <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>Exact</span><p className='font-semibold text-foreground'>{source.exactMatchScore}%</p></div>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>N-gram</span><p className='font-semibold text-foreground'>{source.phraseOverlapScore}%</p></div>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>Overlap từ</span><p className='font-semibold text-foreground'>{source.wordOverlapScore}%</p></div>
                  </div>
                  <p className='mt-2 text-xs text-muted-foreground'>Trùng {ratioLabel(source.matchedWords, source.totalWords, 'từ')} và {ratioLabel(source.matchedPhrases, source.totalPhrases, 'cụm')} trong phép so khớp toàn văn.</p>
                </div>
              ))}
            </div>
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
