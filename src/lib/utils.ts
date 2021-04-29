import {
  Workout,
  Units
} from "./workout";

// TODO: Add unit tests for util methods

export type func<T> = (value: T) => void;
export type DisplayMode = "edit" | "view";
export const DEFAULT_DISPLAYMODE: DisplayMode = "view";

export function moveWithinArray<T=any>(array: T[], fromIndex: number, toIndex: number): T[] {
  const ret = [...array];
  ret.splice(toIndex, 0, ret.splice(fromIndex, 1)[0]);
  return ret;
}

// via https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function getGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    /* eslint-disable */
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Takes a date string and returns a date
 * @param dateString A date string in the format YYYY-MM-DD
 */
export function parseDateString(dateString: string): Date | null {
  const results = /(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (results?.length !== 4) {
    return null;
  }

  const [_, year, month, day] = results.map(Number);

  // Intentionally incomplete validation just for sanity checking.
  if (month < 1 || month > 12 || day < 0 || day > 31) {
    return null;
  }

  // Note: month is parsed as 1-12 but the Date constructor expects 0-11
  return new Date(year, month - 1, Number(results[3]));
}

export function getDateWithoutTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf("."));
}

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    return [array];
  }

  const arrayCopy = [...array];
  var chunks = [];
  while (arrayCopy.length) {
    chunks.push(arrayCopy.splice(0, chunkSize));
  }

  return chunks;
}

export function getScaleFactor(inputUnits: Units, outputUnits: Units): number {
  if (inputUnits === outputUnits) {
    return 1;
  } else if (outputUnits === "kilometers") {
    return 1.60934;
  } else {
    return 0.621371;
  }
}

export function scaleNumber(
  input: number,
  inputUnits: Units,
  outputUnits: Units
): number {
  if (inputUnits === outputUnits) {
    return input;
  } else {
    return input * getScaleFactor(inputUnits, outputUnits);
  }
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export function getDateForWorkout(workoutIndex: number, workoutCount: number, goalDate: Date) {
  return addDays(goalDate, -1 * (workoutCount - workoutIndex - 1));
}

export function getVolumeStringFromWorkouts(
  workouts: Workout[],
  units: Units,
  displayUnits: Units
): string {
  return `${Math.round(
    getVolumeFromWorkouts(workouts, units, displayUnits)
  ).toString(10)} ${displayUnits}`;
}

export function getDistanceString(
  distance: number,
  units: Units,
  displayUnits: Units
): string {
  return `${Math.round(
    scaleNumber(distance, units, displayUnits)
  ).toString(10)} ${displayUnits}`;
}

export function getVolumeFromWorkouts(
  workouts: Workout[],
  units: Units,
  displayUnits: Units
): number {
  return workouts.reduce(
    (total, { totalDistance }) =>
      total + scaleNumber(totalDistance, units, displayUnits),
    0
  );
}

export function getDayOfWeekString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "long" };
  return date.toLocaleDateString("en-US", options); // Saturday
}

export function getLongDateString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  return date.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
}

export function getShortDateStringWithoutYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric"}); // 9/17
}

export function getShortDateString(date: Date): string {
  return date.toLocaleDateString("en-US"); // 9/17/2016
}

export function getDateInputValueString(date: Date): string {
  const year = date.getFullYear();
  const month = leftPad((date.getMonth() + 1).toString(10), 2, "0");
  const day = leftPad(date.getDate().toString(10), 2, "0");

  return `${year}-${month}-${day}`;
}

export function leftPad(input: string, minLength: number, char: string) {
  if (input.length >= minLength) {
    return input;
  }

  const repeat = minLength - input.length;

  return `${char.repeat(repeat)}${input}`;
}

export function scrollIntoViewIfNeeded(target: Element) {
  var rect = target.getBoundingClientRect();

  if (rect.bottom > window.innerHeight || rect.top < 0) {
    target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }
}
