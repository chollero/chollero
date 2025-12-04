// src/utils/helpers.ts
export function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace 1 min';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} m`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  return `hace ${Math.floor(diffInSeconds / 86400)} d`;
}

export function getDateISO(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export type Tab = 'destacados' | 'subiendo' | 'nuevos' | 'semana';