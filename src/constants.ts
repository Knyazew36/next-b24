export const LAST_YEAR_ISO_DATE = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('.')[0] + 'Z';
};
