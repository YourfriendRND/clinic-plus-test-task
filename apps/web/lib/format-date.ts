export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}.${month}.${year}`;
}
