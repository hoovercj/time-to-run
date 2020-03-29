import { planToCsv } from "./csvProcessor";
import { formatWorkoutFromTemplate } from "./formatter";
import { ScheduledPlan, Plan } from "./workout";
import { ics, saveAs } from "../lib/ics";
import { chunkArray, getDateWithoutTime } from "../lib/utils";

export type Filetype = "ical" | "json" | "csv";

export function downloadPlanTemplate(plan: Plan, filetype: Filetype) {
  switch (filetype) {
    case "json":
      downloadJson(plan);
      return;
    case "csv":
      downloadCsv(plan);
      return;
  }
}

export function downloadPlanCalendar(plan: ScheduledPlan) {
  const calendar = ics();

  if (!calendar) {
    return;
  }

  const weeks = chunkArray(plan.workouts, 7);

  weeks.forEach((week, index) => {
    const weekStartDate = getDateWithoutTime(week[0].date);
    const weekEndDate = getDateWithoutTime(week[week.length - 1].date);
    const weekTitle = `${weeks.length - index} Weeks to Goal`;
    calendar.addEvent(weekTitle, "", "", weekStartDate, weekEndDate);

    week.forEach(workout => {
      const workoutDate = getDateWithoutTime(workout.date);
      const workoutTitle = formatWorkoutFromTemplate(
        workout.description,
        workout.units,
        workout.displayUnits
      );
      calendar.addEvent(workoutTitle, "", "", workoutDate, workoutDate);
    });
  });

  calendar.download(plan.title, ".ics");
}

function downloadJson(plan: Plan) {
  downloadCore(JSON.stringify(plan, null, "  "), `${plan.title}.json`);
}

function downloadCsv(plan: Plan) {
  downloadCore(planToCsv(plan), `${plan.title}.csv`);
}

function downloadCore(file: string, filename: string) {
  saveAs!(new Blob([file]), filename);
}
