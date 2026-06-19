import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  CheckCircle2,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { BarChart } from '@/app/components/charts';
import { PAYMENT_STATUS_MAP } from '@/lib/adminUiMaps';
import { useConfirmPayment, usePayments, useRevenue } from '@/hooks/queries/usePayments';
import { usePagination } from '@/hooks/usePagination';
import { matchesSearchRegex } from '@/lib/searchRegex';
import type { PaymentItem } from '@/services/paymentService';

function formatCurrency(value: number, currency = 'VND') {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString('vi-VN')} ${currency}`;
  }
}

function getPaymentTime(payment: { paidAt?: string | null; createdAt?: string; invoiceDate?: string; date?: string }) {
  const value = payment.paidAt || payment.createdAt || payment.invoiceDate || payment.date;
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

export function AdminPayments() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortPayments, setSortPayments] = useState('time-desc');
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const { data: payments = [], isLoading: paymentsLoading, isError: paymentsError } = usePayments();
  const { data: revenue, isLoading: revenueLoading } = useRevenue();
  const confirmPayment = useConfirmPayment();

  const revenueData = revenue?.items || [];
  const revenueStats = revenue?.stats;

  const planOptions = useMemo(() => (
    Array.from(new Set(payments.map(payment => payment.plan).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [payments]);

  const methodOptions = useMemo(() => (
    Array.from(new Set(payments.map(payment => payment.method).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [payments]);

  const filtered = useMemo(() => {
    const filteredPayments = payments.filter((payment) => {
      const matchSearch = matchesSearchRegex(search, [payment.user, payment.email, payment.id, payment.invoiceNo, payment.plan]);
      const matchStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchPlan = filterPlan === 'all' || payment.plan === filterPlan;
      const matchMethod = filterMethod === 'all' || payment.method === filterMethod;
      return matchSearch && matchStatus && matchPlan && matchMethod;
    });

    return [...filteredPayments].sort((a, b) => {
      switch (sortPayments) {
        case 'time-asc':
          return getPaymentTime(a) - getPaymentTime(b);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'plan-asc':
          return a.plan.localeCompare(b.plan, 'vi');
        case 'plan-desc':
          return b.plan.localeCompare(a.plan, 'vi');
        case 'time-desc':
        default:
          return getPaymentTime(b) - getPaymentTime(a);
      }
    });
  }, [filterMethod, filterPlan, filterStatus, payments, search, sortPayments]);

  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterStatus}|${filterPlan}|${filterMethod}|${sortPayments}`,
  });

  const statCards = [
    {
      label: 'Doanh thu tháng',
      value: formatCurrency(revenueStats?.monthlyRevenue || 0),
      icon: DollarSign,
      color: 'text-primary bg-primary/5',
      change: 'MongoDB',
    },
    {
      label: 'Giao dịch hôm nay',
      value: (revenueStats?.todayTransactions || 0).toLocaleString('vi-VN'),
      icon: CreditCard,
      color: 'text-primary bg-primary/5',
      change: 'hôm nay',
    },
    {
      label: 'Tổng giao dịch',
      value: (revenueStats?.totalTransactions || 0).toLocaleString('vi-VN'),
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
      change: 'toàn thời gian',
    },
    {
      label: 'Tỷ lệ thành công',
      value: `${(revenueStats?.successRate || 0).toLocaleString('vi-VN')}%`,
      icon: CheckCircle2,
      color: 'text-primary bg-primary/5',
      change: 'success/total',
    },
  ];

  const handleConfirmPayment = async (payment: PaymentItem) => {
    const id = payment.paymentId || payment._id || payment.invoiceNo || payment.id;
    if (!id) {
      toast.error('Không tìm thấy mã giao dịch để xác nhận');
      return;
    }

    setConfirmingPaymentId(id);
    try {
      await confirmPayment.mutateAsync(id);
      toast.success('Đã xác nhận thanh toán và kích hoạt gói');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xác nhận được thanh toán'));
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Quản lý thanh toán</h1>
            <p className="text-foreground/70">Theo dõi giao dịch, doanh thu và hóa đơn từ dữ liệu thật.</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất báo cáo</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((item) => (
            <StatTile key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} trend={{ value: item.change }} />
          ))}
        </div>

        <Card className="p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Doanh thu 6 tháng gần nhất (triệu VND)</h3>
          {revenueLoading ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Đang tải doanh thu...</div>
          ) : revenueData.length > 0 ? (
            <BarChart
              data={revenueData}
              xKey="month"
              height={200}
              valueSuffix="M VND"
              series={[{ key: 'revenue', label: 'Doanh thu', color: '#16723a' }]}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu doanh thu.</div>
          )}
        </Card>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm theo user, email hoặc mã giao dịch..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="pending">Đang xử lý</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="refunded">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả gói</SelectItem>
                  {planOptions.map(plan => <SelectItem key={plan} value={plan}>{plan}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phương thức</SelectItem>
                  {methodOptions.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortPayments} onValueChange={setSortPayments}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-desc">Mới nhất</SelectItem>
                  <SelectItem value="time-asc">Cũ nhất</SelectItem>
                  <SelectItem value="amount-desc">Số tiền cao</SelectItem>
                  <SelectItem value="amount-asc">Số tiền thấp</SelectItem>
                  <SelectItem value="plan-asc">Gói A-Z</SelectItem>
                  <SelectItem value="plan-desc">Gói Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        <AdminTable
          empty={!paymentsLoading && filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không có giao dịch phù hợp.</div> : undefined}
        >
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
            {paymentsLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">Đang tải giao dịch...</TableCell>
              </TableRow>
            ) : paymentsError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-sm text-destructive">Không tải được danh sách giao dịch.</TableCell>
              </TableRow>
            ) : pagination.pageItems.map((payment) => {
              const status = PAYMENT_STATUS_MAP[payment.status] || PAYMENT_STATUS_MAP.pending;
              const StatusIcon = status.icon;
              const paymentRecordId = payment.paymentId || payment._id || payment.invoiceNo || payment.id;
              const canConfirm = payment.status === 'pending' && (payment.methodCode === 'vietqr' || payment.provider === 'vietqr');

              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{payment.user}</p>
                      <p className="text-xs text-muted-foreground">{payment.email}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge className="bg-primary/10 text-primary border-0 text-xs">{payment.plan}</Badge></TableCell>
                  <TableCell className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                  <TableCell className="text-sm">{payment.method}</TableCell>
                  <TableCell>
                    <Badge className={`${status.color} border-0 text-xs`}>
                      <StatusIcon className="w-3 h-3 mr-1" />{status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{payment.date || '-'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {canConfirm && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleConfirmPayment(payment)}
                          disabled={confirmingPaymentId === paymentRecordId}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {confirmingPaymentId === paymentRecordId ? 'Đang xác nhận' : 'Xác nhận'}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </AdminTable>
        <DataPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="giao dịch"
        />
      </div>
    </Layout>
  );
}
