'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../../lib/auth-api';
import { RoleCode } from '../../lib/role-code.enum';
import { homePath, roleLabel } from '../../lib/role';
import type { SessionUser } from '../../lib/session-user';
import './app-header.css';

type AppHeaderProps = {
  user: SessionUser;
};

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ordersHref = homePath(user.roleCode);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      queryClient.clear();
      router.replace('/login');
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__left">
        <span className="app-header__logo">Клиника Плюс</span>
        <nav className="app-header__nav">
          {user.roleCode === RoleCode.Operator ? (
            <>
              <Link
                className={`app-header__link${pathname === ordersHref ? ' app-header__link--active' : ''}`}
                href={ordersHref}
              >
                Наряды
              </Link>
              <Link
                className={`app-header__link${pathname === '/operator/teams' ? ' app-header__link--active' : ''}`}
                href="/operator/teams"
              >
                Бригады
              </Link>
            </>
          ) : (
            <>
              <Link
                className={`app-header__link${pathname === '/team/orders' ? ' app-header__link--active' : ''}`}
                href="/team/orders"
              >
                Мои наряды
              </Link>
              <Link
                className={`app-header__link${pathname === '/team/orders/all' ? ' app-header__link--active' : ''}`}
                href="/team/orders/all"
              >
                Все наряды
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="app-header__user">
        <span className="app-header__name">{user.fullName}</span>
        <span className="app-header__role">{roleLabel(user.roleCode)}</span>
        <button type="button" className="app-header__logout" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}
