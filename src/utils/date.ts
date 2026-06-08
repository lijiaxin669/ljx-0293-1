export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getCurrentDate(): string {
  return formatDate(new Date());
}

export function getCurrentTime(): string {
  return formatTime(new Date());
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getSpringFestivalDates(year: number): { date: string; label: string }[] {
  const dates: { date: string; label: string }[] = [];
  const labels = ['除夕', '初一', '初二', '初三', '初四', '初五', '初六', '初七'];
  
  const springFestivalEve = new Date(year, 0, 24);
  
  for (let i = 0; i < 8; i++) {
    const date = new Date(springFestivalEve);
    date.setDate(springFestivalEve.getDate() + i);
    dates.push({
      date: formatDate(date),
      label: labels[i],
    });
  }
  
  return dates;
}

export function getDateLabel(dateStr: string, year: number): string {
  const festivalDates = getSpringFestivalDates(year);
  const found = festivalDates.find(d => d.date === dateStr);
  return found ? found.label : dateStr;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function compareDate(a: string, b: string): number {
  return a.localeCompare(b);
}
