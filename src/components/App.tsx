import React, { useState } from "react";
import "./App.css";
// import planJson from "../workouts/sample-workout.json";
import { Plan as IPlan, Units, ScheduledPlan } from "../lib/workout";
import { addDays, schedulePlan, chunkArray } from "../lib/utils";
import { ics } from "../lib/ics";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
import { PLANS } from "../workouts/workouts";
import { formatWorkoutFromTemplate } from "../lib/formatter";
const plans: { [key: string]: IPlan } = {};
PLANS.forEach(w => (plans[w.title] = w));

function App() {
  const defaultPlanTitle = PLANS[0].title;
  const [selectedPlanTitle, setSelectedPlanTitle] = useState(defaultPlanTitle);

  const selectedPlan = plans[selectedPlanTitle];

  const today = new Date();
  const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const defaultGoalDate = addDays(todayWithoutTime, selectedPlan.workouts.length);
  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  const defaultUnits = selectedPlan.units;
  const [units, setUnits] = useState(defaultUnits as string);

  const planToRender = schedulePlan(selectedPlan, goalDate, units as Units);

  return (
    <div className="app">
      <h1 className="app-header">Calendar Hack</h1>
      <Settings
        date={goalDate}
        units={units}
        selectedPlan={selectedPlanTitle}
        plans={Object.keys(plans)}
        onDateChange={setGoalDate}
        onPlanChange={setSelectedPlanTitle}
        onUnitsChange={setUnits}
        onDownload={() => downloadPlan(planToRender)}
      />
      <Plan plan={planToRender} />
    </div>
  );
}

function downloadPlan(plan: ScheduledPlan): void {
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

export default App;
