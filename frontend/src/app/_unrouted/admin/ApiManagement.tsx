import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Globe, Activity, Zap, Shield, Settings, AlertCircle,
  CheckCircle2, Clock, TrendingUp, Search, Filter,
  Copy, RefreshCw, BarChart3, Users, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, LineChart } from '@/app/components/charts';

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/generate', desc: 'Tạo copy với AI', rateLimit: '100/min', avgLatency: '1.8s', calls24h: 3420, errors: 12, status: 'healthy' },
  { method: 'GET',  path: '/api/v1/templates', desc: 'Lấy danh sách templates', rateLimit: '200/min', avgLatency: '0.3s', calls24h: 1250, errors: 2, status: 'healthy' },
  { method: 'GET',  path: '/api/v1/history', desc: 'Lịch sử copy của user', rateLimit: '100/min', avgLatency: '0.5s', calls24h: 890, errors: 5, status: 'healthy' },
  { method: 'POST', path: '/api/v1/fine-tune/apply', desc: 'Áp dụng fine-tuned model', rateLimit: '50/min', avgLatency: '2.1s', calls24h: 340, errors: 8, status: 'healthy' },
  { method: 'POST', path: '/api/v1/fine-tune/start', desc: 'Bắt đầu training fine-tune', rateLimit: '5/hour', avgLatency: '5.2s', calls24h: 12, errors: 1, status: 'healthy' },
  { method: 'GET',  path: '/api/v1/models', desc: 'Danh sách model khả dụng', rateLimit: '200/min', avgLatency: '0.2s', calls24h: 560, errors: 0, status: 'healthy' },
  { method: 'POST', path: '/api/v1/auth/login', desc: 'Xác thực người dùng', rateLimit: '20/min', avgLatency: '0.8s', calls24h: 220, errors: 45, status: 'warning' },
];

const API_LOGS = [
  { id: 'req-001', user: 'Nguyễn Văn A', key: 'cpk_live_***XyZ', endpoint: 'POST /api/v1/generate', model: 'gpt-4o', status: 200, latency: '1.2s', tokens: 450, time: '23/03 14:30:22', ip: '116.96.x.x' },
  { id: 'req-002', user: 'Trần Thị B', key: 'cpk_live_***AbC', endpoint: 'GET /api/v1/templates', model: '-', status: 200, latency: '0.3s', tokens: 0, time: '23/03 14:29:11', ip: '42.118.x.x' },
  { id: 'req-003', user: 'Lê Văn C', key: 'cpk_live_***DeF', endpoint: 'POST /api/v1/generate', model: 'llama-3.1-70b', status: 200, latency: '3.1s', tokens: 520, time: '23/03 14:28:05', ip: '113.23.x.x' },
  { id: 'req-004', user: 'Unknown', key: 'invalid', endpoint: 'POST /api/v1/generate', model: '-', status: 401, latency: '-', tokens: 0, time: '23/03 14:27:50', ip: '185.x.x.x' },
  { id: 'req-005', user: 'Nguyễn Văn A', key: 'cpk_live_***XyZ', endpoint: 'POST /api/v1/generate', model: 'gpt-4o', status: 429, latency: '-', tokens: 0, time: '23/03 14:25:33', ip: '116.96.x.x' },
  { id: 'req-006', user: 'Phạm Thị D', key: 'cpk_live_***GhI', endpoint: 'POST /api/v1/fine-tune/apply', model: 'finetuned-v1', status: 200, latency: '1.8s', tokens: 380, time: '23/03 13:00:00', ip: '123.45.x.x' },
];

const TRAFFIC_DATA = [
  { time: '00:00', requests: 45, errors: 2 },
  { time: '03:00', requests: 28, errors: 1 },
  { time: '06:00', requests: 67, errors: 3 },
  { time: '09:00', requests: 320, errors: 8 },
  { time: '12:00', requests: 480, errors: 12 },
  { time: '15:00', requests: 410, errors: 10 },
  { time: '18:00', requests: 390, errors: 9 },
  { time: '21:00', requests: 280, errors: 6 },
];

