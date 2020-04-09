import { planToCsv } from "./csvProcessor";
import { formatWorkoutFromTemplate } from "./formatter";
import { ScheduledPlan, ExternalPlan, Plan } from "./workout";
import { ics, saveAs } from "../lib/ics";
import {
  chunkArray,
  getDateWithoutTime,
  getVolumeStringFromWorkouts
} from "../lib/utils";

export type Filetype = "ical" | "json" | "csv";

export function downloadPlanTemplate(plan: Plan, filetype: Filetype) {
  const { raceDistance, raceType, title, units, workouts } = plan;

  const planToExport: ExternalPlan = {
    raceDistance,
    raceType,
    title,
    units,
    workouts,
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

export function downloadPlanCalendar(plan: ScheduledPlan) {
  const calendar = ics();

  if (!calendar) {
    return;
  }

  const { units, displayUnits, workouts } = plan;
  const weeks = chunkArray(workouts, 7);
  weeks.forEach((week, index) => {
    const weekStartDate = getDateWithoutTime(week[0].date);
    const weekEndDate = getDateWithoutTime(week[week.length - 1].date);

    const weekTitle = `${weeks.length -
      index} Weeks to Goal: ${getVolumeStringFromWorkouts(
      week,
      units,
      displayUnits
    )}`;
    calendar.addEvent(weekTitle, "", "", weekStartDate, weekEndDate);

    week.forEach(workout => {
      const workoutDate = getDateWithoutTime(workout.date);
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
