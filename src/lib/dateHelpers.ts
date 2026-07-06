export function getStartOfDayUTC(dateStrOrDate: string | Date | null | undefined): Date {
  if (!dateStrOrDate) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  }
  
  const dateStr = typeof dateStrOrDate === 'string' 
    ? dateStrOrDate 
    : dateStrOrDate.toISOString();
  
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

