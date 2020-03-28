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
        onFileChange={(filelist) => handleFileChange(filelist, setSelectedPlanTitle)}
      />
      <Plan plan={scheduledPlan} />
    </div>
  );
}

const handleFileChange = (filelist: FileList | null, selectPlan: (plan: string) => void) => {
  if (!filelist) {
    return;
  }

  let selectUploadedPlan = true;

  for (let i = 0; i < filelist.length; i++) {
    const file = filelist.item(i);
    if (!file) {
      continue;
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      const typedEvent = event as ProgressEventExtended;
      const result = typedEvent && typedEvent.target && typedEvent.target.result;

      try {
        const planObject = JSON.parse(result) as IPlan;

        const nameCollision = !!plans[planObject.title];
        if (nameCollision) {
          planObject.title = `[Copy] ${planObject.title}`;
        }

        plans[planObject.title] = planObject;

        // Only select one plan
        if (selectUploadedPlan) {
          selectUploadedPlan = false;
          selectPlan(planObject.title);
        }
      } catch (e) {
        alert(`Unable to read ${file.name}. Check the file and try again.`);
      }
    };

    reader.readAsText(file);
  }
};

interface ProgressEventExtended extends ProgressEvent {
  target: ProgressEventTarget;
}

interface ProgressEventTarget extends EventTarget {
  result: string;
}

export default App;
