import { useEffect, useMemo, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { AlertCircle, Cpu, Eye, EyeOff, Gauge, KeyRound, Mail, RefreshCw, Save, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import {
  useAdminEnvSettings,
  useAdminSystemSettings,
  useResetAdminQuotas,
  useUpdateAdminEnvSettings,
  useUpdateAdminSystemSettings,
} from '@/hooks/queries/useSystemSettings';
import type { EmailTemplate, EnvSettingSection } from '@/services/systemSettingsService';

const tinymceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key';

type SettingsForm = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  emailTemplates: EmailTemplate[];
};

const EMPTY_FORM: SettingsForm = {
  siteName: 'CopyPro',
  supportEmail: 'support@copypro.vn',
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
  registrationEnabled: true,
  emailVerificationRequired: false,
  emailTemplates: [],
};

function formatDateTime(value?: string | null) {
  if (!value) return 'Chưa reset';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa reset';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getProviderBadge(provider: { active: boolean; configured: boolean }) {
  if (provider.active && provider.configured) return { variant: 'success' as const, label: 'Đang dùng' };
  if (provider.active) return { variant: 'warning' as const, label: 'Đang chọn, thiếu cấu hình' };
  if (provider.configured) return { variant: 'info' as const, label: 'Đã cấu hình' };
  return { variant: 'neutral' as const, label: 'Chưa cấu hình' };
}

function sectionValues(section: EnvSettingSection | undefined, values: Record<string, string>) {
  if (!section) return {};
  return section.keys.reduce<Record<string, string>>((result, item) => {
    result[item.key] = values[item.key] ?? '';
    return result;
  }, {});
}

export function AdminSettings() {
  const { data: systemSettings, isLoading, error } = useAdminSystemSettings();
  const { data: envSettings, isLoading: envLoading, error: envError } = useAdminEnvSettings();
  const updateSystemSettings = useUpdateAdminSystemSettings();
  const updateEnvSettings = useUpdateAdminEnvSettings();
  const resetQuotas = useResetAdminQuotas();
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [visibleEnvKeys, setVisibleEnvKeys] = useState<Record<string, boolean>>({});

  const runtime = systemSettings?.runtimeConfig;
  const envAiSection = envSettings?.sections.find((section) => section.id === 'ai');
  const envEmailSection = envSettings?.sections.find((section) => section.id === 'email');
  const selectedTemplate = useMemo(
    () => form.emailTemplates.find((template) => template.key === selectedTemplateKey) || form.emailTemplates[0],
    [form.emailTemplates, selectedTemplateKey],
  );

  useEffect(() => {
    if (!systemSettings) return;

    setForm({
      siteName: systemSettings.siteName,
      supportEmail: systemSettings.supportEmail,
      maintenanceMode: systemSettings.maintenanceMode,
      maintenanceMessage: systemSettings.maintenanceMessage,
      registrationEnabled: systemSettings.registrationEnabled,
      emailVerificationRequired: systemSettings.emailVerificationRequired,
      emailTemplates: systemSettings.emailTemplates,
    });

    if (systemSettings.emailTemplates[0]) {
      setSelectedTemplateKey((current) => current || systemSettings.emailTemplates[0].key);
    }
  }, [systemSettings]);

  useEffect(() => {
    if (!envSettings) return;

    const nextValues: Record<string, string> = {};
    envSettings.sections.forEach((section) => {
      section.keys.forEach((item) => {
        nextValues[item.key] = item.value || '';
      });
    });
    setEnvValues(nextValues);
  }, [envSettings]);

  useEffect(() => {
    if (error) toast.error('Không tải được cài đặt hệ thống');
  }, [error]);

  useEffect(() => {
    if (envError) toast.error('Không tải được biến môi trường');
  }, [envError]);

  const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateTemplate = (key: keyof EmailTemplate, value: string) => {
    if (!selectedTemplate) return;

    setForm((current) => ({
      ...current,
      emailTemplates: current.emailTemplates.map((template) => (
        template.key === selectedTemplate.key ? { ...template, [key]: value } : template
      )),
    }));
  };

  const updateEnvValue = (key: string, value: string) => {
    setEnvValues((current) => ({ ...current, [key]: value }));
  };

  const toggleEnvVisibility = (key: string) => {
    setVisibleEnvKeys((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = async () => {
    try {
      await updateSystemSettings.mutateAsync(form);
      toast.success('Đã lưu cài đặt hệ thống');
    } catch (saveError) {
      const err = saveError as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Không lưu được cài đặt hệ thống');
    }
  };

  const saveEnv = async (section: EnvSettingSection | undefined) => {
    if (!section) return;

    try {
      await updateEnvSettings.mutateAsync({ values: sectionValues(section, envValues) });
      toast.success(`Đã lưu ${section.title} vào file .env`);
    } catch (saveError) {
      const err = saveError as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Không lưu được file .env');
    }
  };

  const handleResetQuotas = async () => {
    const confirmed = window.confirm('Reset quota đã sử dụng của tất cả người dùng về 0?');
    if (!confirmed) return;

    try {
      const settings = await resetQuotas.mutateAsync();
      toast.success(`Đã reset quota lúc ${formatDateTime(settings.quotaResetAt)}`);
    } catch (resetError) {
      const err = resetError as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Không reset được quota');
    }
  };

  const renderEnvSection = (section: EnvSettingSection | undefined) => {
    if (!section) {
      return <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Chưa có cấu hình .env để hiển thị.</div>;
    }

    return (
      <Card className="space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-foreground"><KeyRound className="h-4 w-4" /> {section.title} trong .env</h3>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </div>
          <Button type="button" onClick={() => void saveEnv(section)} disabled={updateEnvSettings.isPending || envLoading}>
            {updateEnvSettings.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu .env
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {section.keys.map((item) => {
            const visible = visibleEnvKeys[item.key];
            const inputType = item.secret && !visible ? 'password' : 'text';

            return (
              <div key={item.key} className="rounded-lg border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <Badge variant={envValues[item.key] ? 'success' : 'neutral'}>{item.key}</Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    type={inputType}
                    value={envValues[item.key] ?? ''}
                    placeholder={item.placeholder || item.key}
                    onChange={(event) => updateEnvValue(item.key, event.target.value)}
                    autoComplete="off"
                    className="font-mono text-sm"
                  />
                  {item.secret && (
                    <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => toggleEnvVisibility(item.key)} title={visible ? 'Ẩn giá trị' : 'Hiện giá trị'}>
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cài đặt hệ thống</h1>
            <p className="text-foreground/70">Quản lý cấu hình vận hành, AI model, email và quota của CopyPro.</p>
          </div>
          {(isLoading || envLoading) && <Badge variant="neutral">Đang tải</Badge>}
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
            <TabsTrigger value="general"><Settings className="mr-1 h-4 w-4" />Chung</TabsTrigger>
            <TabsTrigger value="ai"><Cpu className="mr-1 h-4 w-4" />AI Models</TabsTrigger>
            <TabsTrigger value="email"><Mail className="mr-1 h-4 w-4" />Email</TabsTrigger>
            <TabsTrigger value="quota"><Gauge className="mr-1 h-4 w-4" />Quota</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="space-y-4 p-6">
              <h3 className="font-semibold text-foreground">Thông tin cơ bản</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tên website</Label>
                  <Input value={form.siteName} onChange={(event) => updateField('siteName', event.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Email hỗ trợ</Label>
                  <Input value={form.supportEmail} onChange={(event) => updateField('supportEmail', event.target.value)} className="mt-2" />
                </div>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <h3 className="font-semibold text-foreground">Chế độ hoạt động</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-red-700">Chế độ bảo trì</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Người dùng sẽ thấy trang bảo trì, admin vẫn truy cập được.</p>
                  </div>
                  <Switch checked={form.maintenanceMode} onCheckedChange={(value) => updateField('maintenanceMode', value)} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Cho phép đăng ký mới</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Tắt tùy chọn này để dừng nhận tài khoản mới.</p>
                  </div>
                  <Switch checked={form.registrationEnabled} onCheckedChange={(value) => updateField('registrationEnabled', value)} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bắt buộc xác thực email</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Áp dụng cho tài khoản người dùng mới.</p>
                  </div>
                  <Switch checked={form.emailVerificationRequired} onCheckedChange={(value) => updateField('emailVerificationRequired', value)} />
                </div>
              </div>
              {form.maintenanceMode && (
                <div>
                  <Label>Nội dung trang bảo trì</Label>
                  <Textarea
                    value={form.maintenanceMessage}
                    onChange={(event) => updateField('maintenanceMessage', event.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {renderEnvSection(envAiSection)}

            <Card className="space-y-4 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Trạng thái provider từ runtime</h3>
                  <p className="text-sm text-muted-foreground">AI_PROVIDER={runtime?.ai.provider || 'gemini'}</p>
                </div>
                <Badge variant="outline">{runtime?.ai.googleCloudLocation || 'us-central1'}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {(runtime?.ai.providers || []).map((provider) => {
                  const badge = getProviderBadge(provider);
                  return (
                    <div key={provider.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{provider.name}</p>
                          <p className="mt-1 break-all text-xs text-muted-foreground">{provider.modelEnv}: {provider.model}</p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {provider.keyEnv.map((key) => (
                          <Badge key={key} variant={provider.keyConfigured ? 'success' : 'neutral'}>{key}</Badge>
                        ))}
                        {provider.usesSelectedModel && <Badge variant="warning">Dùng model từ UI</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <h3 className="font-semibold text-foreground">Models hiện có</h3>
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Generator</p>
                  <div className="flex flex-wrap gap-2">
                    {(runtime?.ai.generatorModels || []).map((model) => <Badge key={model.id} variant="outline">{model.name}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Vertex Gemini tuning</p>
                  <div className="flex flex-wrap gap-2">
                    {(runtime?.ai.fineTuneBaseModels || []).map((model) => <Badge key={model.id} variant="outline">{model.name}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Open-model tuning</p>
                  <div className="flex flex-wrap gap-2">
                    {(runtime?.ai.openModelTuningBaseModels || []).map((model) => <Badge key={model.id} variant="outline">{model.name}</Badge>)}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            {renderEnvSection(envEmailSection)}

            <Card className="space-y-4 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="font-semibold text-foreground">Trạng thái SMTP từ runtime</h3>
                <Badge variant={runtime?.smtp.configured ? 'success' : 'warning'}>
                  {runtime?.smtp.configured ? 'Đã cấu hình' : 'Thiếu SMTP_USER/SMTP_PASS'}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>SMTP_HOST</Label><Input value={runtime?.smtp.host || ''} readOnly className="mt-2" /></div>
                <div><Label>SMTP_PORT</Label><Input value={runtime?.smtp.port || ''} readOnly className="mt-2" /></div>
                <div><Label>SMTP_FROM</Label><Input value={runtime?.smtp.from || ''} readOnly className="mt-2" /></div>
                <div><Label>SMTP_SECURE</Label><Input value={runtime?.smtp.secure ? 'true' : 'false'} readOnly className="mt-2" /></div>
              </div>
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <h3 className="font-semibold text-foreground">Email templates</h3>
                <div className="flex flex-wrap gap-2">
                  {form.emailTemplates.map((template) => (
                    <Button
                      key={template.key}
                      type="button"
                      variant={selectedTemplate?.key === template.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTemplateKey(template.key)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTemplate ? (
                <div className="grid gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Input value={selectedTemplate.subject} onChange={(event) => updateTemplate('subject', event.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label>Plain text fallback</Label>
                    <Textarea value={selectedTemplate.text} onChange={(event) => updateTemplate('text', event.target.value)} className="mt-2 min-h-32 font-mono text-sm" />
                  </div>
                  <div>
                    <Label>HTML template</Label>
                    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
                      <Editor
                        apiKey={tinymceApiKey}
                        value={selectedTemplate.html}
                        init={{
                          height: 420,
                          menubar: 'edit insert view format table tools',
                          branding: false,
                          statusbar: true,
                          plugins: 'autolink lists link table code wordcount autoresize preview searchreplace visualblocks fullscreen',
                          toolbar: 'undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright | bullist numlist | link table | removeformat | preview fullscreen code',
                          content_style: 'body { font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #111827; } p { margin: 0 0 12px; } .token { font-family: monospace; background: #f3f4f6; padding: 2px 4px; border-radius: 4px; } table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #d1d5db; padding: 8px; }',
                        }}
                        onEditorChange={(value: string) => updateTemplate('html', value)}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                    Biến có sẵn: {'{{siteName}}'}, {'{{supportEmail}}'}, {'{{name}}'}, {'{{otp}}'}, {'{{minutes}}'}, {'{{accountLabel}}'}, {'{{planName}}'}, {'{{renewDate}}'}, {'{{quotaUsed}}'}, {'{{quotaLimit}}'}.
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có template email.</div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="quota" className="space-y-4">
            <Card className="space-y-4 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Reset quota người dùng</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Quota đã sử dụng của tất cả gói sẽ được tính lại từ thời điểm reset.</p>
                </div>
                <Badge variant="outline">Lần gần nhất: {formatDateTime(systemSettings?.quotaResetAt)}</Badge>
              </div>
              <div className="rounded-lg border border-amber-300 bg-warning/10 p-4 text-sm text-amber-800">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                Hành động này không xóa lịch sử generate, chỉ đặt mốc để quota hiện tại trở về 0.
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start border-amber-300 text-amber-800 hover:bg-warning/10 sm:w-auto"
                onClick={() => void handleResetQuotas()}
                disabled={resetQuotas.isPending}
              >
                {resetQuotas.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Reset quota tất cả người dùng
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={() => void save()} disabled={updateSystemSettings.isPending}>
            {updateSystemSettings.isPending ? (
              <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {updateSystemSettings.isPending ? 'Đang lưu...' : 'Lưu cài đặt hệ thống'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
