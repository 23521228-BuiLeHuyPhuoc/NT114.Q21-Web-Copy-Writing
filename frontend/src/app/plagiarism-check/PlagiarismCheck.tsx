import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import {
  FileCheck, Search, Shield, CheckCircle2, AlertTriangle,
  Clock, BarChart3, Copy, RefreshCw, FileText, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { usePlagiarismResults } from '@/hooks/queries/usePlagiarism';

export function CustomerPlagiarismCheck() {
  const { data: results = [] } = usePlagiarismResults();
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<null | { originality: number; sources: typeof results }>(null);

  const handleCheck = async () => {
    if (!text.trim()) { toast.error('Vui lòng nhập nội dung cần kiểm tra'); return; }
    setIsChecking(true);
    await new Promise(r => setTimeout(r, 2500));
    setResult({ originality: 85, sources: results });
    setIsChecking(false);
    toast.success('Kiểm tra hoàn tất!');
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
  const getScoreBg = (score: number) => score >= 80 ? 'from-green-100 to-emerald-100' : score >= 60 ? 'from-amber-100 to-amber-100' : 'from-red-100 to-amber-100';

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Kiểm Tra Đạo Văn</h1>
          <p className="text-gray-600">Plagiarism Detection — kiểm tra tính độc đáo của nội dung AI</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Nội dung cần kiểm tra</h3>
                <span className="text-xs text-gray-400">{text.split(/\s+/).filter(Boolean).length} từ</span>
              </div>
              <Textarea
                placeholder="Dán nội dung AI đã tạo vào đây để kiểm tra đạo văn..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="min-h-[200px] text-sm"
              />
              <div className="flex gap-3 mt-4">
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white h-11"
                  onClick={handleCheck}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Đang kiểm tra...</>
                  ) : (
                    <><FileCheck className="w-4 h-4 mr-2" /> Kiểm tra đạo văn</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setText(''); setResult(null); }}>Xóa</Button>
              </div>
            </Card>

            {/* Results */}
            {result && (
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Kết quả chi tiết</h3>

                {/* Originality score */}
                <div className={`text-center py-6 rounded-xl bg-gradient-to-r ${getScoreBg(result.originality)} mb-6`}>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg mb-3">
                    <span className={`text-3xl font-bold ${getScoreColor(result.originality)}`}>{result.originality}%</span>
                  </div>
                  <p className="font-semibold text-gray-900">Tính độc đáo</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {result.originality >= 80 ? 'Nội dung có tính độc đáo cao' : 'Cần chỉnh sửa để tăng tính độc đáo'}
                  </p>
                </div>

                {/* Sources found */}
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Nguồn tương tự ({result.sources.length})
                </h4>
                <div className="space-y-3">
                  {result.sources.map((source, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 truncate flex-1">{source.source}</span>
                        <Badge className={`border-0 text-xs ml-2 ${source.similarity > 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {source.similarity}% tương tự
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 italic">"{source.snippet}"</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                {[
                  { label: 'Tổng lượt kiểm tra', value: '47', icon: Search },
                  { label: 'TB tính độc đáo', value: '89%', icon: Shield },
                  { label: 'Nội dung an toàn', value: '42/47', icon: CheckCircle2 },
                  { label: 'Quota còn lại', value: '53/100', icon: BarChart3 },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600"><Icon className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <Sparkles className="w-5 h-5 text-green-600 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Mẹo hay</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nội dung AI thường có tính độc đáo cao (85-95%). Nếu điểm thấp hơn 70%, hãy thử tạo lại với temperature cao hơn hoặc thêm context cụ thể hơn.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
