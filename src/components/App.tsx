import React, { useState } from "react";
import "./App.css";
import planJson from "../workouts/sample-workout.json";
import { Plan as IPlan, Units } from "../lib/workout";
import { addDays, schedulePlan } from "../lib/utils";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
const plan = planJson as IPlan;

function App() {
  const defaultGoalDate = addDays(new Date(), plan.workouts.length);
  const [goalDate, setGoalDate] = useState(defaultGoalDate)

  const defaultUnits = plan.units;
  const [units, setUnits] = useState(defaultUnits as string);

  const planToRender = schedulePlan(plan, goalDate, units as Units);

  return (
    <div className="app">
      <h1 className="app-header">Calendar Hack</h1>
      <Settings
        date={goalDate}
        units={units}
        plan="default"
        onDateChange={setGoalDate}
        onPlanChange={() => {}}
        onUnitsChange={setUnits}
      />
      <Plan plan={planToRender} />
    </div>
  );
}

export default App;
