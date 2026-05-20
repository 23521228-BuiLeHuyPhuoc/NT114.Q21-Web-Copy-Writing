import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  DollarSign, CreditCard, TrendingUp,
  Download, Eye, CheckCircle2,
} from 'lucide-react';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { BarChart } from '@/app/components/charts';
import { STATUS_MAP } from '@/mocks/payments';
import { usePayments, useRevenue } from '@/hooks/queries/usePayments';

export function AdminPayments() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { data: payments = [] } = usePayments();
  const { data: revenueData = [] } = useRevenue();

  const filtered = payments.filter(p => {
    const matchSearch = p.user.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Quản Lý Thanh Toán</h1>
            <p className="text-foreground/70">Theo dõi giao dịch, doanh thu và hóa đơn</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất báo cáo</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Doanh thu tháng', value: '45.2M₫', icon: DollarSign, color: 'text-primary bg-primary/5', change: '+23%' },
            { label: 'Giao dịch hôm nay', value: '18', icon: CreditCard, color: 'text-primary bg-primary/5', change: '+5' },
            { label: 'Tăng trưởng', value: '+23%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', change: 'so với T2' },
            { label: 'Tỷ lệ thành công', value: '96.5%', icon: CheckCircle2, color: 'text-primary bg-primary/5', change: 'Rất tốt' },
          ].map((s, i) => (
            <StatTile key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} trend={{ value: s.change }} />
          ))}
        </div>

        {/* Revenue chart */}
        <Card className="p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Doanh thu 6 tháng gần nhất (triệu VNĐ)</h3>
          <BarChart
            data={revenueData}
            xKey="month"
            height={200}
            valueSuffix="M₫"
            series={[{ key: 'revenue', label: 'Doanh thu', color: '#16723a' }]}
          />
        </Card>

        {/* Filters */}
        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo user hoặc mã GD..."
          rightSlot={
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Table */}
        <AdminTable>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Gói</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(pay => {
                const status = STATUS_MAP[pay.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={pay.id}>
                    <TableCell className="font-mono text-sm">{pay.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{pay.user}</p>
                        <p className="text-xs text-muted-foreground">{pay.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-primary/10 text-primary border-0 text-xs">{pay.plan}</Badge></TableCell>
                    <TableCell className="font-semibold">{pay.amount.toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell className="text-sm">{pay.method}</TableCell>
                    <TableCell>
                      <Badge className={`${status.color} border-0 text-xs`}>
                        <StatusIcon className="w-3 h-3 mr-1" />{status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{pay.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
        </AdminTable>
      </div>
    </Layout>
  );
}
