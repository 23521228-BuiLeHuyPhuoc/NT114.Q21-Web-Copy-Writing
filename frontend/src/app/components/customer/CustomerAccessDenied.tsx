import { ArrowLeft, CreditCard, Home, ShieldOff } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNavigate } from '@/lib/next-router-compat';
import { getCustomerRoleDef } from '@/lib/permissions';

const TEXT = {
  title: 'Kh\u00f4ng c\u00f3 quy\u1ec1n truy c\u1eadp',
  description: 'Trang n\u00e0y kh\u00f4ng n\u1eb1m trong nh\u00f3m quy\u1ec1n customer hi\u1ec7n t\u1ea1i c\u1ee7a b\u1ea1n.',
  currentGroup: 'Nh\u00f3m hi\u1ec7n t\u1ea1i',
  scope: 'Ph\u1ea1m vi nh\u00f3m',
  back: 'Quay l\u1ea1i',
  dashboard: 'Dashboard',
  billing: 'Xem g\u00f3i',
};

export function CustomerAccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleDef = getCustomerRoleDef(user?.customerRole);

  return (
    <div className='flex min-h-[80vh] items-center justify-center p-6'>
      <div className='max-w-md text-center'>
        <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-red-100 bg-destructive/10'>
          <ShieldOff className='h-12 w-12 text-red-400' />
        </div>

        <h2 className='mb-2 text-2xl font-bold text-foreground'>{TEXT.title}</h2>
        <p className='mb-6 text-sm leading-relaxed text-muted-foreground'>{TEXT.description}</p>

        {roleDef && (
          <div className={['mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2', roleDef.color, roleDef.borderColor].join(' ')}>
            <div className={['h-2 w-2 rounded-full', roleDef.dotColor].join(' ')} />
            <span className={['text-sm font-semibold', roleDef.textColor].join(' ')}>
              {TEXT.currentGroup}: {roleDef.label}
            </span>
          </div>
        )}

        {roleDef && (
          <div className='mb-8 rounded-2xl border border-border bg-surface-muted p-4 text-left'>
            <p className='mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground'>{TEXT.scope}</p>
            <p className='text-sm text-foreground/70'>{roleDef.description}</p>
          </div>
        )}

        <div className='flex flex-col justify-center gap-3 sm:flex-row'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground/70 transition-colors hover:border-primary/30 hover:bg-surface-muted'
          >
            <ArrowLeft className='h-4 w-4' />
            {TEXT.back}
          </button>
          <button
            type='button'
            onClick={() => navigate('/dashboard')}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15'
          >
            <Home className='h-4 w-4' />
            {TEXT.dashboard}
          </button>
          <button
            type='button'
            onClick={() => navigate('/billing')}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700'
          >
            <CreditCard className='h-4 w-4' />
            {TEXT.billing}
          </button>
        </div>
      </div>
    </div>
  );
}
