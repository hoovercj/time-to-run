import React, { useState } from "react";
import "./App.css";
// import planJson from "../workouts/sample-workout.json";
import { Plan as IPlan, Units } from "../lib/workout";
import { addDays, schedulePlan } from "../lib/utils";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
import { PLANS } from "../workouts/workouts";
import {
  Filetype,
  downloadPlanCalendar,
  downloadPlanTemplate
} from "../lib/exporter";
const plans: { [key: string]: IPlan } = {};
PLANS.forEach(w => (plans[w.title] = w));

function App() {
  const defaultPlanTitle = PLANS[0].title;
  const [selectedPlanTitle, setSelectedPlanTitle] = useState(defaultPlanTitle);

  const selectedPlan = plans[selectedPlanTitle];

  const today = new Date();
  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const defaultGoalDate = addDays(
    todayWithoutTime,
    selectedPlan.workouts.length
  );
  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  const defaultUnits = selectedPlan.units;
  const [units, setUnits] = useState(defaultUnits);

  const scheduledPlan = schedulePlan(selectedPlan, goalDate, units as Units);

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
        onDownload={(filetype: Filetype) =>
          filetype === "ical"
            ? downloadPlanCalendar(scheduledPlan)
            : downloadPlanTemplate(selectedPlan, filetype)
        }
      />
      <Plan plan={scheduledPlan} />
    </div>
  );
}

export default App;
