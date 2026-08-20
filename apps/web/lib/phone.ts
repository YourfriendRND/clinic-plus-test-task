const MAX_PHONE_DIGITS = 11;

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, MAX_PHONE_DIGITS);

  if (!digits) {
    return '';
  }

  return `+${digits}`;
}

export function phoneToApi(display: string): string {
  return display.replace(/\D/g, '');
}
