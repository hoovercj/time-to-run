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
import { importFile } from "../lib/importer";
const plans: { [key: string]: IPlan } = {};
PLANS.forEach((p) => (plans[p.id] = p));

function App() {
  const defaultPlanId = PLANS[0].id;
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);

  const selectedPlan = plans[selectedPlanId];

  const today = new Date();
  const defaultGoalDate = addDays(
    today,
    selectedPlan.workouts.length
  );
  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  const defaultUnits = selectedPlan.units;
  const [units, setUnits] = useState(defaultUnits);

  const scheduledPlan = schedulePlan(selectedPlan, goalDate, units as Units);

  return (
    <div className="app">
      <h1 className="app-header">Calendar Hack</h1><a className="about-link" href="https://github.com/hoovercj/calendar-hack/blob/master/README.md">About</a>
      <Settings
        date={goalDate}
        units={units}
        selectedPlan={selectedPlanId}
        plans={Object.values(plans).map(({ id, title }) => { return { id, title }; })}
        onDateChange={setGoalDate}
        onPlanChange={setSelectedPlanId}
        onUnitsChange={setUnits}
        onDownload={(filetype: Filetype) =>
          filetype === "ical"
            ? downloadPlanCalendar(scheduledPlan)
            : downloadPlanTemplate(selectedPlan, filetype)
        }
        onFileChange={filelist =>
          handleFileChange(filelist, setSelectedPlanId)
        }
      />
      <Plan plan={scheduledPlan} savePlan={(plan: IPlan) => { plans[plan.id] = plan; }} />
    </div>
  );
}

const handleFileChange = (
  filelist: FileList | null,
  selectPlan: (plan: string) => void
) => {
  if (!filelist) {
    return;
  }

  const file = filelist.item(0);
  if (!file) {
    return;
  }

  importFile(file)
    .then(importedPlan => {
      // Avoid plans with the same title when importing. They can be renamed later
      while (!!plans[importedPlan.title]) {
          importedPlan.title = `[Copy] ${importedPlan.title}`;
      }

      const plan = importedPlan as IPlan;
      plan.id = plan.title;
      plans[plan.id] = plan;

      selectPlan(plan.id);
    })
    .catch(error =>
      alert(error)
    );
};

export default App;
