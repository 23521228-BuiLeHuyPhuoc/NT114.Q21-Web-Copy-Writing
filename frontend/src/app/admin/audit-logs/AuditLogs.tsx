import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  Search, Shield, Download, AlertTriangle,
} from 'lucide-react';
import { DataPagination } from '@/app/components/common/DataPagination';
import { LEVEL_MAP, ACTION_ICONS } from '@/mocks/auditLogs';
import { useAuditLogs } from '@/hooks/queries/useAuditLogs';
import { usePagination } from '@/hooks/usePagination';

export function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const { data: logs = [] } = useAuditLogs();

  const filtered = logs.filter(log => {
    const matchSearch = log.action.includes(search.toLowerCase()) || log.user.includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchSearch && matchLevel;
  });
  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterLevel}`,
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
            { label: 'Tổng events hôm nay', value: '1,247', color: 'text-primary bg-primary/5', icon: Shield },
            { label: 'Warnings', value: '23', color: 'text-amber-600 bg-warning/10', icon: AlertTriangle },
            { label: 'Errors', value: '5', color: 'text-red-600 bg-destructive/10', icon: AlertTriangle },
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

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input placeholder="Tìm kiếm action, user, chi tiết..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

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
              {pagination.pageItems.map(log => {
                const level = LEVEL_MAP[log.level] || LEVEL_MAP.info;
                const LevelIcon = level.icon;
                const ActionIcon = ACTION_ICONS[log.action] || Shield;
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
