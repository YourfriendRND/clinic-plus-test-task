import { formatPhoneInput } from '../../lib/phone';
import type { Team } from '../../lib/team';
import './teams-table.css';

type TeamsTableProps = {
  teams: Team[];
};

export function TeamsTable({ teams }: TeamsTableProps) {
  return (
    <table className="teams-table">
      <thead>
        <tr>
          <th className="teams-table__head">ФИО</th>
          <th className="teams-table__head">Телефон</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.id} className="teams-table__row">
            <td className="teams-table__cell">{team.fullName}</td>
            <td className="teams-table__cell">{formatPhoneInput(team.phone)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
