import { RoleCode } from './role-code.enum';

const HOME_PATH: Record<RoleCode, string> = {
  [RoleCode.Operator]: '/operator/orders',
  [RoleCode.Team]: '/team/orders',
};

const ROLE_LABEL: Record<RoleCode, string> = {
  [RoleCode.Operator]: 'Оператор',
  [RoleCode.Team]: 'Бригада',
};

export function homePath(roleCode: RoleCode): string {
  return HOME_PATH[roleCode];
}

export function roleLabel(roleCode: RoleCode): string {
  return ROLE_LABEL[roleCode];
}
