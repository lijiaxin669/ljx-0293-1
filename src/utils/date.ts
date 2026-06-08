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

export function generateDateRange(records: { date: string }[], year: number): { date: string; label: string }[] {
  const festivalDates = getSpringFestivalDates(year);
  const festivalDateSet = new Set(festivalDates.map(d => d.date));
  
  const recordDates = [...new Set(records.map(r => r.date))].sort(compareDate);
  
  const allDates = [...new Set([...festivalDates.map(d => d.date), ...recordDates])].sort(compareDate);
  
  if (allDates.length === 0) {
    return festivalDates;
  }
  
  const hasNonFestivalData = recordDates.some(d => !festivalDateSet.has(d));
  
  if (hasNonFestivalData) {
    return allDates.map(date => ({
      date,
      label: getDateLabel(date, year),
    }));
  }
  
  return festivalDates;
}

export function getSmartDateRange(records: { date: string }[], year: number): { date: string; label: string }[] {
  const festivalDates = getSpringFestivalDates(year);
  const festivalDateSet = new Set(festivalDates.map(d => d.date));
  
  const recordDates = [...new Set(records.map(r => r.date))].sort(compareDate);
  
  if (recordDates.length === 0) {
    return festivalDates;
  }
  
  const hasNonFestivalData = recordDates.some(d => !festivalDateSet.has(d));
  
  if (!hasNonFestivalData) {
    return festivalDates;
  }
  
  let minDate = recordDates[0];
  let maxDate = recordDates[recordDates.length - 1];
  
  festivalDates.forEach(fd => {
    if (compareDate(fd.date, minDate) < 0) minDate = fd.date;
    if (compareDate(fd.date, maxDate) > 0) maxDate = fd.date;
  });
  
  const result: { date: string; label: string }[] = [];
  const current = parseDate(minDate);
  const end = parseDate(maxDate);
  
  while (current <= end) {
    const dateStr = formatDate(current);
    result.push({
      date: dateStr,
      label: getDateLabel(dateStr, year),
    });
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function compareDate(a: string, b: string): number {
  return a.localeCompare(b);
}
