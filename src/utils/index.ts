const second = 1000;
const minute = 60 * 1000;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;
const year = day * 365;
export function getRelativeDate(date: Date) {
  const intl = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const relativeTime = Date.now() - date.getTime();
  const elapsed = Math.abs(relativeTime);

  const sign = Math.sign(-relativeTime);
  if (elapsed < minute) {
    return intl.format(sign * Math.round(elapsed / second), "second");
  } else if (elapsed < hour) {
    return intl.format(sign * Math.round(elapsed / minute), "minute");
  } else if (elapsed < day) {
    return intl.format(sign * Math.round(elapsed / hour), "hour");
  } else if (elapsed < month) {
    return intl.format(sign * Math.round(elapsed / day), "day");
  } else if (elapsed < year) {
    return intl.format(sign * Math.round(elapsed / month), "month");
  } else {
    return intl.format(sign * Math.round(elapsed / year), "year");
  }
}
