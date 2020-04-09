import {
  Plan,
  Workout,
  ScheduledPlan,
  ScheduledWorkout,
  Units
} from "./workout";

// TODO: Add unit tests for util methods

export type func<T> = (value: T) => void;

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

export function schedulePlan(
  plan: Plan,
  goalDate: Date,
  displayUnits: Units
): ScheduledPlan {
  const { raceDistance, raceType, title, units, workouts, id } = plan;
  return {
    id,
    displayUnits,
    goalDate,
    raceDistance,
    raceType,
    title,
    units,
    workouts: scheduleWorkouts(workouts, goalDate)
  };
}

export function scheduleWorkouts(
  workouts: Workout[],
  goalDate: Date
): ScheduledWorkout[] {
  return workouts.map((workout, index) => {
    return {
      ...workout,
      date: addDays(goalDate, -1 * (workouts.length - index - 1)),
      id: index
    };
  });
}

export function getVolumeStringFromWorkouts(
  workouts: ScheduledWorkout[],
  units: Units,
  displayUnits: Units
): string {
  return `${Math.round(
    getVolumeFromWorkouts(workouts, units, displayUnits)
  ).toString(10)} ${displayUnits}`;
}

export function getVolumeFromWorkouts(
  workouts: ScheduledWorkout[],
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
