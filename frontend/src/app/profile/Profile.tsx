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
  Lock, Bell, Globe, Shield, Crown, BarChart3, Brain, Key, Camera, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/axios';
import type { User } from '@/types/auth';

interface AvatarUploadResponse {
  data?: {
    user?: User;
    avatar?: string;
  };
}

export function CustomerProfile() {
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('0901 234 567');
  const [company, setCompany] = useState('CopyPro Solutions');
  const [industry, setIndustry] = useState('technology');
  const [defaultModel, setDefaultModel] = useState('gpt4o');
  const [defaultTone, setDefaultTone] = useState('professional');
  const [defaultLang, setDefaultLang] = useState('vi');
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const saveProfile = () => {
    setEditing(false);
    toast.success('Đã cập nhật hồ sơ!');
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
                disabled={avatarUploading}
                title="Cập nhật avatar"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>
            <h2 className="text-xl font-bold mb-1 text-foreground">{user?.name}</h2>
            <Badge className="bg-primary/10 text-primary border-0 mb-3">
              <Crown className="w-3 h-3 mr-1" /> Pro Member
            </Badge>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-4 w-full border-t pt-4 space-y-2 text-sm text-foreground/70">
              <p><Globe className="w-3.5 h-3.5 inline mr-1.5" />{company}</p>
              <p><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Thành viên từ 15/01/2026</p>
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
                  <p className="font-semibold text-green-900">Gói Pro đang hoạt động</p>
                  <p className="text-sm text-primary">Gia hạn: 23/04/2026 · 299,000₫/tháng</p>
                </div>
                <Badge className="bg-primary text-white border-0">Còn 31 ngày</Badge>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="mb-6">
            <TabsTrigger value="info"><UserIcon className="w-4 h-4 mr-2" />Thông tin</TabsTrigger>
            <TabsTrigger value="preferences"><Globe className="w-4 h-4 mr-2" />Tùy chọn AI</TabsTrigger>
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

          {/* AI Preferences */}
          <TabsContent value="preferences">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground mb-2">Tùy chọn AI mặc định</h3>
              <p className="text-sm text-foreground/70">Cài đặt mặc định được áp dụng mỗi khi bạn mở AI Generator.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Model mặc định</Label>
                  <Select value={defaultModel} onValueChange={setDefaultModel}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4o">GPT-4o (Khuyên dùng)</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="llama3">Llama 3.1 70B</SelectItem>
                      <SelectItem value="finetuned">Fine-tuned E-commerce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tone mặc định</Label>
                  <Select value={defaultTone} onValueChange={setDefaultTone}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                      <SelectItem value="friendly">Thân thiện</SelectItem>
                      <SelectItem value="urgent">Khẩn cấp</SelectItem>
                      <SelectItem value="luxury">Sang trọng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ngôn ngữ output</Label>
                  <Select value={defaultLang} onValueChange={setDefaultLang}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">Cả hai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="bg-primary text-white" onClick={() => toast.success('Đã lưu tùy chọn!')}>
                <Save className="w-4 h-4 mr-2" /> Lưu tùy chọn
              </Button>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Đổi mật khẩu</h3>
              <div className="space-y-3 max-w-md">
                <div><Label>Mật khẩu hiện tại</Label><Input type="password" placeholder="••••••••" className="mt-2" /></div>
                <div><Label>Mật khẩu mới</Label><Input type="password" placeholder="••••••••" className="mt-2" /></div>
                <div><Label>Xác nhận mật khẩu mới</Label><Input type="password" placeholder="••••••••" className="mt-2" /></div>
                <Button className="bg-primary text-white" onClick={() => toast.success('Đã đổi mật khẩu!')}>
                  <Lock className="w-4 h-4 mr-2" /> Cập nhật mật khẩu
                </Button>
              </div>
            </Card>
            <Card className="p-6 mt-4">
              <h3 className="font-bold text-foreground mb-4">Bảo mật tài khoản</h3>
              {[
                { label: 'Xác thực 2 bước (2FA)', desc: 'Bảo vệ ti khoản với mã OTP khi đăng nhập', on: false },
                { label: 'Thông báo đăng nhập lạ', desc: 'Nhận email khi có đăng nhập từ thiết bị mới', on: true },
                { label: 'Ghi nhớ đăng nhập (30 ngày)', desc: 'Không cần đăng nhập lại mỗi ngày', on: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 border rounded-xl mb-3">
                  <div>
                    <p className="font-medium text-sm text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.on} />
                </div>
              ))}
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="p-6 space-y-3">
              <h3 className="font-bold text-foreground mb-2">Cài đặt thông báo</h3>
              {[
                { label: 'Email khi copy được tạo thành công', on: false },
                { label: 'Thông báo quota còn 20%', on: true },
                { label: 'Thông báo fine-tuning hoàn thành', on: true },
                { label: 'Tin tức tính năng mới', on: true },
                { label: 'Ưu đãi và khuyến mãi', on: false },
                { label: 'Weekly report copy đã tạo', on: false },
              ].map(n => (
                <div key={n.label} className="flex items-center justify-between p-4 border rounded-xl">
                  <span className="text-sm text-foreground/80">{n.label}</span>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
              <Button className="bg-primary text-white mt-2" onClick={() => toast.success('Đã lưu cài đặt thông báo!')}>
                <Save className="w-4 h-4 mr-2" /> Lưu cài đặt
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
