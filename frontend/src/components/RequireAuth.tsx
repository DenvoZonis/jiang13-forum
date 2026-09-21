import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginPath } from '../utils/authRedirect';
import { Spinner } from './ui/spinner';

/**
 * 登录门卫：整个前台站点默认需要登录才能访问。
 * 未登录时跳转到登录页（带 from 回跳）；校验中显示加载态。
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={loginPath(from)} replace />;
  }

  return <>{children}</>;
}
