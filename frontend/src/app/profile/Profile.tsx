import { useRef, useState, type ChangeEvent } from 'react';
import { Layout } from '@/app/components/Layout';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Mail, User as UserIcon, Calendar, Award, Edit2, Save,
  Lock, Bell, Globe, Shield, Crown, BarChart3, Brain, Key, Camera, Loader2, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import { notificationService } from '@/services/notificationService';
import { useMyBilling } from '@/hooks/queries/useBilling';
import { getRememberLoginPreference } from '@/stores/authStore';
import type { User } from '@/types/auth';

interface AvatarUploadResponse {
  data?: {
    user?: User;
    avatar?: string;
  };
}

function formatDateOnly(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatMonthlyPrice(value?: number) {
  const amount = Number(value || 0);
  if (amount <= 0) return 'Miễn phí';
  return amount.toLocaleString('vi-VN') + 'đ/tháng';
}

function getDaysRemaining(value?: string | null) {
  if (!value) return null;
  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) return null;
  return Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function CustomerProfile() {
  const { user, updateUser, updateRememberLogin } = useAuth();
  const { data: billingData, isLoading: billingLoading } = useMyBilling();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(() => getRememberLoginPreference());
  const [rememberLoginSaving, setRememberLoginSaving] = useState(false);
  const [quotaLowNotification, setQuotaLowNotification] = useState(() => user?.notificationPreferences?.quotaLow !== false);
  const [quotaLowNotificationSaving, setQuotaLowNotificationSaving] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('0901 234 567');
  const [company, setCompany] = useState('CopyPro Solutions');
  const [industry, setIndustry] = useState('technology');
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const avatarBusy = avatarUploading || avatarRemoving;
  const billing = billingData?.currentPlan;
  const planName = billing?.name || 'Free';
  const planPrice = formatMonthlyPrice(billing?.price);
  const expiresAt = billing?.expiresAt || null;
  const expiresLabel = billing?.expiresAtLabel || billing?.renewDate || 'Chưa có ngày hết hạn';
  const daysRemaining = getDaysRemaining(expiresAt);
  const planBadge = daysRemaining === null
    ? 'Chưa có hạn'
    : daysRemaining < 0
      ? 'Đã hết hạn'
      : 'Còn ' + daysRemaining + ' ngày';
  const memberSince = formatDateOnly(user?.createdAt);

  const saveProfile = () => {
    setEditing(false);
    toast.success('Đã cập nhật hồ sơ!');
  };

  const handleRememberLoginChange = async (checked: boolean) => {
    const previousValue = rememberLogin;
    setRememberLogin(checked);
    setRememberLoginSaving(true);

    try {
      await updateRememberLogin(checked, 'user');
      toast.success(checked ? 'Đã bật ghi nhớ đăng nhập 30 ngày' : 'Đã tắt ghi nhớ đăng nhập 30 ngày');
    } catch (error) {
      setRememberLogin(previousValue);
      const message = error instanceof Error ? error.message : 'Không thể cập nhật ghi nhớ đăng nhập';
      toast.error(message);
    } finally {
      setRememberLoginSaving(false);
    }
  };

  const handleQuotaLowNotificationChange = async (checked: boolean) => {
    const previousValue = quotaLowNotification;
    setQuotaLowNotification(checked);
    setQuotaLowNotificationSaving(true);

    try {
      const preferences = await notificationService.updatePreferences({ quotaLow: checked });
      if (user) {
        updateUser({
          ...user,
          notificationPreferences: preferences,
        });
      }
      toast.success(checked ? 'Đã bật thông báo quota còn 20%' : 'Đã tắt thông báo quota còn 20%');
    } catch (error) {
      setQuotaLowNotification(previousValue);
      const message = error instanceof Error ? error.message : 'Không thể cập nhật thông báo quota';
      toast.error(message);
    } finally {
      setQuotaLowNotificationSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch<AvatarUploadResponse>('/auth/user/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });

    const updatedUser = response.data.data?.user;
    if (!updatedUser) {
      throw new Error('Invalid avatar upload response');
    }

    updateUser(updatedUser);
  };

  const removeAvatar = async () => {
    const response = await api.delete<AvatarUploadResponse>('/auth/user/me/avatar');
    const updatedUser = response.data.data?.user;
    if (!updatedUser) {
      throw new Error('Invalid avatar remove response');
    }

    updateUser(updatedUser);
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh đại diện phải nhỏ hơn hoặc bằng 2MB');
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
      toast.success('Đã cập nhật avatar!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể upload avatar';
      toast.error(message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar || avatarBusy) return;

    setAvatarRemoving(true);
    try {
      await removeAvatar();
      toast.success('Đã gỡ avatar!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gỡ avatar';
      toast.error(message);
    } finally {
      setAvatarRemoving(false);
    }
  };

  const stats = [
    { label: 'Copy đã tạo', value: '312', icon: BarChart3, color: 'bg-primary/10 text-primary' },
    { label: 'Model fine-tuned', value: '2', icon: Brain, color: 'bg-primary/10 text-primary' },
    { label: 'Template lưu', value: '18', icon: Key, color: 'bg-primary/10 text-primary' },
    { label: 'Ngày thành viên', value: '68', icon: Calendar, color: 'bg-warning/10 text-amber-800' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Hồ Sơ Cá Nhân</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Avatar card */}
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'Avatar'} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-3xl">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={avatarBusy}
                title="Cập nhật avatar"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              {user?.avatar ? (
                <button
                  type="button"
                  className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={avatarBusy}
                  title="Gỡ avatar"
                  onClick={handleRemoveAvatar}
                >
                  {avatarRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              ) : null}
            </div>
            <h2 className="text-xl font-bold mb-1 text-foreground">{user?.name}</h2>
            <Badge className="bg-primary/10 text-primary border-0 mb-3">
              <Crown className="w-3 h-3 mr-1" /> {planName} Member
            </Badge>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-4 w-full border-t pt-4 space-y-2 text-sm text-foreground/70">
              <p><Globe className="w-3.5 h-3.5 inline mr-1.5" />{company}</p>
              <p><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Thành viên từ {memberSince}</p>
            </div>
          </Card>

          {/* Stats */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="p-4">
                    <div className={`inline-flex p-2 rounded-lg ${s.color} mb-2`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </Card>
                );
              })}
            </div>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-green-50 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900">Gói {planName} {billing?.isExpired ? 'đã hết hạn' : 'đang hoạt động'}</p>
                  <p className="text-sm text-primary">{billingLoading ? 'Đang tải billing...' : 'Hết hạn: ' + expiresLabel + ' · ' + planPrice}</p>
                </div>
                <Badge className="bg-primary text-white border-0">{billingLoading ? 'Đang tải' : planBadge}</Badge>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info"><UserIcon className="w-4 h-4 mr-2" />Thông tin</TabsTrigger>
            <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Bảo mật</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Thông báo</TabsTrigger>
          </TabsList>

          {/* Info */}
          <TabsContent value="info">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Thông tin cá nhân</h3>
                {editing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Hủy</Button>
                    <Button size="sm" className="bg-primary text-white" onClick={saveProfile}>
                      <Save className="w-4 h-4 mr-1" /> Lưu
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" /> Chỉnh sửa
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: 'Họ và tên', value: name, key: 'name', setter: setName },
                  { label: 'Email', value: user?.email ?? '', key: 'email', disabled: true },
                  { label: 'Số điện thoại', value: phone, key: 'phone', setter: setPhone },
                  { label: 'Công ty', value: company, key: 'company', setter: setCompany },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-sm text-foreground/70">{f.label}</Label>
                    <Input
                      value={f.value}
                      onChange={f.setter ? e => f.setter!(e.target.value) : undefined}
                      disabled={!editing || f.disabled}
                      className="mt-2"
                    />
                  </div>
                ))}
                <div>
                  <Label className="text-sm text-foreground/70">Ngành nghề chính</Label>
                  <Select value={industry} onValueChange={setIndustry} disabled={!editing}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[['ecommerce','Thương Mại Điện Tử'],['realestate','Bất Động Sản'],['technology','Công Nghệ'],['fnb','Ẩm Thực'],['healthcare','Y Tế'],['education','Giáo Dục']].map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Đổi mật khẩu</h3>
              <div className="space-y-3 max-w-md">
                <div><Label>Mật khẩu hiện tại</Label><Input type="password" placeholder="Nhập mật khẩu hiện tại" className="mt-2" /></div>
                <div><Label>Mật khẩu mới</Label><Input type="password" placeholder="Nhập mật khẩu mới" className="mt-2" /></div>
                <div><Label>Xác nhận mật khẩu mới</Label><Input type="password" placeholder="Nhập lại mật khẩu mới" className="mt-2" /></div>
                <Button className="bg-primary text-white" onClick={() => toast.success('Đã đổi mật khẩu!')}>
                  <Lock className="w-4 h-4 mr-2" /> Cập nhật mật khẩu
                </Button>
              </div>
            </Card>
            <Card className="p-6 mt-4">
              <h3 className="font-bold text-foreground mb-4">Bảo mật tài khoản</h3>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium text-sm text-foreground">Ghi nhớ đăng nhập (30 ngày)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Giữ phiên đăng nhập trong 30 ngày trên thiết bị hiện tại</p>
                </div>
                <Switch
                  checked={rememberLogin}
                  disabled={rememberLoginSaving}
                  onCheckedChange={handleRememberLoginChange}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="p-6 space-y-3">
              <h3 className="font-bold text-foreground mb-2">Cài đặt thông báo</h3>
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div>
                  <p className="font-medium text-sm text-foreground">Thông báo quota còn 20%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tạo cảnh báo khi quota copy tháng này chỉ còn 20%</p>
                </div>
                <Switch
                  checked={quotaLowNotification}
                  disabled={quotaLowNotificationSaving}
                  onCheckedChange={handleQuotaLowNotificationChange}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
