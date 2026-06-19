import { useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  Shield, Download, AlertTriangle,
} from 'lucide-react';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { DataPagination } from '@/app/components/common/DataPagination';
import { AUDIT_ACTION_ICONS, AUDIT_LEVEL_MAP } from '@/lib/adminUiMaps';
import { useAuditLogs } from '@/hooks/queries/useAuditLogs';
import { usePagination } from '@/hooks/usePagination';
import { matchesSearchRegex } from '@/lib/searchRegex';

function getLogTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [sortLogs, setSortLogs] = useState('time-desc');
  const { data: logs = [], isLoading } = useAuditLogs();

  const actionOptions = useMemo(() => (
    Array.from(new Set(logs.map(log => log.action).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [logs]);

  const roleOptions = useMemo(() => (
    Array.from(new Set(logs.map(log => log.role).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [logs]);

  const filtered = useMemo(() => {
    const filteredLogs = logs.filter(log => {
      const matchSearch = matchesSearchRegex(search, [log.action, log.user, log.role, log.details, log.ip, log.level]);
      const matchLevel = filterLevel === 'all' || log.level === filterLevel;
      const matchAction = filterAction === 'all' || log.action === filterAction;
      const matchRole = filterRole === 'all' || log.role === filterRole;
      return matchSearch && matchLevel && matchAction && matchRole;
    });

    return [...filteredLogs].sort((a, b) => {
      switch (sortLogs) {
        case 'time-asc':
          return getLogTime(a.createdAt) - getLogTime(b.createdAt);
        case 'action-asc':
          return a.action.localeCompare(b.action, 'vi');
        case 'action-desc':
          return b.action.localeCompare(a.action, 'vi');
        case 'user-asc':
          return a.user.localeCompare(b.user, 'vi');
        case 'user-desc':
          return b.user.localeCompare(a.user, 'vi');
        case 'time-desc':
        default:
          return getLogTime(b.createdAt) - getLogTime(a.createdAt);
      }
    });
  }, [filterAction, filterLevel, filterRole, logs, search, sortLogs]);

  const summary = {
    total: logs.length,
    warnings: logs.filter(log => log.level === 'warning').length,
    errors: logs.filter(log => log.level === 'error').length,
  };

  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterLevel}|${filterAction}|${filterRole}|${sortLogs}`,
  });

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Nhật Ký Hệ Thống</h1>
            <p className="text-foreground/70">Audit logs — theo dõi mọi hoạt động trên hệ thống</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất logs</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tổng events', value: summary.total.toLocaleString('vi-VN'), color: 'text-primary bg-primary/5', icon: Shield },
            { label: 'Warnings', value: summary.warnings.toLocaleString('vi-VN'), color: 'text-amber-600 bg-warning/10', icon: AlertTriangle },
            { label: 'Errors', value: summary.errors.toLocaleString('vi-VN'), color: 'text-red-600 bg-destructive/10', icon: AlertTriangle },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm kiếm action, user, chi tiết..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả level</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả action</SelectItem>
                  {actionOptions.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roleOptions.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortLogs} onValueChange={setSortLogs}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-desc">Mới nhất</SelectItem>
                  <SelectItem value="time-asc">Cũ nhất</SelectItem>
                  <SelectItem value="action-asc">Action A-Z</SelectItem>
                  <SelectItem value="action-desc">Action Z-A</SelectItem>
                  <SelectItem value="user-asc">User A-Z</SelectItem>
                  <SelectItem value="user-desc">User Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Chi tiết</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Đang tải audit logs...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">Không có log phù hợp.</TableCell>
                </TableRow>
              ) : pagination.pageItems.map(log => {
                const level = AUDIT_LEVEL_MAP[log.level] || AUDIT_LEVEL_MAP.info;
                const LevelIcon = level.icon;
                const ActionIcon = AUDIT_ACTION_ICONS[log.action] || Shield;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge className={`${level.color} border-0 text-xs`}>
                        <LevelIcon className="w-3 h-3 mr-1" />{log.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.action}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.user}</p>
                        <Badge className={`border-0 text-xs ${log.role === 'admin' ? 'bg-destructive/10 text-red-600' : 'bg-muted text-foreground/70'}`}>{log.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/70 max-w-64 truncate">{log.details}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground/80">{log.ip}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
        <DataPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="log"
        />
      </div>
    </Layout>
  );
}
