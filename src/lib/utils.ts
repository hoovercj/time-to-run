import { Plan, Workout, ScheduledPlan, ScheduledWorkout, Units } from "./workout";

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  var chunks = [];
  while (array.length) {
    chunks.push(array.splice(0, chunkSize));
  }

  return chunks;
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

export function schedulePlan(plan: Plan, goalDate: Date, outputUnits: Units): ScheduledPlan {
  const scheduledWorkouts = scheduleWorkouts(plan.workouts, goalDate, plan.units, outputUnits);
  return {
    ...plan,
    goalDate,
    workouts: scheduledWorkouts,

  };
}

export function scheduleWorkouts(
  workouts: Workout[],
  goalDate: Date,
  inputUnits: Units,
  outputUnits: Units,
): ScheduledWorkout[] {
  return workouts.map((workout, index) => {
    return {
      ...workout,
      date: addDays(goalDate, -1 * (workouts.length - index)),
      inputUnits,
      outputUnits,
    };
  });
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
    day: "numeric",
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

    return `${year}-${month}-${day}`
}

export function leftPad(input: string, minLength: number, char: string) {
    if (input.length >= minLength) {
        return input;
    }

    const repeat = minLength - input.length;

    return `${char.repeat(repeat)}${input}`;
}
