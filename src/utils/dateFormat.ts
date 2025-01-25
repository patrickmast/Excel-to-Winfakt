export const formatRelativeDate = (date: Date): { dateStr: string; timeStr: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const timeStr = date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Brussels',
    hour12: false,
  });

  if (inputDate.getTime() === today.getTime()) {
    return { dateStr: 'Today', timeStr };
  }
  
  if (inputDate.getTime() === yesterday.getTime()) {
    return { dateStr: 'Yesterday', timeStr };
  }

  const dateStr = date.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Brussels',
  });

  return { dateStr, timeStr };
};
