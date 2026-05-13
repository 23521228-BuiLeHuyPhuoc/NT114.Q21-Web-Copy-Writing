import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAdminRoleDef } from '@/lib/permissions';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

export function AdminAccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleDef = getAdminRoleDef(user?.adminRole);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-50 border-2 border-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-12 h-12 text-red-400" />
        </div>

        {/* Heading */}
        <h2 className="text-gray-900 mb-2">Không có quyền truy cập</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Trang này không nằm trong phạm vi quyền của loại tài khoản của bạn.
        </p>

        {/* Current role chip */}
        {roleDef && (
          <div className={`inline-flex items-center gap-2 ${roleDef.color} border ${roleDef.borderColor} rounded-full px-4 py-2 mb-8`}>
            <div className={`w-2 h-2 rounded-full ${roleDef.dotColor}`} />
            <span className={`text-sm font-semibold ${roleDef.textColor}`}>
              Vai trò hiện tại: {roleDef.label}
            </span>
          </div>
        )}

        {/* Permissions list */}
        {roleDef && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 text-left">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Bạn được phép truy cập
            </p>
            <p className="text-sm text-gray-600">{roleDef.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-md shadow-green-200/60"
          >
            <Home className="w-4 h-4" />
            Dashboard Admin
          </button>
        </div>
      </div>
    </div>
  );
}
