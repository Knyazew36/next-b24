export const formatMinutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}ч ${remainingMinutes}м` : `${remainingMinutes}м`;
};
