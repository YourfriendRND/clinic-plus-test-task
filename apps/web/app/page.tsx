'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMe, type SessionUser } from '../lib/auth-api';
import './home-page.css';

type LoadState = 'loading' | 'ok' | 'error';

export default function Home() {
  const [state, setState] = useState<LoadState>('loading');
  const [detail, setDetail] = useState('');
  const [session, setSession] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        const body = await response.text();
        if (!response.ok) {
          throw new Error(body || `HTTP ${response.status}`);
        }
        setDetail(body);
        setState('ok');
      })
      .catch((error: unknown) => {
        setDetail(error instanceof Error ? error.message : 'unknown error');
        setState('error');
      });

    getMe()
      .then(setSession)
      .catch(() => {
        setSession(null);
      });
  }, []);

  return (
    <main className="home-page">
      <h1 className="home-page__title">Клиника Плюс</h1>
      <p className="home-page__text">Проверка связи со скелетом API через rewrite /api/health.</p>
      {state === 'loading' ? <p className="home-page__text">Запрос к API…</p> : null}
      {state === 'ok' ? <p className="home-page__text">API: {detail}</p> : null}
      {state === 'error' ? (
        <p className="home-page__text">
          API недоступен. Запустите `npm run dev` из корня репозитория. {detail}
        </p>
      ) : null}
      {session ? (
        <p className="home-page__text">
          Сессия: {session.fullName} ({session.roleCode})
        </p>
      ) : (
        <p className="home-page__text">Сессия: нет. Войдите через страницу входа.</p>
      )}
      <Link className="home-page__link" href="/login">
        Вход
      </Link>
    </main>
  );
}