const LATENCY_DATA = [
  { time: '00:00', p50: 0.8, p95: 2.1, p99: 4.5 },
  { time: '06:00', p50: 0.9, p95: 2.3, p99: 4.8 },
  { time: '09:00', p50: 1.2, p95: 2.8, p99: 5.2 },
  { time: '12:00', p50: 1.8, p95: 3.5, p99: 6.1 },
  { time: '15:00', p50: 1.6, p95: 3.2, p99: 5.8 },
  { time: '18:00', p50: 1.4, p95: 3.0, p99: 5.5 },
  { time: '21:00', p50: 1.1, p95: 2.6, p99: 5.0 },
];

const ACTIVE_KEYS = [
  { key: 'cpk_live_***XyZ', user: 'Nguyễn Văn A', plan: 'Pro', calls: 1247, limit: 5000, status: 'active', lastUsed: '23/03 14:30' },
  { key: 'cpk_live_***AbC', user: 'Trần Thị B', plan: 'Pro', calls: 890, limit: 5000, status: 'active', lastUsed: '23/03 14:29' },
  { key: 'cpk_live_***DeF', user: 'Lê Văn C', plan: 'Business', calls: 12450, limit: 50000, status: 'active', lastUsed: '23/03 14:28' },
  { key: 'cpk_test_***GhI', user: 'Phạm Thị D', plan: 'Pro', calls: 340, limit: 5000, status: 'active', lastUsed: '23/03 13:00' },
  { key: 'cpk_live_***JkL', user: 'Hoàng Văn E', plan: 'Free', calls: 28, limit: 100, status: 'suspended', lastUsed: '22/03 09:00' },
];

