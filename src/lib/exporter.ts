import { ics, saveAs } from "../lib/ics";

import { ScheduledPlan, Plan } from "./workout";
import { formatWorkoutFromTemplate } from "./formatter";
import { chunkArray } from "../lib/utils";
import { planToCsv } from "./csvProcessor";

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
    const weekTitle = `${weeks.length - index} Weeks to Goal`;
    calendar.addEvent(
      weekTitle,
      "",
      "",
      week[0].date,
      week[week.length - 1].date
    );

    week.forEach((workout, index) => {
      const workoutTitle = formatWorkoutFromTemplate(
        workout.description,
        workout.units,
        workout.displayUnits
      );
      calendar.addEvent(workoutTitle, "", "", workout.date, workout.date);
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
