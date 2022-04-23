import { planToCsv } from "./csvProcessor";
import { convertWorkoutDescription } from "./formatter";
import { ExternalPlan, Plan, Units } from "./workout";
import { ics, saveAs } from "../lib/ics";
import {
  chunkArray,
  getDateWithoutTime,
  getVolumeStringFromWorkouts,
  getDateForWorkout,
  getVolumeFromWorkouts,
  getDateInputValueString
} from "../lib/utils";

export type Filetype = "ical" | "json" | "csv" | "link" | "print";

export function downloadPlanTemplate(plan: Plan, filetype: Filetype) {
  const { raceDistance, raceType, title, units, workouts } = plan;

  const planToExport: ExternalPlan = {
    raceDistance,
    raceType,
    title,
    units,
    workouts: workouts.map(w => {
      return {
        totalDistance: w.totalDistance,
        description: w.description,
      }
    }),
  };

  switch (filetype) {
    case "json":
      downloadJson(planToExport);
      return;
    case "csv":
      downloadCsv(planToExport);
      return;
  }
}

const WEEK_LENGTH = 7;

export function printPlanCalendar() {
    window.print();
}

export function downloadPlanCalendar(plan: Plan, goalDate: Date, displayUnits: Units) {
  const calendar = ics();

  if (!calendar) {
    return;
  }

  const { units, workouts } = plan;
  const weeks = chunkArray(workouts, WEEK_LENGTH);
  const goalDateWithoutTime = getDateWithoutTime(goalDate);

  const workoutCount = workouts.length;
  weeks.forEach((week, index) => {
    const weekStartWorkoutIndex = index * WEEK_LENGTH;
    const weekEndWorkoutIndex = weekStartWorkoutIndex + week.length;

    const weekStartDate = getDateForWorkout(weekStartWorkoutIndex, workoutCount, goalDateWithoutTime);
    const weekEndDate = getDateForWorkout(weekEndWorkoutIndex, workoutCount, goalDateWithoutTime);

    // For a 12 week plan, the first week should say "11 Weeks to Goal"
    const weeksLeft = weeks.length - (index + 1);
    let weekTitle = weeksLeft === 0 ? "Race week!" : `${weeksLeft} Weeks to Goal`;

    const weeklyVolume = getVolumeFromWorkouts(workouts, units, displayUnits);
    if (weeklyVolume > 0) {
      weekTitle += `:  ${getVolumeStringFromWorkouts(
        week,
        units,
        displayUnits
      )}`;
    }

    calendar.addEvent(weekTitle, "", "", weekStartDate, weekEndDate);

    week.forEach((workout, index) => {
      const workoutDate = getDateForWorkout(weekStartWorkoutIndex + index, workoutCount, goalDateWithoutTime);
      const workoutTitle = convertWorkoutDescription(
        workout.description,
        units,
        displayUnits
      );
      calendar.addEvent(workoutTitle, "", "", workoutDate, workoutDate);
    });
  });

  calendar.download(plan.title, ".ics");
}

function downloadJson(plan: ExternalPlan) {
  downloadCore(JSON.stringify(plan, null, "  "), `${plan.title}.json`);
}

function downloadCsv(plan: ExternalPlan) {
  downloadCore(planToCsv(plan), `${plan.title}.csv`);
}

function downloadCore(file: string, filename: string) {
  saveAs!(new Blob([file]), filename);
}

export function copyPlanLink(plan: Plan, isBuiltIn: boolean, goalDate?: Date) {
  if (!isBuiltIn) {
    // TODO: Support encoding custom plans
    return;
  }
  const location = window.location;
  const url = `${location.origin}${location.pathname}`;
  const params = new URLSearchParams();
  params.append("plan", plan.id);
  if (goalDate) {
    params.append("date", getDateInputValueString(goalDate));
  }

  const inputField = document.createElement("input");
  document.body.appendChild(inputField);
  inputField.value = `${url}?${params.toString()}`;
  inputField.select();
  document.execCommand("copy", true);
  // TODO: Show a "toast" message saying "link copied"
  document.body.removeChild(inputField);
}
