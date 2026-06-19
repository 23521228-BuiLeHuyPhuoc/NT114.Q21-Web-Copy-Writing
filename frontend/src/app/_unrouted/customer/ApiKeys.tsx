import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import {
  Key, Copy, Eye, EyeOff, Trash2, Plus,
  Code, Activity, Terminal, Shield, AlertCircle,
  Clock, Zap, Globe, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

import { CODE_SAMPLES } from '@/lib/apiCodeSamples';
import {
  useApiKeyLogs,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from '@/hooks/queries/useApiKeys';


export function CustomerApiKeys() {
  const { data: keys = [] } = useApiKeys();
  const { data: logs = [] } = useApiKeyLogs();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyDialog, setNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(['generate']);
  const [codeTab, setCodeTab] = useState('python');

  const toggleShow = (id: string) => setShowKey(prev => ({ ...prev, [id]: !prev[id] }));

  const maskKey = (key: string) => key.slice(0, 12) + '•'.repeat(20) + key.slice(-4);

  const handleCreate = async () => {
    if (!newKeyName) { toast.error('Nhập tên key'); return; }
    try {
      const created = await createApiKey.mutateAsync({ name: newKeyName.trim(), permissions: newKeyPermissions });
      setShowKey(prev => ({ ...prev, [created.id]: true }));
      setNewKeyDialog(false);
      setNewKeyName('');
      toast.success('API key đã được tạo. Hãy sao chép key vì lần sau hệ thống chỉ hiển thị dạng che.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được API key');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiKey.mutateAsync(id);
      toast.success('Đã thu hồi API key');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thu hồi được API key');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">API Keys & Tích Hợp</h1>
          <p className="text-foreground/70">Quản lý API keys và tích hợp CopyPro vào ứng dụng của bạn</p>
        </div>

        <Tabs defaultValue="keys">
          <TabsList className="mb-6">
            <TabsTrigger value="keys"><Key className="w-4 h-4 mr-2" />API Keys</TabsTrigger>
            <TabsTrigger value="docs"><Code className="w-4 h-4 mr-2" />Tài Liệu</TabsTrigger>
            <TabsTrigger value="logs"><Activity className="w-4 h-4 mr-2" />Nhật Ký</TabsTrigger>
          </TabsList>

          {/* API Keys Tab */}
          <TabsContent value="keys" className="space-y-4">
            {/* Info banner */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-primary text-sm">Bảo mật API Key</p>
                  <p className="text-primary text-xs mt-0.5">Không chia sẻ API key công khai. Sử dụng biến môi trường (environment variables) trong production.</p>
                </div>
              </div>
            </Card>

            {/* Keys list */}
            {keys.map(k => (
              <Card key={k.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">{k.name}</span>
                      <Badge className={k.status === 'active' ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-foreground/70 border-0'}>
                        {k.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-muted rounded-lg p-2 border font-mono text-sm">
                      <span className="flex-1 truncate text-foreground/80">{showKey[k.id] ? k.key : maskKey(k.key)}</span>
                      <button onClick={() => toggleShow(k.id)} className="text-muted-foreground/80 hover:text-foreground/70">
                        {showKey[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success('Đã sao chép!'); }} className="text-muted-foreground/80 hover:text-foreground/70">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span><Calendar className="w-3 h-3 inline" /> Tạo: {k.created}</span>
                      <span><Clock className="w-3 h-3 inline" /> Dùng lần cuối: {k.lastUsed}</span>
                      <span><Zap className="w-3 h-3 inline" /> {k.calls.toLocaleString()} calls</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {k.permissions.map(p => <Badge key={p} className="bg-primary/10 text-primary border-0 text-xs">{p}</Badge>)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 flex-shrink-0" disabled={revokeApiKey.isPending || k.status === 'revoked'} onClick={() => void handleRevoke(k.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Thu hồi
                  </Button>
                </div>
              </Card>
            ))}

            <Button onClick={() => setNewKeyDialog(true)} className="bg-primary hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Tạo API Key mới
            </Button>

            {/* Endpoints quick ref */}
            <Card className="p-5 mt-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Base URL & Endpoints</h3>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2">
                <p className="text-primary"># Base URL</p>
                <p className="text-white">https://api.copypro.vn/v1</p>
                <p className="text-primary mt-3"># Endpoints</p>
                {[
                  ['POST', '/generate', 'Tạo copy với AI'],
                  ['GET', '/templates', 'Danh sách template'],
                  ['GET', '/history', 'Lịch sử copy'],
                  ['POST', '/fine-tune/apply', 'Áp dụng model fine-tuned'],
                  ['GET', '/models', 'Danh sách model'],
                ].map(([method, ep, desc]) => (
                  <p key={ep} className="text-muted-foreground/60">
                    <span className={method === 'POST' ? 'text-amber-400' : 'text-primary'}>{method}</span>{' '}
                    <span className="text-white">{ep}</span>{' '}
                    <span className="text-muted-foreground"># {desc}</span>
                  </p>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Docs Tab */}
          <TabsContent value="docs" className="space-y-4">
            <Card className="p-4 flex gap-3 bg-primary/5 border-primary/20">
              <Terminal className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm text-primary">RESTful API với Authentication qua Bearer Token. Rate limit: 100 requests/phút (Pro), 1000 requests/phút (Business).</p>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Code mẫu</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                {Object.keys(CODE_SAMPLES).map(lang => (
                  <Button key={lang} size="sm" variant={codeTab === lang ? 'default' : 'outline'} onClick={() => setCodeTab(lang)}
                    className={codeTab === lang ? 'bg-primary text-white' : ''}>
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="bg-gray-950 rounded-xl p-4 overflow-x-auto">
                <pre className="text-primary text-xs font-mono whitespace-pre">{CODE_SAMPLES[codeTab]}</pre>
              </div>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(CODE_SAMPLES[codeTab]); toast.success('Đã sao chép!'); }}>
                <Copy className="w-4 h-4 mr-1" /> Sao chép code
              </Button>
            </Card>

            {/* Response schema */}
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Response Schema</h3>
              <div className="bg-gray-950 rounded-xl p-4">
                <pre className="text-primary text-xs font-mono whitespace-pre">{`{
  "id": "copy_abc123",          // Unique copy ID
  "variations": [               // Array of generated variations
    "Variation 1 content...",
    "Variation 2 content...",
    "Variation 3 content..."
  ],
  "metadata": {
    "industry": "ecommerce",    // Industry used
    "type": "headline",         // Copy type
    "tone": "urgent",           // Tone applied
    "language": "vi"            // Language
  },
  "tokens_used": 450,           // OpenAI tokens consumed
  "model": "gpt-4o",           // Model used
  "quality_score": 92,          // AI quality assessment (0-100)
  "created_at": "2026-03-23T14:30:22Z"
}`}</pre>
              </div>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card className="overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Nhật ký API (24h gần nhất)</h3>
                <Badge className="bg-primary/10 text-primary border-0">99.8% uptime</Badge>
              </div>
              <div className="divide-y">
                {logs.map(log => (
                  <div key={log.id} className="flex flex-wrap items-center gap-3 p-3 hover:bg-surface-muted text-sm">
                    <Badge className={`border-0 text-xs w-12 justify-center ${log.status === 200 ? 'bg-primary/10 text-primary' : log.status === 429 ? 'bg-warning/15 text-amber-800' : 'bg-destructive/10 text-destructive'}`}>
                      {log.status}
                    </Badge>
                    <span className="font-mono text-foreground/80 text-xs flex-1 min-w-40">{log.endpoint}</span>
                    <span className="text-muted-foreground text-xs">{log.model !== '-' && `Model: ${log.model}`}</span>
                    <span className="text-muted-foreground text-xs">{log.tokens > 0 && `${log.tokens} tokens`}</span>
                    <span className={`text-xs font-medium ${parseFloat(log.latency) > 2 ? 'text-amber-600' : 'text-primary'}`}>{log.latency}</span>
                    <span className="text-muted-foreground/80 text-xs">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              <span>Status 429 = Rate limit exceeded · Logs được lưu 30 ngày</span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={newKeyDialog} onOpenChange={setNewKeyDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tạo API Key mới</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên key</Label>
              <Input placeholder="VD: Mobile App Key" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="mt-2" />
            </div>
            <div>
              <Label>Quyền truy cập</Label>
              <div className="mt-2 space-y-2">
                {[['generate', 'Tạo copy (POST /generate)'], ['templates', 'Xem templates (GET /templates)'], ['history', 'Xem lịch sử (GET /history)'], ['fine-tune', 'Fine-tuning (POST /fine-tune/*)']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newKeyPermissions.includes(val)}
                      onChange={e => setNewKeyPermissions(prev => e.target.checked ? [...prev, val] : prev.filter(p => p !== val))}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm text-foreground/80">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setNewKeyDialog(false)} className="flex-1">Hủy</Button>
              <Button onClick={() => void handleCreate()} disabled={createApiKey.isPending} className="flex-1 bg-primary hover:bg-green-700 text-white">Tạo key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
