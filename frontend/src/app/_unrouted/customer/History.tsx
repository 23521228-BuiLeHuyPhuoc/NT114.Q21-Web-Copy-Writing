import { useMemo, useState } from 'react';
import { useNavigate } from '@/lib/next-router-compat';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
  Calendar,
  Clock,
  Copy,
  Download,
  Eye,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useHistory } from '@/hooks/queries/useHistory';
import { useDeleteContent } from '@/hooks/queries/useContents';
import { INDUSTRY_MAP, TYPE_MAP, getIndustryKey, getIndustryLabel } from '@/lib/historyUi';
import { matchesSearchRegex } from '@/lib/searchRegex';
import type { UiContent } from '@/services/contentService';

function qualityColor(score: number) {
  if (score >= 80) return 'text-primary bg-primary/5';
  return 'text-amber-600 bg-warning/10';
}

function startOfWeek() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

export function CustomerHistory() {
  const navigate = useNavigate();
  const { data: historyData = [], refetch } = useHistory();
  const deleteContent = useDeleteContent();
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [selectedItem, setSelectedItem] = useState<UiContent | null>(null);

  const history = historyData;
  const weekStart = useMemo(() => startOfWeek(), []);

  const industryOptions = useMemo(() => {
    const options = new Map<string, string>();
    history.forEach((item) => {
      const key = getIndustryKey(item.tags, item.industry);
      options.set(key, getIndustryLabel(key, item.industry));
    });
    return Array.from(options, ([id, label]) => ({ id, label }));
  }, [history]);

  const typeOptions = useMemo(() => Array.from(new Set(history.map(item => item.type).filter(Boolean))), [history]);
  const modelOptions = useMemo(() => Array.from(new Set(history.map(item => item.model).filter(Boolean))), [history]);

  const filtered = history.filter((item) => {
    const industryKey = getIndustryKey(item.tags, item.industry);
    const matchSearch = matchesSearchRegex(search, [item.title, item.content, item.prompt, item.type, item.model]);
    const matchIndustry = filterIndustry === 'all' || industryKey === filterIndustry;
    const matchType = filterType === 'all' || item.type === filterType;
    const matchModel = filterModel === 'all' || item.model === filterModel;
    return matchSearch && matchIndustry && matchType && matchModel;
  });

  const totalWords = history.reduce((total, item) => total + item.words, 0);
  const createdThisWeek = history.filter(item => item.createdAtRaw && new Date(item.createdAtRaw) >= weekStart).length;
  const averageQuality = history.length ? Math.round(history.reduce((total, item) => total + item.quality, 0) / history.length) : 0;

  const handleDelete = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id);
      await refetch();
      toast.success('Da chuyen noi dung vao thung rac');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Khong xoa duoc noi dung');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Da sao chep');
  };

  const handleDownload = (item: UiContent) => {
    const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${item.title || 'copy'}.txt`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Lich su copy</h1>
          <p className="text-foreground/70">Tat ca noi dung da tao trong tai khoan cua ban.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tong copy', value: history.length, icon: Sparkles, color: 'text-primary bg-primary/5' },
            { label: 'Tuan nay', value: createdThisWeek, icon: Calendar, color: 'text-primary bg-primary/5' },
            { label: 'Tong tu', value: totalWords, icon: Clock, color: 'text-primary bg-primary/5' },
            { label: 'Chat luong TB', value: `${averageQuality}%`, icon: Filter, color: 'text-amber-600 bg-warning/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input placeholder="Tim kiem..." value={search} onChange={event => setSearch(event.target.value)} className="pl-9" />
            </div>
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Nganh" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca nganh</SelectItem>
                {industryOptions.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Loai copy" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca loai</SelectItem>
                {typeOptions.map(item => <SelectItem key={item} value={item}>{TYPE_MAP[item] || item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterModel} onValueChange={setFilterModel}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Model AI" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tat ca model</SelectItem>
                {modelOptions.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/80">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Khong tim thay noi dung phu hop</p>
            </div>
          )}

          {filtered.map((item) => {
            const industryKey = getIndustryKey(item.tags, item.industry);
            const industry = INDUSTRY_MAP[industryKey];
            const IndustryIcon = industry?.Icon ?? Sparkles;

            return (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={`${industry?.color || 'bg-muted text-foreground/70'} border-0 text-xs`}>
                        <IndustryIcon className="w-3 h-3 mr-1" />{getIndustryLabel(industryKey, item.industry)}
                      </Badge>
                      <Badge className="bg-muted text-foreground/70 border-0 text-xs">{TYPE_MAP[item.type] || item.type}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{item.model}</Badge>
                      <Badge className={`${qualityColor(item.quality)} border-0 text-xs`}>{item.quality}%</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground/80">
                      <span><Calendar className="w-3 h-3 inline mr-1" />{item.createdAt}</span>
                      <span>{item.words} tu</span>
                      <span>Tone: {item.tone || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(item.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/generate')}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" disabled={deleteContent.isPending} onClick={() => void handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedItem?.title}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${INDUSTRY_MAP[getIndustryKey(selectedItem.tags, selectedItem.industry)]?.color || 'bg-muted text-foreground/70'} border-0`}>
                    {getIndustryLabel(getIndustryKey(selectedItem.tags, selectedItem.industry), selectedItem.industry)}
                  </Badge>
                  <Badge className="bg-muted text-foreground/70 border-0">{TYPE_MAP[selectedItem.type] || selectedItem.type}</Badge>
                  <Badge className="bg-primary/10 text-primary border-0">{selectedItem.model}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.quality}%</p>
                    <p className="text-xs text-muted-foreground">Chat luong</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.words}</p>
                    <p className="text-xs text-muted-foreground">So tu</p>
                  </div>
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="font-bold text-primary">{selectedItem.tone || '-'}</p>
                    <p className="text-xs text-muted-foreground">Tone</p>
                  </div>
                </div>
                <div className="bg-surface-muted rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground border">{selectedItem.content}</div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-primary hover:bg-green-700 text-white" onClick={() => { handleCopy(selectedItem.content); setSelectedItem(null); }}>
                    <Copy className="w-4 h-4 mr-2" /> Sao chep noi dung
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>Dong</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
