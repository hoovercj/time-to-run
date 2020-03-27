import React from "react";
import "./App.css";
import planJson from "../workouts/sample-workout.json";
import { Plan as IPlan } from "../lib/workout";
import { addDays, schedulePlan } from "../lib/utils";
import { Plan } from "./Plan";
const plan = planJson as IPlan;

function App() {
  const goalDate = addDays(new Date(), plan.workouts.length);

  return (
    <div className="app">
      <h1 className="app-header">Calendar Hack</h1>
      <Plan plan={schedulePlan(plan, goalDate)} />
    </div>
  );
}

export default App;