export function AdminApiManagement() {
  const [logFilter, setLogFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredLogs = API_LOGS.filter(l => {
    const matchFilter = logFilter === 'all' ||
      (logFilter === 'error' && l.status >= 400) ||
      (logFilter === 'success' && l.status < 400) ||
      (logFilter === 'ratelimit' && l.status === 429);
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.endpoint.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusBadge = (code: number) => {
    if (code < 300) return 'bg-primary/10 text-primary';
    if (code < 400) return 'bg-primary/10 text-primary';
    if (code === 401) return 'bg-destructive/10 text-destructive';
    if (code === 429) return 'bg-warning/15 text-amber-800';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Quản Lý RESTful API</h1>
          <p className="text-foreground/70">Monitor traffic, logs, rate limiting và quản lý API keys toàn hệ thống</p>
        </div>

        {/* Real-time stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Requests/24h', value: '6,692', icon: Activity, color: 'bg-primary/10 text-primary', change: '+12%' },
            { label: 'Avg latency', value: '1.4s', icon: Clock, color: 'bg-primary/10 text-primary', change: '-5%' },
            { label: 'Error rate', value: '1.1%', icon: AlertCircle, color: 'bg-warning/10 text-amber-800', change: '+0.2%' },
            { label: 'Uptime', value: '99.8%', icon: CheckCircle2, color: 'bg-primary/10 text-primary', change: 'Ổn định' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                  <span className="text-xs text-muted-foreground">{s.change}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="endpoints"><Globe className="w-4 h-4 mr-2" />Endpoints</TabsTrigger>
            <TabsTrigger value="logs"><Activity className="w-4 h-4 mr-2" />Request Logs</TabsTrigger>
            <TabsTrigger value="keys"><Key className="w-4 h-4 mr-2" />API Keys</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Traffic 24h</h3>
                <AreaChart
                  data={TRAFFIC_DATA}
                  xKey="time"
                  height={240}
                  series={[
                    { key: 'requests', label: 'Requests', color: '#16723a', fill: true },
                    { key: 'errors', label: 'Errors', color: '#c92a2a', fill: false, dashed: true },
                  ]}
                />
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-foreground mb-4">Latency Percentiles</h3>
                <LineChart
                  data={LATENCY_DATA}
                  xKey="time"
                  height={240}
                  series={[
                    { key: 'p50', label: 'P50', color: '#16723a' },
                    { key: 'p95', label: 'P95', color: '#d88a0b' },
                    { key: 'p99', label: 'P99', color: '#c92a2a' },
                  ]}
                />
              </Card>
            </div>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints">
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-foreground">Tất cả Endpoints ({ENDPOINTS.length})</h3>
              </div>
              <div className="divide-y overflow-x-auto">
                {ENDPOINTS.map(ep => (
                  <div key={ep.path} className="flex items-center gap-4 p-4 hover:bg-surface-muted min-w-max">
                    <Badge className={`border-0 text-xs w-14 justify-center font-mono ${ep.method === 'POST' ? 'bg-warning/15 text-amber-800' : 'bg-primary/10 text-primary'}`}>{ep.method}</Badge>
                    <span className="font-mono text-sm text-foreground min-w-56">{ep.path}</span>
                    <span className="text-xs text-muted-foreground min-w-48 hidden md:block">{ep.desc}</span>
                    <div className="flex gap-4 text-xs text-foreground/70 ml-auto">
                      <span><Zap className="w-3 h-3 inline" /> {ep.avgLatency}</span>
                      <span><Activity className="w-3 h-3 inline" /> {ep.calls24h.toLocaleString()} calls</span>
                      <span className="text-red-500">{ep.errors} errors</span>
                      <span className="text-muted-foreground/80">Limit: {ep.rateLimit}</span>
                    </div>
                    <Badge className={ep.status === 'healthy' ? 'bg-primary/10 text-primary border-0 text-xs' : 'bg-warning/15 text-amber-800 border-0 text-xs'}>
                      {ep.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Logs */}
          <TabsContent value="logs">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <Input placeholder="Tìm user, endpoint..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={logFilter} onValueChange={setLogFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="success">Thành công (2xx)</SelectItem>
                  <SelectItem value="error">Lỗi (4xx, 5xx)</SelectItem>
                  <SelectItem value="ratelimit">Rate Limited (429)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => toast.success('Đã làm mới logs!')}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="divide-y overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 p-3 bg-surface-muted text-xs font-semibold text-foreground/70 min-w-max">
                  <span>Status</span><span>Endpoint</span><span>User</span><span>Model</span>
                  <span>Tokens</span><span>Latency</span><span>IP</span><span>Time</span>
                </div>
                {filteredLogs.map(log => (
                  <div key={log.id} className="grid grid-cols-8 gap-2 p-3 hover:bg-surface-muted text-xs min-w-max items-center">
                    <Badge className={`${statusBadge(log.status)} border-0 text-xs w-10 justify-center`}>{log.status}</Badge>
                    <span className="font-mono text-foreground/80 truncate">{log.endpoint.replace('/api/v1', '')}</span>
                    <span className="text-foreground/80">{log.user}</span>
                    <span className="text-muted-foreground">{log.model !== '-' ? log.model : '-'}</span>
                    <span className="text-muted-foreground">{log.tokens || '-'}</span>
                    <span className={log.latency !== '-' && parseFloat(log.latency) > 3 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>{log.latency}</span>
                    <span className="text-muted-foreground/80">{log.ip}</span>
                    <span className="text-muted-foreground/80">{log.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="keys">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tất cả API Keys ({ACTIVE_KEYS.length})</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-1" /> Lọc</Button>
              </div>
            </div>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {ACTIVE_KEYS.map(k => (
                  <div key={k.key} className="flex flex-wrap items-center gap-3 p-4 hover:bg-surface-muted">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-foreground/80">{k.key}</span>
                        <Badge className={k.status === 'active' ? 'bg-primary/10 text-primary border-0' : 'bg-destructive/10 text-destructive border-0'}>
                          {k.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-0">{k.plan}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground"><Users className="w-3 h-3 inline mr-1" />{k.user} · {k.calls.toLocaleString()}/{k.limit.toLocaleString()} calls · Dùng lần cuối: {k.lastUsed}</p>
                    </div>
                    <div className="flex gap-2">
                      {k.status === 'active' ? (
                        <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => toast.success('Đã tạm khóa key!')}>Khóa</Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-primary" onClick={() => toast.success('Đã mở khóa key!')}>Mở khóa</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(k.key); toast.success('Đã sao chép!'); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
