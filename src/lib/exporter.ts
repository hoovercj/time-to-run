import { planToCsv } from "./csvProcessor";
import { formatWorkoutFromTemplate } from "./formatter";
import { ExternalPlan, Plan, Units } from "./model";
import { ics, saveAs } from "../lib/ics";
import {
  chunkArray,
  getDateWithoutTime,
  getVolumeStringFromWorkouts,
  getDateForWorkout
} from "../lib/utils";

export type Filetype = "ical" | "json" | "csv";

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

    const weekTitle = `${weeks.length -
      index} Weeks to Goal: ${getVolumeStringFromWorkouts(
      week,
      units,
      displayUnits
    )}`;
    calendar.addEvent(weekTitle, "", "", weekStartDate, weekEndDate);

    week.forEach((workout, index) => {
      const workoutDate = getDateForWorkout(weekStartWorkoutIndex + index, workoutCount, goalDateWithoutTime);
      const workoutTitle = formatWorkoutFromTemplate(
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
