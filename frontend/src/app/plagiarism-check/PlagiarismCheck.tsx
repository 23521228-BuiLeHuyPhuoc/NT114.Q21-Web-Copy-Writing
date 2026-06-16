import { useState, type ReactNode } from 'react';
import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Database, FileCheck, FileText, Plus, RefreshCw, Search, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCheckPlagiarism, usePlagiarismHistory } from '@/hooks/queries/usePlagiarism';
import type { PlagiarismReport, PlagiarismRiskLevel, PlagiarismSensitivity, PlagiarismSourceConfig, PlagiarismMatch, PlagiarismScoreBasis } from '@/services/plagiarismService';

const RISK: Record<PlagiarismRiskLevel, { label: string; cls: string }> = {
  safe: { label: 'An toàn', cls: 'bg-primary/10 text-primary border-primary/20' },
  review: { label: 'Cần rà soát', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  high: { label: 'Rủi ro cao', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
  critical: { label: 'Trùng lặp cao', cls: 'bg-red-100 text-red-800 border-red-200' },
};

function riskLevelFromScore(score: number): PlagiarismRiskLevel {
  if (score >= 70) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 20) return 'review';
  return 'safe';
}

const SENSITIVITY: Record<PlagiarismSensitivity, { label: string; threshold: number }> = {
  lenient: { label: 'Nhẹ', threshold: 45 },
  balanced: { label: 'Cân bằng', threshold: 35 },
  strict: { label: 'Chặt', threshold: 25 },
};

const SOURCE_LABELS: Record<keyof PlagiarismSourceConfig, string> = {
  database: 'Nội dung đã lưu',
  references: 'Nguồn mẫu nội bộ',
  web: 'SerpApi + Common Crawl',
  uploads: 'File tải lên',
};

const MAX_IGNORED_PHRASES = 30;
const MAX_IGNORED_PHRASE_LENGTH = 10000;

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

function normalizeIgnoredPhrase(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_IGNORED_PHRASE_LENGTH).trim();
}

function normalizeIgnoredPhrases(values: string[]) {
  const seen = new Set<string>();
  const phrases: string[] = [];

  values.forEach((value) => {
    if (phrases.length >= MAX_IGNORED_PHRASES) return;
    const phrase = normalizeIgnoredPhrase(value);
    const key = phrase.toLocaleLowerCase('vi-VN');
    if (phrase.length < 2 || seen.has(key)) return;
    seen.add(key);
    phrases.push(phrase);
  });

  return phrases;
}

function splitIgnoredPhraseInput(value: string) {
  const phrase = normalizeIgnoredPhrase(value);
  return phrase.length >= 2 ? [phrase] : [];
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

function topicHighlightClass(score: number) {
  if (score >= 70) return 'rounded border border-amber-300 bg-amber-200 px-1 py-0.5 text-amber-950';
  if (score >= 45) return 'rounded border border-amber-200 bg-amber-100 px-1 py-0.5 text-amber-900';
  return 'rounded border border-amber-200 bg-amber-50 px-1 py-0.5 text-amber-800';
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
    const data = (error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } }).response?.data;
    const details = data?.errors?.map((item) => [item.field, item.message].filter(Boolean).join(': ')).filter(Boolean) || [];
    if (details.length > 0) return `${data?.message || 'Validation error'}: ${details.slice(0, 2).join('; ')}`;
    return data?.message || 'Không thể kiểm tra đạo văn';
  }
  return error instanceof Error ? error.message : 'Không thể kiểm tra đạo văn';
}

function dateLabel(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
}

type HighlightKind = 'plagiarism' | 'topic';
type TextRange = { start: number; end: number };

function normalizeToken(value: string) {
  return value
    .toLocaleLowerCase('vi-VN')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function tokenizeWithRanges(value: string) {
  const tokens: Array<TextRange & { value: string }> = [];
  const regex = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const token = normalizeToken(match[0]);
    if (!token) continue;
    tokens.push({ value: token, start: match.index, end: match.index + match[0].length });
  }

  return tokens;
}

function mergeRanges(ranges: TextRange[]) {
  const sorted = ranges
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const merged: TextRange[] = [];

  sorted.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      return;
    }
    last.end = Math.max(last.end, range.end);
  });

  return merged;
}

function findIgnoredTextRanges(text: string, ignoredPhrases: string[]) {
  if (!text || ignoredPhrases.length === 0) return [];

  const textTokens = tokenizeWithRanges(text);
  const ranges: TextRange[] = [];

  ignoredPhrases.forEach((phrase) => {
    const phraseTokens = tokenizeWithRanges(phrase).map((token) => token.value);
    if (phraseTokens.length === 0 || phraseTokens.length > textTokens.length) return;

    for (let index = 0; index <= textTokens.length - phraseTokens.length; index += 1) {
      const isMatch = phraseTokens.every((token, tokenIndex) => textTokens[index + tokenIndex].value === token);
      if (!isMatch) continue;
      ranges.push({
        start: textTokens[index].start,
        end: textTokens[index + phraseTokens.length - 1].end,
      });
    }
  });

  return mergeRanges(ranges);
}

