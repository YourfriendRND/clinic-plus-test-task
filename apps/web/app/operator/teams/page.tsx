'use client';

import { TeamsTable } from '../../../components/teams/teams-table';
import { useTeams } from '../../../hooks/use-teams';
import '../../../components/orders/orders-page.css';

export default function OperatorTeamsPage() {
  const teamsQuery = useTeams();
  const teams = teamsQuery.data ?? [];

  return (
    <main className="orders-page">
      <h1 className="orders-page__title">Бригады</h1>
      <div className="orders-page__panel">
        {teamsQuery.isPending ? <p className="orders-page__empty">Загрузка…</p> : null}
        {teamsQuery.isError ? <p className="orders-page__empty">Не удалось загрузить бригады</p> : null}
        {teamsQuery.isSuccess && teams.length === 0 ? (
          <p className="orders-page__empty">Бригад нет</p>
        ) : null}
        {teamsQuery.isSuccess && teams.length > 0 ? <TeamsTable teams={teams} /> : null}
      </div>
    </main>
  );
}
