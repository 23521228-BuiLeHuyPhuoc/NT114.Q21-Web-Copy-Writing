import { useEffect, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
  Search, Copy, Trash2, Eye, Download, Filter,
  Calendar, Sparkles, Clock, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { INDUSTRY_MAP, TYPE_MAP, MODEL_MAP } from '@/mocks/history';
import { useHistory } from '@/hooks/queries/useHistory';

export function CustomerHistory() {
  const { data: historyData } = useHistory();
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [selectedItem, setSelectedItem] = useState<NonNullable<typeof historyData>[0] | null>(null);
  const [history, setHistory] = useState<NonNullable<typeof historyData>>([] as any);
  useEffect(() => { if (historyData) setHistory(historyData); }, [historyData]);

  const filtered = history.filter(h => {
    const matchSearch = h.title.toLowerCase().includes(search.toLowerCase()) || h.content.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = filterIndustry === 'all' || h.industry === filterIndustry;
    const matchType = filterType === 'all' || h.type === filterType;
    const matchModel = filterModel === 'all' || h.model === filterModel;
    return matchSearch && matchIndustry && matchType && matchModel;
  });

  const handleDelete = (id: number) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    toast.success('Đã xóa!');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Đã sao chép!');
  };

  const qualityColor = (q: number) =>
    q >= 90 ? 'text-primary bg-primary/5' : q >= 80 ? 'text-primary bg-primary/5' : 'text-amber-600 bg-warning/10';

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Lịch Sử Copy</h1>
          <p className="text-foreground/70">Tất cả nội dung bạn đã tạo với AI — tìm kiếm, lọc và tái sử dụng dễ dàng</p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng copy', value: history.length, icon: Sparkles, color: 'text-primary bg-primary/5' },
            { label: 'Tuần này', value: 8, icon: Calendar, color: 'text-primary bg-primary/5' },
            { label: 'Tổng từ', value: history.reduce((a, h) => a + h.words, 0), icon: Clock, color: 'text-primary bg-primary/5' },
            { label: 'Chất lượng TB', value: Math.round(history.reduce((a, h) => a + h.quality, 0) / history.length) + '%', icon: Filter, color: 'text-amber-600 bg-warning/10' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Ngành nghề" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {Object.entries(INDUSTRY_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Loại copy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(TYPE_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Model AI" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả model</SelectItem>
                {Object.entries(MODEL_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/80">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy kết quả phù hợp</p>
            </div>
          )}
          {filtered.map(item => {
            const ind = INDUSTRY_MAP[item.industry];
            const IndIcon = ind?.Icon ?? Sparkles;
            const model = MODEL_MAP[item.model];
            return (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={`${ind?.color} border-0 text-xs`}><IndIcon className="w-3 h-3 mr-1" />{ind?.label}</Badge>
                      <Badge className="bg-muted text-foreground/70 border-0 text-xs">{TYPE_MAP[item.type]}</Badge>
                      <Badge className={`${model?.color} border-0 text-xs`}>{model?.label}</Badge>
                      <Badge className={`${qualityColor(item.quality)} border-0 text-xs`}>⭐ {item.quality}%</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/80">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{item.createdAt}</span>
                      <span>{item.words} từ</span>
                      <span>Tone: {item.tone}</span>
                      <span>{item.platform}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('Đã tải xuống!')}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('Đã dùng lại!')}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${INDUSTRY_MAP[selectedItem.industry]?.color} border-0`}>{INDUSTRY_MAP[selectedItem.industry]?.label}</Badge>
                  <Badge className="bg-muted text-foreground/70 border-0">{TYPE_MAP[selectedItem.type]}</Badge>
                  <Badge className={`${MODEL_MAP[selectedItem.model]?.color} border-0`}>{MODEL_MAP[selectedItem.model]?.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.quality}%</p>
                    <p className="text-xs text-muted-foreground">Chất lượng</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.words}</p>
                    <p className="text-xs text-muted-foreground">Số từ</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.tone}</p>
                    <p className="text-xs text-muted-foreground">Tone giọng</p>
                  </div>
                </div>
                <div className="bg-surface-muted rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground border">{selectedItem.content}</div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary hover:bg-green-700 text-white" onClick={() => { handleCopy(selectedItem.content); setSelectedItem(null); }}>
                    <Copy className="w-4 h-4 mr-2" /> Sao chép nội dung
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>Đóng</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
