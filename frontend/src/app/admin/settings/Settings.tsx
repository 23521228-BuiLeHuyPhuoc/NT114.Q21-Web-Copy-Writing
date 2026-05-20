import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Slider } from '@/app/components/ui/slider';
import {
  Settings, Key, Bell, Shield, Globe, Cpu,
  Mail, Save, RefreshCw, AlertCircle, CheckCircle2,
  Database, Clock, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminSettings() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    siteName: 'CopyPro',
    siteUrl: 'https://copypro.vn',
    supportEmail: 'support@copypro.vn',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerification: true,
    defaultModel: 'gpt-4o',
    defaultLanguage: 'vi',
    maxCopyLength: 2000,
    rateLimitFree: 30,
    rateLimitPro: 500,
    rateLimitBusiness: 10000,
    openaiKey: 'sk-proj-aBcDeFgH1234567890XyZaBcDeFgH',
    openaiOrg: 'org-aBcDeFgH',
    llamaEndpoint: 'http://localhost:11434/api',
    llamaModel: 'llama3.1:70b',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'no-reply@copypro.vn',
    smtpPass: '••••••••••••',
    logLevel: 'info',
    logRetention: 30,
    backupEnabled: true,
    backupFrequency: 'daily',
    temperature: [0.7],
    maxTokensPerRequest: [2000],
  });

  const toggle = (key: string) => setShowKeys(p => ({...p, [key]: !p[key]}));
  const update = (key: string, val: any) => setSettings(p => ({...p, [key]: val}));
  const save = () => toast.success('Đã lưu cài đặt thành công!');

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Cài Đặt Hệ Thống</h1>
          <p className="text-gray-600">Quản lý cấu hình toàn bộ platform CopyPro</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="general"><Settings className="w-4 h-4 mr-1" />Chung</TabsTrigger>
            <TabsTrigger value="ai"><Cpu className="w-4 h-4 mr-1" />AI Models</TabsTrigger>
            <TabsTrigger value="email"><Mail className="w-4 h-4 mr-1" />Email</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-1" />Bảo mật</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" />Thông báo</TabsTrigger>
            <TabsTrigger value="system"><Database className="w-4 h-4 mr-1" />Hệ thống</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Tên website</Label><Input value={settings.siteName} onChange={e => update('siteName', e.target.value)} className="mt-2" /></div>
                <div><Label>URL website</Label><Input value={settings.siteUrl} onChange={e => update('siteUrl', e.target.value)} className="mt-2" /></div>
                <div><Label>Email hỗ trợ</Label><Input value={settings.supportEmail} onChange={e => update('supportEmail', e.target.value)} className="mt-2" /></div>
                <div>
                  <Label>Ngôn ngữ mặc định</Label>
                  <Select value={settings.defaultLanguage} onValueChange={v => update('defaultLanguage', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Chế độ hoạt động</h3>
              {[
                { key: 'maintenanceMode', label: 'Chế độ bảo trì', desc: 'Hiển thị trang bảo trì cho người dùng. Admin vẫn truy cập được.', danger: true },
                { key: 'registrationEnabled', label: 'Cho phép đăng ký mới', desc: 'Tắt để ngừng nhận người dùng mới.' },
                { key: 'emailVerification', label: 'Xác thực email bắt buộc', desc: 'Yêu cầu xác thực email khi đăng ký.' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className={`font-medium text-sm ${s.danger ? 'text-red-700' : 'text-gray-900'}`}>{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Switch checked={(settings as any)[s.key]} onCheckedChange={v => update(s.key, v)} />
                </div>
              ))}
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Quota & Rate Limiting</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Gói Free (copy/tháng): {settings.rateLimitFree}</Label>
                  <Slider value={[settings.rateLimitFree]} onValueChange={v => update('rateLimitFree', v[0])} min={10} max={100} step={5} className="mt-2" />
                </div>
                <div>
                  <Label className="text-sm">Gói Pro (copy/tháng): {settings.rateLimitPro}</Label>
                  <Slider value={[settings.rateLimitPro]} onValueChange={v => update('rateLimitPro', v[0])} min={100} max={2000} step={100} className="mt-2" />
                </div>
                <div>
                  <Label className="text-sm">Gói Business: {settings.rateLimitBusiness.toLocaleString()}</Label>
                  <Slider value={[settings.rateLimitBusiness]} onValueChange={v => update('rateLimitBusiness', v[0])} min={1000} max={100000} step={1000} className="mt-2" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* AI Models */}
          <TabsContent value="ai" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">OpenAI Configuration</h3>
              <div>
                <Label>OpenAI API Key</Label>
                <div className="relative mt-2">
                  <Input type={showKeys['openai'] ? 'text' : 'password'} value={settings.openaiKey} onChange={e => update('openaiKey', e.target.value)} className="pr-10" />
                  <button onClick={() => toggle('openai')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Organization ID</Label>
                <Input value={settings.openaiOrg} onChange={e => update('openaiOrg', e.target.value)} className="mt-2" />
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Kết nối OpenAI thành công! ✓')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Kiểm tra kết nối
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Llama (Self-hosted)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>API Endpoint</Label>
                  <Input value={settings.llamaEndpoint} onChange={e => update('llamaEndpoint', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Model name</Label>
                  <Input value={settings.llamaModel} onChange={e => update('llamaModel', e.target.value)} className="mt-2" />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Ollama server đang hoạt động! ✓')}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Kiểm tra kết nối
              </Button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Tham số mặc định</h3>
              <div>
                <Label>Model mặc định</Label>
                <Select value={settings.defaultModel} onValueChange={v => update('defaultModel', v)}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Temperature mặc định: {settings.temperature[0]}</Label>
                <Slider value={settings.temperature} onValueChange={v => update('temperature', v)} min={0} max={1} step={0.1} className="mt-2" />
              </div>
              <div>
                <Label>Max tokens/request: {settings.maxTokensPerRequest[0]}</Label>
                <Slider value={settings.maxTokensPerRequest} onValueChange={v => update('maxTokensPerRequest', v)} min={256} max={4096} step={128} className="mt-2" />
              </div>
            </Card>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">SMTP Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>SMTP Host</Label><Input value={settings.smtpHost} onChange={e => update('smtpHost', e.target.value)} className="mt-2" /></div>
                <div><Label>SMTP Port</Label><Input value={settings.smtpPort} onChange={e => update('smtpPort', e.target.value)} className="mt-2" /></div>
                <div><Label>Username</Label><Input value={settings.smtpUser} onChange={e => update('smtpUser', e.target.value)} className="mt-2" /></div>
                <div>
                  <Label>Password</Label>
                  <div className="relative mt-2">
                    <Input type={showKeys['smtp'] ? 'text' : 'password'} value={settings.smtpPass} onChange={e => update('smtpPass', e.target.value)} className="pr-10" />
                    <button onClick={() => toggle('smtp')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showKeys['smtp'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success('Email test đã được gửi!')}>
                <Mail className="w-4 h-4 mr-2" /> Gửi email test
              </Button>
            </Card>

            <Card className="p-6 mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Email Templates</h3>
              <div className="space-y-3">
                {['Welcome Email', 'OTP Xác thực', 'Đặt lại mật khẩu', 'Nhắc nhở gia hạn', 'Thông báo hết quota'].map(t => (
                  <div key={t} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm text-gray-700">{t}</span>
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Mở template: ${t}`)}>Chỉnh sửa</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Bảo mật tài khoản</h3>
              {[
                { label: 'Bắt buộc 2FA cho Admin', desc: 'Admin phải bật xác thực 2 bước.' },
                { label: 'Khóa tài khoản sau 5 lần sai mật khẩu', desc: 'Tự động khóa 15 phút.' },
                { label: 'JWT token ngắn hạn (1 giờ)', desc: 'Tăng bảo mật nhưng cần đăng nhập lại thường xuyên hơn.' },
                { label: 'Log tất cả hành động Admin', desc: 'Audit trail đầy đủ cho tài khoản Admin.' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">IP & Rate Limiting</h3>
              <div>
                <Label>IP Whitelist (Admin access)</Label>
                <Textarea placeholder="Mỗi IP một dòng, VD: 116.96.0.0/24" className="mt-2 font-mono text-sm min-h-24" defaultValue={'116.96.0.0/24\n42.118.0.0/24'} />
              </div>
              <div>
                <Label>IP Blacklist</Label>
                <Textarea placeholder="IPs bị chặn..." className="mt-2 font-mono text-sm min-h-16" defaultValue={'185.220.101.x\n171.25.193.x'} />
              </div>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Cảnh báo hệ thống</h3>
              {[
                { label: 'Gửi email khi lỗi rate >5%', desc: 'Alert khi tỷ lệ lỗi API vượt ngưỡng', defaultOn: true },
                { label: 'Cảnh báo training job thất bại', desc: 'Thông báo ngay khi fine-tuning job gặp lỗi', defaultOn: true },
                { label: 'Thông báo OpenAI quota cạn', desc: 'Cảnh báo khi sử dụng 80% quota OpenAI', defaultOn: true },
                { label: 'Weekly analytics report', desc: 'Báo cáo tổng quan hàng tuần gửi email', defaultOn: false },
                { label: 'User exceeded quota', desc: 'Khi user dùng hết 90% quota tháng', defaultOn: false },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 border rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{n.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.defaultOn} />
                </div>
              ))}
            </Card>
            <Card className="p-6 mt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Webhook URL</h3>
              <Input placeholder="https://hooks.slack.com/services/..." className="font-mono" />
              <p className="text-xs text-gray-500 mt-2">Nhận thông báo qua Slack, Discord hoặc bất kỳ webhook URL nào</p>
            </Card>
          </TabsContent>

          {/* System */}
          <TabsContent value="system" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Logging</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Log Level</Label>
                  <Select value={settings.logLevel} onValueChange={v => update('logLevel', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug (verbose)</SelectItem>
                      <SelectItem value="info">Info (mặc định)</SelectItem>
                      <SelectItem value="warn">Warning only</SelectItem>
                      <SelectItem value="error">Error only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giữ log ({settings.logRetention} ngày)</Label>
                  <Slider value={[settings.logRetention]} onValueChange={v => update('logRetention', v[0])} min={7} max={90} step={7} className="mt-4" />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Backup</h3>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium text-sm">Tự động backup database</p>
                  <p className="text-xs text-gray-500">Backup dữ liệu định kỳ lên S3/cloud storage</p>
                </div>
                <Switch checked={settings.backupEnabled} onCheckedChange={v => update('backupEnabled', v)} />
              </div>
              {settings.backupEnabled && (
                <div>
                  <Label>Tần suất backup</Label>
                  <Select value={settings.backupFrequency} onValueChange={v => update('backupFrequency', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Mỗi giờ</SelectItem>
                      <SelectItem value="daily">Hàng ngày (00:00)</SelectItem>
                      <SelectItem value="weekly">Hàng tuần (CN 00:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => toast.success('Đang backup ngay bây giờ...')}>
                <Database className="w-4 h-4 mr-2" /> Backup ngay
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Thao tác nguy hiểm</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => toast('Đang xóa cache...')}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Xóa cache toàn bộ
                </Button>
                <Button variant="outline" className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50" onClick={() => toast.error('Thao tác này cần xác nhận!')}>
                  <AlertCircle className="w-4 h-4 mr-2" /> Reset tất cả rate limits
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="flex justify-end mt-6">
          <Button size="lg" className="bg-gradient-to-r from-stone-600 to-stone-600 text-white px-10" onClick={save}>
            <Save className="w-5 h-5 mr-2" /> Lưu tất cả cài đặt
          </Button>
        </div>
      </div>
    </Layout>
  );
}
