export const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsToMinutes = Math.floor(seconds) % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secondsToMinutes.toString().padStart(2, "0")}`;
};

export const getBrazilianDate = (): Date => {
  const date = new Date();
  date.setHours(date.getHours() - 3);
  return date;
}