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
import { LEVEL_MAP, ACTION_ICONS } from '@/mocks/auditLogs';
import { useAuditLogs } from '@/hooks/queries/useAuditLogs';

export function AdminAuditLogs() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const { data: logs = [] } = useAuditLogs();

  const filtered = logs.filter(log => {
    const matchSearch = log.action.includes(search.toLowerCase()) || log.user.includes(search.toLowerCase()) || log.details.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchSearch && matchLevel;
  });

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Nhật Ký Hệ Thống</h1>
            <p className="text-gray-600">Audit logs — theo dõi mọi hoạt động trên hệ thống</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất logs</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Tổng events hôm nay', value: '1,247', color: 'text-green-600 bg-green-50', icon: Shield },
            { label: 'Warnings', value: '23', color: 'text-amber-600 bg-amber-50', icon: AlertTriangle },
            { label: 'Errors', value: '5', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              {filtered.map(log => {
                const level = LEVEL_MAP[log.level] || LEVEL_MAP.info;
                const LevelIcon = level.icon;
                const ActionIcon = ACTION_ICONS[log.action] || Shield;
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell>
                      <Badge className={`${level.color} border-0 text-xs`}>
                        <LevelIcon className="w-3 h-3 mr-1" />{log.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ActionIcon className="w-3.5 h-3.5 text-gray-500" />
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.action}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{log.user}</p>
                        <Badge className={`border-0 text-xs ${log.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{log.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-64 truncate">{log.details}</TableCell>
                    <TableCell className="text-xs font-mono text-gray-400">{log.ip}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
}