function subtractRanges<T extends TextRange>(range: T, exclusions: TextRange[]) {
  let pieces: T[] = [{ ...range }];

  exclusions.forEach((exclusion) => {
    pieces = pieces.flatMap((piece) => {
      if (!rangesOverlap(piece, exclusion)) return [piece];

      const next: T[] = [];
      if (exclusion.start > piece.start) {
        next.push({ ...piece, end: Math.min(exclusion.start, piece.end) });
      }
      if (exclusion.end < piece.end) {
        next.push({ ...piece, start: Math.max(exclusion.end, piece.start) });
      }
      return next.filter((item) => item.end > item.start);
    });
  });

  return pieces;
}

function mergeMatchRanges(matches: PlagiarismMatch[], kind: HighlightKind) {
  const ranges = matches
    .map((match) => ({
      start: Math.max(0, Math.min(match.start, match.end)),
      end: Math.max(0, Math.max(match.start, match.end)),
      score: match.score,
      scoreBasis: match.scoreBasis,
      kind,
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

function rangesOverlap(left: { start: number; end: number }, right: { start: number; end: number }) {
  return left.start < right.end && right.start < left.end;
}

function buildHighlightRanges(text: string, matches: PlagiarismMatch[], topicMatches: PlagiarismMatch[], ignoredPhrases: string[]) {
  const plagiarismRanges = mergeMatchRanges(matches, 'plagiarism');
  const topicRanges = mergeMatchRanges(topicMatches, 'topic')
    .filter((topicRange) => !plagiarismRanges.some((plagiarismRange) => rangesOverlap(topicRange, plagiarismRange)));
  const ignoredRanges = findIgnoredTextRanges(text, ignoredPhrases);

  return [...plagiarismRanges, ...topicRanges]
    .flatMap((range) => subtractRanges(range, ignoredRanges))
    .sort((left, right) => left.start - right.start || right.end - left.end);
}

function highlightClass(range: { kind: HighlightKind; score: number }) {
  return range.kind === 'plagiarism'
    ? suspiciousHighlightClass(range.score)
    : topicHighlightClass(range.score);
}

function renderHighlightedText(text: string, matches: PlagiarismMatch[], topicMatches: PlagiarismMatch[] = [], ignoredPhrases: string[] = []) {
  const ranges = buildHighlightRanges(text, matches, topicMatches, ignoredPhrases);
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
        className={highlightClass(range)}
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

function renderTextWithIgnoredPhrases(text: string, ignoredPhrases: string[]) {
  const ranges = findIgnoredTextRanges(text, ignoredPhrases);
  if (ranges.length === 0) return <>{text}</>;

  const nodes: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, index) => {
    if (range.start > cursor) {
      nodes.push(<span key={`plain-${index}-${cursor}`}>{text.slice(cursor, range.start)}</span>);
    }
    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(<span key={`plain-end-${cursor}`}>{text.slice(cursor)}</span>);
  }

  return nodes.length > 0 ? <>{nodes}</> : <span className='text-muted-foreground'>Đã bỏ qua toàn bộ cụm này.</span>;
}

function removeIgnoredPhrasesFromText(text: string, ignoredPhrases: string[]) {
  const ranges = findIgnoredTextRanges(text, ignoredPhrases);
  if (ranges.length === 0) return text;

  let cursor = 0;
  let output = '';
  ranges.forEach((range) => {
    output += text.slice(cursor, range.start);
    output += ' ';
    cursor = range.end;
  });
  output += text.slice(cursor);

  return output.replace(/\s+([,.!?;:])/g, '$1').replace(/\s+/g, ' ').trim();
}

function hasDisplayableMatch(match: PlagiarismMatch, ignoredPhrases: string[]) {
  return countWords(removeIgnoredPhrasesFromText(match.matchedText, ignoredPhrases)) >= 3;
}

function sourceTypeLabel(type: string) {
  if (type === 'database') return SOURCE_LABELS.database;
  if (type === 'reference' || type === 'references') return SOURCE_LABELS.references;
  if (type === 'web') return SOURCE_LABELS.web;
  if (type === 'uploads') return SOURCE_LABELS.uploads;
  return type;
}

function commonCrawlStatusLabel(status: string) {
  if (status === 'ok') return 'đã nạp được nguồn web để so khớp';
  if (status === 'empty') return 'đã truy vấn nhưng chưa nạp được nguồn web phù hợp';
  if (status === 'error') return 'truy vấn lỗi';
  return 'không bật';
}

function serpApiStatusLabel(status: string) {
  if (status === 'ok') return 'đã tìm được URL ứng viên';
  if (status === 'empty') return 'không có URL phù hợp';
  if (status === 'missing_api_key') return 'thiếu SERPAPI_API_KEY';
  if (status === 'error') return 'truy vấn lỗi';
  return 'không chạy';
}

function sourceModeLabel(mode: string) {
  if (mode === 'commoncrawl') return 'Common Crawl snapshot';
  if (mode === 'live') return 'tải trực tiếp URL';
  if (mode === 'mixed') return 'Common Crawl + tải trực tiếp URL';
  return 'chưa có nguồn web';
}

function coverageLabel(level: string) {
  if (level === 'good') return 'tốt';
  if (level === 'medium') return 'trung bình';
  if (level === 'low') return 'thấp';
  return 'chưa có';
}

function coverageWarning(level: string, candidateCount: number) {
  if (level === 'good') return '';
  if (level === 'medium') {
    return `Độ phủ trung bình: đã dùng ${candidateCount} nguồn web, đủ để rà soát sơ bộ nhưng chưa đại diện toàn bộ web.`;
  }
  if (level === 'low') {
    return `Độ phủ thấp: chỉ dùng ${candidateCount} nguồn web, chưa đủ để kết luận nội dung không đạo văn.`;
  }
  return 'Chưa nạp được nguồn web, chưa đủ để kết luận nội dung không đạo văn.';
}

function shouldShowCdxError(commonCrawl: PlagiarismReport['analysis']['commonCrawl']) {
  if (!commonCrawl.cdxErrorCount || !commonCrawl.lastCdxError) return false;
  return !(commonCrawl.sourceMode === 'live' && commonCrawl.liveFetchCount > 0);
}

function shortList(values: string[], max = 2) {
  if (values.length <= max) return values.join(', ');
  return `${values.slice(0, max).join(', ')} +${values.length - max}`;
}

function breakableShortList(values: string[], max = 2) {
  const shown = values.slice(0, max);
  const hiddenCount = Math.max(0, values.length - shown.length);

  return (
    <span className='break-words [overflow-wrap:anywhere]'>
      {shown.map((value, index) => (
        <span key={`${value}-${index}`}>
          {index > 0 ? ', ' : ''}{value}
        </span>
      ))}
      {hiddenCount > 0 ? ` +${hiddenCount}` : ''}
    </span>
  );
}

function checkedUrlStatusLabel(item: PlagiarismReport['analysis']['commonCrawl']['checkedUrls'][number]) {
  if (item.mode === 'commoncrawl') return 'Đã dùng snapshot';
  if (item.mode === 'live') return 'Đã dùng live';
  return 'Không dùng';
}

function plagiarismConclusion(report: PlagiarismReport, visibleMatchCount?: number, visibleTopicMatchCount?: number, visiblePlagiarismScore?: number) {
  const plagiarism = Math.round(visiblePlagiarismScore ?? report.analysis.plagiarismScore ?? report.similarityScore ?? 0);
  const topicSimilarity = Math.round(report.analysis.topicSimilarityScore || report.analysis.wordOverlapScore || 0);
  const originality = Math.round(100 - plagiarism);
  const threshold = report.analysis.effectiveThreshold || report.threshold || 35;
  const matchCount = visibleMatchCount ?? (report.analysis.matchCount || report.matches.length);
  const topicMatchCount = visibleTopicMatchCount ?? (report.analysis.topicMatchCount || report.topicMatches.length);
  const loadedSources = report.analysis.candidateCount || 0;
  const sourceText = `${loadedSources} nguồn đã nạp, ${matchCount} đoạn vượt ngưỡng ${threshold}%, ${topicMatchCount} đoạn tương đồng chủ đề, tương đồng chủ đề ${topicSimilarity}%`;

  if (loadedSources <= 0) {
    return {
      icon: 'warn' as const,
      className: 'border-amber-200 bg-amber-50 text-amber-950',
      iconClassName: 'text-amber-600',
      label: 'Chưa đủ dữ liệu để kết luận',
      description: `Nguy cơ đạo văn tạm tính ${plagiarism}%, nhưng hệ thống chưa nạp được nguồn để so khớp đáng tin cậy.`,
      detail: sourceText,
    };
  }

  if (matchCount > 0 || plagiarism >= threshold) {
    return {
      icon: 'warn' as const,
      className: 'border-red-200 bg-red-50 text-red-950',
      iconClassName: 'text-red-600',
      label: 'Có dấu hiệu đạo văn, cần rà soát',
      description: `Nguy cơ đạo văn cao nhất là ${plagiarism}%. Hệ thống tìm thấy ${matchCount} đoạn vượt ngưỡng ${threshold}%.`,
      detail: `${sourceText}; độ độc đáo còn ${originality}%. Nên viết lại các đoạn được bôi đỏ trước khi sử dụng.`,
    };
  }

  if (topicSimilarity >= 20) {
    return {
      icon: 'warn' as const,
      className: 'border-amber-200 bg-amber-50 text-amber-950',
      iconClassName: 'text-amber-600',
      label: 'Tương đồng chủ đề, chưa đủ bằng chứng đạo văn',
      description: `Nguy cơ đạo văn chỉ ${plagiarism}%, chưa có đoạn vượt ngưỡng ${threshold}%. Tương đồng chủ đề/từ khóa là ${topicSimilarity}%.`,
      detail: `${sourceText}; không xem overlap từ là đạo văn nếu exact/n-gram thấp.`,
    };
  }

  return {
    icon: 'ok' as const,
    className: 'border-primary/20 bg-primary/5 text-foreground',
    iconClassName: 'text-primary',
    label: 'Chưa phát hiện đạo văn đáng kể',
    description: `Nguy cơ đạo văn là ${plagiarism}%, không có đoạn nào vượt ngưỡng ${threshold}%.`,
    detail: `${sourceText}; độ độc đáo ${originality}%. Kết luận chỉ áp dụng trên các nguồn đã nạp.`,
  };
}

function durationLabel(ms: number) {
  if (!ms) return '0s';
  const seconds = ms / 1000;
  return `${seconds >= 10 ? Math.round(seconds) : seconds.toFixed(1)}s`;
}

export function CustomerPlagiarismCheck() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<PlagiarismReport | null>(null);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [sensitivity, setSensitivity] = useState<PlagiarismSensitivity>('balanced');
  const [sourceConfig, setSourceConfig] = useState<PlagiarismSourceConfig>({
    database: true,
    references: true,
    web: false,
    uploads: false,
  });
  const [ignoreCommonPhrases, setIgnoreCommonPhrases] = useState(true);
  const [ignoredPhraseInput, setIgnoredPhraseInput] = useState('');
  const [ignoredPhrases, setIgnoredPhrases] = useState<string[]>([]);
  const { data: history } = usePlagiarismHistory({ limit: 5 });
  const check = useCheckPlagiarism();
  const words = countWords(text);
  const historyItems = history?.items || [];
  const selectedSourceCount = Object.values(sourceConfig).filter(Boolean).length;
  const displayMatches = result ? result.matches.filter((match) => hasDisplayableMatch(match, result.ignoredPhrases)) : [];
  const displayTopicMatches = result ? result.topicMatches.filter((match) => hasDisplayableMatch(match, result.ignoredPhrases)) : [];
  const visiblePlagiarismScore = result && displayMatches.length > 0 ? (result.analysis.plagiarismScore || result.similarityScore) : 0;
  const visibleOriginalityScore = 100 - visiblePlagiarismScore;
  const visibleRiskLevel = riskLevelFromScore(visiblePlagiarismScore);
  const displaySources = result && (displayMatches.length > 0 || displayTopicMatches.length > 0)
    ? result.sources.filter((source) => countWords(removeIgnoredPhrasesFromText(source.sourceText || source.snippet, result.ignoredPhrases)) >= 3)
    : [];
  const visibleSummary = result && visiblePlagiarismScore === 0 && displayTopicMatches.length === 0
    ? 'Không còn đoạn nào vượt ngưỡng sau khi áp dụng danh sách bỏ qua.'
    : result?.summary || '';
  const conclusion = result ? plagiarismConclusion(result, displayMatches.length, displayTopicMatches.length, visiblePlagiarismScore) : null;

  const updateSource = (key: keyof PlagiarismSourceConfig, value: boolean) => {
    setSourceConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAddIgnoredPhrases = () => {
    const additions = splitIgnoredPhraseInput(ignoredPhraseInput);
    if (additions.length === 0) {
      toast.error('Nhập ít nhất một cụm từ 2 ký tự trở lên');
      return;
    }

    const next = normalizeIgnoredPhrases([...ignoredPhrases, ...additions]);
    if (next.length === ignoredPhrases.length) {
      toast.error('Các cụm này đã có trong danh sách');
      return;
    }

    if (next.length === MAX_IGNORED_PHRASES && ignoredPhrases.length + additions.length > MAX_IGNORED_PHRASES) {
      toast.error(`Chỉ lưu tối đa ${MAX_IGNORED_PHRASES} cụm bỏ qua`);
    }

    setIgnoredPhrases(next);
    setIgnoredPhraseInput('');
  };

  const updateIgnoredPhrase = (index: number, value: string) => {
    setIgnoredPhrases(prev => prev.map((phrase, phraseIndex) => (
      phraseIndex === index ? value.slice(0, MAX_IGNORED_PHRASE_LENGTH) : phrase
    )));
  };

  const removeIgnoredPhrase = (index: number) => {
    setIgnoredPhrases(prev => prev.filter((_, phraseIndex) => phraseIndex !== index));
  };

  const toggleSourceExpanded = (key: string) => {
    setExpandedSources(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheck = () => {
    const trimmed = text.trim();
    const pendingIgnoredPhrases = splitIgnoredPhraseInput(ignoredPhraseInput);
    const normalizedIgnoredPhrases = normalizeIgnoredPhrases([...ignoredPhrases, ...pendingIgnoredPhrases]);
    if (trimmed.length < 20 || words < 5) {
      toast.error('Vui lòng nhập ít nhất 20 ký tự và 5 từ để kiểm tra');
      return;
    }
    if (selectedSourceCount === 0) {
      toast.error('Chọn ít nhất một nguồn để kiểm tra');
      return;
    }
    setIgnoredPhrases(normalizedIgnoredPhrases);
    setIgnoredPhraseInput('');
    check.mutate({
      text: trimmed,
      threshold: SENSITIVITY[sensitivity].threshold,
      includeReferences: sourceConfig.references,
      sensitivity,
      ignoreCommonPhrases,
      ignoredPhrases: normalizedIgnoredPhrases,
      sources: sourceConfig,
    }, {
      onSuccess: (report) => { setResult(report); setExpandedSources({}); toast.success('Kiểm tra đạo văn hoàn tất'); },
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
              <div className='mt-3 rounded-md border bg-background p-3'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-sm font-medium text-foreground'>Đoạn/cụm bỏ qua tự thêm</p>
                  <Badge variant='outline'>{ignoredPhrases.length}/{MAX_IGNORED_PHRASES}</Badge>
                </div>
                <Textarea
                  className='mt-3 min-h-[72px] resize-none text-sm'
                  placeholder='Dán nguyên đoạn/cụm cần bỏ qua. Hệ thống không tự tách theo dấu phẩy, dấu chấm hay dấu ;.'
                  value={ignoredPhraseInput}
                  onChange={(event) => setIgnoredPhraseInput(event.target.value)}
                  disabled={ignoredPhrases.length >= MAX_IGNORED_PHRASES}
                  maxLength={MAX_IGNORED_PHRASES * MAX_IGNORED_PHRASE_LENGTH}
                />
                <div className='mt-2 flex justify-end'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddIgnoredPhrases}
                    disabled={!ignoredPhraseInput.trim() || ignoredPhrases.length >= MAX_IGNORED_PHRASES}
                  >
                    <Plus className='mr-2 h-4 w-4' /> Thêm đoạn/cụm
                  </Button>
                </div>
                {ignoredPhrases.length > 0 && (
                  <div className='mt-3 max-h-[220px] space-y-2 overflow-auto pr-1'>
                    {ignoredPhrases.map((phrase, index) => (
                      <div key={`ignored-phrase-${index}`} className='flex items-center gap-2'>
                        <Input
                          value={phrase}
                          onChange={(event) => updateIgnoredPhrase(index, event.target.value)}
                          onBlur={() => setIgnoredPhrases(prev => normalizeIgnoredPhrases(prev))}
                          maxLength={MAX_IGNORED_PHRASE_LENGTH}
                          className='h-9 text-sm'
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='h-9 w-9 shrink-0'
                          onClick={() => removeIgnoredPhrase(index)}
                          aria-label={`Xóa cụm ${phrase}`}
                          title='Xóa cụm'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='mt-4 flex gap-3'>
            <Button className='h-11 flex-1 text-white' onClick={handleCheck} disabled={check.isPending}>{check.isPending ? <><RefreshCw className='mr-2 h-4 w-4 animate-spin' /> Đang kiểm tra...</> : <><FileCheck className='mr-2 h-4 w-4' /> Kiểm tra đạo văn</>}</Button>
            <Button variant='outline' onClick={() => { setText(''); setResult(null); setExpandedSources({}); }}>Xóa</Button>
          </div>
        </Card>
        {result && (
          <Card className='p-5'>
            <div className='mb-4 flex items-start justify-between gap-4'>
              <div><h2 className='font-semibold text-foreground'>Kết quả phân tích</h2><p className='text-sm text-muted-foreground'>{visibleSummary}</p></div>
              <Badge variant='outline' className={RISK[visibleRiskLevel].cls}>{RISK[visibleRiskLevel].label}</Badge>
            </div>
            {conclusion && (
              <div className={`mb-4 flex gap-3 rounded-lg border p-4 ${conclusion.className}`}>
                {conclusion.icon === 'ok'
                  ? <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${conclusion.iconClassName}`} />
                  : <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${conclusion.iconClassName}`} />}
                <div className='min-w-0'>
                  <p className='text-sm font-semibold'>Kết luận sơ bộ: {conclusion.label}</p>
                  <p className='mt-1 text-sm'>{conclusion.description}</p>
                  <p className='mt-2 text-xs opacity-80'>{conclusion.detail}</p>
                </div>
              </div>
            )}
            <div className='grid gap-4 md:grid-cols-4'>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Tính độc đáo</p><p className={`mt-2 text-3xl font-bold ${scoreClass(visibleOriginalityScore)}`}>{visibleOriginalityScore}%</p><Progress value={visibleOriginalityScore} className='mt-3' /></div>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Nguy cơ đạo văn</p><p className={`mt-2 text-3xl font-bold ${scoreClass(visiblePlagiarismScore, true)}`}>{visiblePlagiarismScore}%</p><Progress value={visiblePlagiarismScore} className='mt-3' /></div>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Tương đồng chủ đề</p><p className={`mt-2 text-3xl font-bold ${scoreClass(result.analysis.topicSimilarityScore || result.analysis.wordOverlapScore, true)}`}>{result.analysis.topicSimilarityScore || result.analysis.wordOverlapScore}%</p><Progress value={result.analysis.topicSimilarityScore || result.analysis.wordOverlapScore} className='mt-3' /></div>
              <div className='rounded-lg border p-4'><p className='text-xs uppercase text-muted-foreground'>Đoạn cần xem</p><p className='mt-2 text-3xl font-bold text-foreground'>{displayMatches.length + displayTopicMatches.length}</p><p className='mt-3 text-xs text-muted-foreground'>{displayMatches.length} đạo văn · {displayTopicMatches.length} tương đồng</p></div>
            </div>
            <div className='mt-4 grid gap-3'>
              <div className='min-w-0 rounded-lg border bg-muted/30 p-4'>
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
                <p className='mt-3 text-xs text-muted-foreground'>Điểm đạo văn dùng Exact match và N-gram; Overlap từ chỉ đo tương đồng chủ đề/từ khóa. Chỉ đoạn có điểm đạo văn vượt ngưỡng {result.analysis.effectiveThreshold}% mới được bôi đỏ.</p>
              </div>
              <div className='min-w-0 rounded-lg border bg-muted/30 p-4 text-sm'>
                <h3 className='font-semibold text-foreground'>Thông số lần kiểm tra</h3>
                <div className='mt-3 min-w-0 space-y-2 overflow-hidden text-xs text-muted-foreground'>
                  <p>Đã nạp {result.analysis.candidateCount} nguồn để so khớp; {result.analysis.sourceCount} nguồn có tín hiệu tương đồng: {result.analysis.checkedSourceTypes.map(sourceTypeLabel).join(', ') || 'không có nguồn'}.</p>
                  <p>Tìm thấy {displayMatches.length} đoạn vượt ngưỡng và {displayTopicMatches.length} đoạn tương đồng chủ đề trong {result.wordCount} từ kiểm tra.</p>
                  <p>Chế độ: {SENSITIVITY[result.sensitivity].label}; {result.ignoreCommonPhrases ? 'đã bỏ qua cụm CTA/câu mẫu phổ biến' : 'không bỏ qua cụm phổ biến'}.</p>
                  {result.ignoredPhrases.length > 0 && <p>Đoạn/cụm tự bỏ qua: {breakableShortList(result.ignoredPhrases, 3)}</p>}
                  {result.analysis.commonCrawl.enabled && (
                    <div className='space-y-2'>
                      <p>
                        SerpApi: {serpApiStatusLabel(result.analysis.commonCrawl.serpApiStatus)}; {result.analysis.commonCrawl.serpApiQueryCount} query, {result.analysis.commonCrawl.serpApiResultCount} kết quả, {result.analysis.commonCrawl.serpApiUrlCount} URL ứng viên.
                      </p>
                      {result.analysis.commonCrawl.serpApiError && (
                        <p className='text-amber-700'>SerpApi lỗi: {result.analysis.commonCrawl.serpApiError}.</p>
                      )}
                      <p>
                        Common Crawl: {commonCrawlStatusLabel(result.analysis.commonCrawl.status)}; nguồn {sourceModeLabel(result.analysis.commonCrawl.sourceMode)}; đã kiểm {result.analysis.commonCrawl.checkedUrlCount}/{result.analysis.commonCrawl.targetUrlCount} URL{result.analysis.commonCrawl.skippedUrlCount ? `, bỏ qua ${result.analysis.commonCrawl.skippedUrlCount} URL do giới hạn` : ''}, {result.analysis.commonCrawl.cdxHitCount} CDX record{result.analysis.commonCrawl.cdxErrorCount ? `, ${result.analysis.commonCrawl.cdxErrorCount} CDX lỗi` : ''}, {result.analysis.commonCrawl.warcFetchCount} WARC fetch, {result.analysis.commonCrawl.liveFetchCount} live fetch, dùng {result.analysis.commonCrawl.candidateCount}/{result.analysis.commonCrawl.maxSnapshots || result.analysis.commonCrawl.candidateCount} nguồn web; thời gian {durationLabel(result.analysis.commonCrawl.elapsedMs)}/{durationLabel(result.analysis.commonCrawl.budgetMs)}; độ phủ {coverageLabel(result.analysis.commonCrawl.coverageLevel)}{result.analysis.commonCrawl.indexes.length ? `; index ${shortList(result.analysis.commonCrawl.indexes)}` : ''}.
                      </p>
                      <p>Kết luận chỉ dựa trên các URL SerpApi và nguồn web đã nạp, không phải toàn bộ web.</p>
                      {shouldShowCdxError(result.analysis.commonCrawl) && (
                        <p className='text-amber-700'>CDX phản hồi lỗi gần nhất: {result.analysis.commonCrawl.lastCdxError}.</p>
                      )}
                      {result.analysis.commonCrawl.budgetExhausted && (
                        <p className='text-amber-700'>Common Crawl đã dừng do hết ngân sách thời gian; kết quả chỉ phản ánh các URL/snapshot đã kịp kiểm.</p>
                      )}
                      {result.analysis.commonCrawl.coverageLevel !== 'good' && (
                        <p className='text-amber-700'>{coverageWarning(result.analysis.commonCrawl.coverageLevel, result.analysis.commonCrawl.candidateCount)}</p>
                      )}
                      {result.analysis.commonCrawl.serpApiQueryCount > 0 && result.analysis.commonCrawl.searchQueries.length > 0 && (
                        <p>SerpApi query đã chạy: {breakableShortList(result.analysis.commonCrawl.searchQueries.slice(0, Math.max(1, result.analysis.commonCrawl.serpApiQueryCount)), 2)}</p>
                      )}
                      {result.analysis.commonCrawl.discoveredUrls.length > 0 && (
                        <p>URL từ SerpApi: {breakableShortList(result.analysis.commonCrawl.discoveredUrls, 2)}</p>
                      )}
                      {result.analysis.commonCrawl.explicitUrls.length > 0 && (
                        <p>URL nhập trực tiếp: {breakableShortList(result.analysis.commonCrawl.explicitUrls, 2)}</p>
                      )}
                      {result.analysis.commonCrawl.checkedUrls.length > 0 && (
                        <div className='min-w-0 space-y-1 rounded-md border bg-background p-2'>
                          {result.analysis.commonCrawl.checkedUrls.slice(0, 6).map((item, index) => (
                            <div key={`${item.url}-${index}`} className='min-w-0 rounded border border-border/60 bg-muted/20 p-2'>
                              <p className='text-[11px] font-medium text-muted-foreground'>
                                {checkedUrlStatusLabel(item)} · CDX {item.cdxRecords} · WARC {item.warcFetches || (item.warcFetched ? 1 : 0)} · nguồn {item.candidates || (item.mode !== 'none' ? 1 : 0)}
                              </p>
                              <p className='mt-1 break-words font-mono text-[11px] leading-4 text-foreground [overflow-wrap:anywhere]'>{item.url}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
            <div className='mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground'>
              <span className='inline-flex items-center gap-1'><span className='h-2.5 w-2.5 rounded bg-red-200 ring-1 ring-red-300' /> Nghi đạo văn</span>
              <span className='inline-flex items-center gap-1'><span className='h-2.5 w-2.5 rounded bg-amber-200 ring-1 ring-amber-300' /> Tương đồng chủ đề/từ khóa</span>
            </div>
            <div className='max-h-[300px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-7 text-foreground'>{renderHighlightedText(result.checkText, displayMatches, displayTopicMatches, result.ignoredPhrases)}</div>
            {displayMatches.length > 0 ? (
              <div className='mt-4 space-y-3'>
                <h3 className='text-sm font-semibold text-foreground'>Đoạn có khả năng đạo văn</h3>
                {displayMatches.map((match, index) => (
                  <div key={`${match.start}-${match.end}-${index}`} className='rounded-lg border border-red-100 bg-red-50/50 p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <p className='text-sm font-semibold text-red-950'>Đoạn {index + 1}: {basisLabel(match.scoreBasis)}</p>
                        <p className='mt-1 text-xs text-red-800'>{basisDescription(match.scoreBasis)}</p>
                      </div>
                      <Badge className={scoreBadgeClass(match.score)}>{match.score}%</Badge>
                    </div>
                    <p className='mt-3 whitespace-pre-wrap rounded-md bg-background p-3 text-sm text-foreground'>{renderTextWithIgnoredPhrases(match.matchedText, result.ignoredPhrases)}</p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Exact</span><p className='font-semibold text-foreground'>{match.exactMatchScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>N-gram</span><p className='font-semibold text-foreground'>{match.phraseOverlapScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Overlap từ</span><p className='font-semibold text-foreground'>{match.wordOverlapScore}%</p></div>
                    </div>
                    <p className='mt-3 text-xs text-muted-foreground'>Trùng {ratioLabel(match.matchedWords, match.totalWords, 'từ')} và {ratioLabel(match.matchedPhrases, match.totalPhrases, 'cụm')} {match.phraseSize ? `(${match.phraseSize} từ/cụm)` : ''}.</p>
                    <div className='mt-3 rounded-md border bg-background p-3'>
                      <p className='text-xs font-semibold text-muted-foreground'>Nguồn gần nhất: {match.sourceTitle || sourceTypeLabel(match.sourceType)}</p>
                      <p className='mt-1 line-clamp-3 text-sm italic text-muted-foreground'>{renderTextWithIgnoredPhrases(match.sourceText, result.ignoredPhrases)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='mt-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground'>Không có đoạn nào vượt ngưỡng để bôi đỏ.</p>
            )}
            {displayTopicMatches.length > 0 && (
              <div className='mt-4 space-y-3'>
                <h3 className='text-sm font-semibold text-foreground'>Đoạn tương đồng chủ đề/từ khóa</h3>
                {displayTopicMatches.map((match, index) => (
                  <div key={`topic-${match.start}-${match.end}-${index}`} className='rounded-lg border border-amber-100 bg-amber-50/60 p-4'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div>
                        <p className='text-sm font-semibold text-amber-950'>Đoạn {index + 1}: {basisLabel(match.scoreBasis)}</p>
                        <p className='mt-1 text-xs text-amber-800'>Đoạn này có nhiều từ khóa/chủ đề giống nguồn, nhưng chưa đủ exact/n-gram để kết luận đạo văn.</p>
                      </div>
                      <Badge className={scoreBadgeClass(match.score)}>{match.score}%</Badge>
                    </div>
                    <p className='mt-3 whitespace-pre-wrap rounded-md bg-background p-3 text-sm text-foreground'>{renderTextWithIgnoredPhrases(match.matchedText, result.ignoredPhrases)}</p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Exact</span><p className='font-semibold text-foreground'>{match.exactMatchScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>N-gram</span><p className='font-semibold text-foreground'>{match.phraseOverlapScore}%</p></div>
                      <div className='rounded-md border bg-background p-2 text-xs'><span className='text-muted-foreground'>Overlap từ</span><p className='font-semibold text-foreground'>{match.wordOverlapScore}%</p></div>
                    </div>
                    <p className='mt-3 text-xs text-muted-foreground'>Trùng {ratioLabel(match.matchedWords, match.totalWords, 'từ')} và {ratioLabel(match.matchedPhrases, match.totalPhrases, 'cụm')} trong đoạn so khớp.</p>
                    <div className='mt-3 rounded-md border bg-background p-3'>
                      <p className='text-xs font-semibold text-muted-foreground'>Nguồn gần nhất: {match.sourceTitle || sourceTypeLabel(match.sourceType)}</p>
                      <p className='mt-1 line-clamp-3 text-sm italic text-muted-foreground'>{renderTextWithIgnoredPhrases(match.sourceText, result.ignoredPhrases)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        {result && (
          <Card className='p-5'>
            <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><AlertTriangle className='h-4 w-4 text-amber-600' /> Nguồn tương đồng ({displaySources.length})</h2>
            <div className='space-y-3'>
              {displaySources.length === 0 ? (
                <p className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>Không tìm thấy nguồn tương đồng đáng kể.</p>
              ) : displaySources.map((source, index) => {
                const sourceKey = `${source.sourceUrl || source.source || source.sourceTitle || 'source'}-${index}`;
                const expanded = Boolean(expandedSources[sourceKey]);
                const sourceText = source.sourceText || source.snippet;
                const canExpand = sourceText.length > 240;

                return (
                <div key={sourceKey} className='rounded-lg border p-4'>
                  <div className='mb-2 flex items-center justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className='truncate text-sm font-semibold text-foreground'>{source.sourceTitle || source.source}</p>
                      <p className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'><Database className='h-3.5 w-3.5' /> {sourceTypeLabel(source.sourceType)} · {basisLabel(source.scoreBasis)}</p>
                    </div>
                    <Badge className={scoreBadgeClass(source.similarity)}>{source.similarity}%</Badge>
                  </div>
                  <div className='rounded-md border bg-background p-3'>
                    <p className={`whitespace-pre-wrap text-sm text-muted-foreground ${expanded ? 'max-h-[360px] overflow-auto' : 'line-clamp-3 italic'}`}>{renderTextWithIgnoredPhrases(sourceText, result.ignoredPhrases)}</p>
                    {canExpand && (
                      <Button type='button' variant='ghost' size='sm' className='mt-2 h-8 px-2 text-xs' onClick={() => toggleSourceExpanded(sourceKey)}>
                        {expanded ? <ChevronUp className='mr-1 h-3.5 w-3.5' /> : <ChevronDown className='mr-1 h-3.5 w-3.5' />}
                        {expanded ? 'Thu gọn nguồn' : 'Đọc nội dung nguồn'}
                      </Button>
                    )}
                  </div>
                  <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>Exact</span><p className='font-semibold text-foreground'>{source.exactMatchScore}%</p></div>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>N-gram</span><p className='font-semibold text-foreground'>{source.phraseOverlapScore}%</p></div>
                    <div className='rounded-md border bg-muted/20 p-2 text-xs'><span className='text-muted-foreground'>Overlap từ</span><p className='font-semibold text-foreground'>{source.wordOverlapScore}%</p></div>
                  </div>
                  <p className='mt-2 text-xs text-muted-foreground'>Trùng {ratioLabel(source.matchedWords, source.totalWords, 'từ')} và {ratioLabel(source.matchedPhrases, source.totalPhrases, 'cụm')} trong phép so khớp toàn văn.</p>
                </div>
                );
              })}
            </div>
          </Card>
        )}
        <Card className='p-5'>
          <h2 className='mb-4 flex items-center gap-2 font-semibold text-foreground'><Clock className='h-4 w-4 text-primary' /> Lịch sử gần đây</h2>
          <div className='mb-4 grid gap-3 sm:grid-cols-3'><div className='flex items-center gap-2 text-sm'><Search className='h-4 w-4 text-primary' /> {history?.pagination.totalItems || historyItems.length} lượt kiểm tra</div><div className='flex items-center gap-2 text-sm'><Shield className='h-4 w-4 text-primary' /> local-ngram-v1</div><div className='flex items-center gap-2 text-sm'><CheckCircle2 className='h-4 w-4 text-primary' /> ngưỡng 35%</div></div>
          {historyItems.length === 0 ? <p className='text-sm text-muted-foreground'>Chưa có report nào.</p> : <div className='space-y-3'>{historyItems.map((item) => <button key={item.id} type='button' onClick={() => { setResult(item); setExpandedSources({}); }} className='w-full rounded-lg border p-3 text-left hover:border-primary/50'><div className='mb-2 flex items-center justify-between gap-2'><span className='text-sm font-semibold text-foreground'>{item.originalityScore}% độc đáo</span><Badge variant='outline' className={RISK[item.riskLevel].cls}>{RISK[item.riskLevel].label}</Badge></div><p className='line-clamp-2 text-xs text-muted-foreground'>{item.checkText}</p><p className='mt-2 text-[11px] text-muted-foreground'>{dateLabel(item.createdAt)}</p></button>)}</div>}
        </Card>
      </div>
    </Layout>
  );
}
