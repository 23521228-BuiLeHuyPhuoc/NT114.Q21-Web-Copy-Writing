import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
  Camera,
  Calendar,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useAuth } from '@/app/contexts/AuthContext';
import { api } from '@/lib/axios';
import { getAdminRoleDef } from '@/lib/permissions';
import { getRememberLoginPreference } from '@/stores/authStore';
import type { User } from '@/types/auth';

interface AccountResponse {
  data?: {
    user?: User;
    avatar?: string;
  };
}

function formatDate(value?: string) {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có dữ liệu';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function AdminProfile() {
  const { user, updateUser, updateRememberLogin } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(() => getRememberLoginPreference());
  const [rememberLoginSaving, setRememberLoginSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const adminRoleDef = getAdminRoleDef(user?.adminRole);
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'A';
  const avatarBusy = avatarUploading || avatarRemoving;

  useEffect(() => {
    setName(user?.name || '');
  }, [user?.name]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();

    if (nextName.length < 2) {
      toast.error('Tên admin phải có ít nhất 2 ký tự');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await api.patch<AccountResponse>('/auth/admin/me', { name: nextName });
      const updatedUser = response.data.data?.user;
      if (!updatedUser) throw new Error('Invalid profile response');

      updateUser(updatedUser);
      toast.success('Đã cập nhật tài khoản admin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật tài khoản admin';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch<AccountResponse>('/auth/admin/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });

    const updatedUser = response.data.data?.user;
    if (!updatedUser) throw new Error('Invalid avatar upload response');

    updateUser(updatedUser);
  };

  const removeAvatar = async () => {
    const response = await api.delete<AccountResponse>('/auth/admin/me/avatar');
    const updatedUser = response.data.data?.user;
    if (!updatedUser) throw new Error('Invalid avatar remove response');

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
      toast.success('Đã cập nhật avatar admin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể upload avatar admin';
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
      toast.success('Đã gỡ avatar admin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gỡ avatar admin';
      toast.error(message);
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleRememberLoginChange = async (checked: boolean) => {
    const previousValue = rememberLogin;
    setRememberLogin(checked);
    setRememberLoginSaving(true);

    try {
      await updateRememberLogin(checked, 'admin');
      toast.success(checked ? 'Đã bật ghi nhớ đăng nhập admin' : 'Đã tắt ghi nhớ đăng nhập admin');
    } catch (error) {
      setRememberLogin(previousValue);
      const message = error instanceof Error ? error.message : 'Không thể cập nhật ghi nhớ đăng nhập';
      toast.error(message);
    } finally {
      setRememberLoginSaving(false);
    }
  };

  const updatePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await api.patch<AccountResponse>('/auth/admin/me/password', {
        currentPassword,
        newPassword,
      });
      const updatedUser = response.data.data?.user;
      if (updatedUser) updateUser(updatedUser);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Đã đổi mật khẩu admin');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đổi mật khẩu admin';
      toast.error(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <Badge className="bg-primary/10 text-primary border-0 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Tài khoản đang đăng nhập
          </Badge>
          <h1 className="text-3xl font-bold text-foreground mb-1">Tài khoản Admin</h1>
          <p className="text-foreground/70">Cập nhật hồ sơ, avatar và bảo mật cho tài khoản quản trị hiện tại.</p>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <Card className="p-6 h-fit">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'Avatar'} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-3xl font-bold">
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
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
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

              <h2 className="text-xl font-bold text-foreground mb-1">{user?.name}</h2>
              {adminRoleDef && (
                <Badge className={`${adminRoleDef.color} ${adminRoleDef.textColor} border ${adminRoleDef.borderColor} mb-3`}>
                  {adminRoleDef.label}
                </Badge>
              )}
              <p className="text-sm text-muted-foreground break-all">{user?.email}</p>
            </div>

            <div className="mt-6 border-t pt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>Email không chỉnh trực tiếp tại đây</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Ngày tạo: {formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span>Trạng thái: {user?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</span>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="profile" className="min-w-0">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="profile"><UserIcon className="w-4 h-4 mr-2" />Thông tin</TabsTrigger>
              <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Bảo mật</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="p-6">
                <form onSubmit={saveProfile} className="space-y-5">
                  <div>
                    <h3 className="font-bold text-foreground">Thông tin tài khoản</h3>
                    <p className="text-sm text-muted-foreground mt-1">Thông tin này áp dụng cho tài khoản admin đang đăng nhập.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Họ và tên</Label>
                      <Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Email đăng nhập</Label>
                      <Input value={user?.email || ''} disabled className="mt-2" />
                    </div>
                    <div>
                      <Label>Vai trò admin</Label>
                      <Input value={adminRoleDef?.label || user?.adminRole || ''} disabled className="mt-2" />
                    </div>
                    <div>
                      <Label>Trạng thái</Label>
                      <Input value={user?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'} disabled className="mt-2" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="p-6">
                <form onSubmit={updatePassword} className="space-y-5 max-w-lg">
                  <div>
                    <h3 className="font-bold text-foreground">Đổi mật khẩu</h3>
                    <p className="text-sm text-muted-foreground mt-1">Mật khẩu mới cần ít nhất 8 ký tự, có chữ hoa, chữ thường và số.</p>
                  </div>
                  <div>
                    <Label>Mật khẩu hiện tại</Label>
                    <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-2" required />
                  </div>
                  <div>
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-2" required />
                  </div>
                  <div>
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2" required />
                  </div>
                  <Button type="submit" disabled={passwordSaving}>
                    {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Cập nhật mật khẩu
                  </Button>
                </form>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-4 p-4 border rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-foreground">Ghi nhớ đăng nhập admin</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Giữ phiên đăng nhập trong 30 ngày trên thiết bị hiện tại.</p>
                  </div>
                  <Switch
                    checked={rememberLogin}
                    disabled={rememberLoginSaving}
                    onCheckedChange={handleRememberLoginChange}
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
