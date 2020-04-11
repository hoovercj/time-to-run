import React, { useState, useCallback } from "react";
import "../lib/milligram/milligram.sass";
import "./App.css";
import { Plan as IPlan } from "../lib/workout";
import { addDays, getGuid, DEFAULT_DISPLAYMODE } from "../lib/utils";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
import { PLANS } from "../workouts/workouts";
import {
  Filetype,
  downloadPlanCalendar,
  downloadPlanTemplate
} from "../lib/exporter";
import { importFile } from "../lib/importer";

// TODO: Add support for IE / Edge
// TODO: Persist imported and edited plans in local storage
const initialPlans: { [key: string]: IPlan } = {};
PLANS.forEach(p => {
  const id = getGuid();
  initialPlans[id] = {
    ...p,
    id,
    workouts: p.workouts.map(w => {
      return {
        ...w,
        id: getGuid(),
      };
    }),
  };
});

function App() {
  const defaultPlanId = Object.keys(initialPlans)[0];
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [plans, setPlans] = useState(initialPlans);
  const [planDisplayMode, setPlanDisplayMode] = useState(DEFAULT_DISPLAYMODE);

  const addOrUpdatePlan = useCallback(
    (plan: IPlan, select?: boolean) => {
      setPlans(p => {
        return {
          ...p,
          [plan.id]: plan
        };
      });

      if (select) {
        setSelectedPlanId(plan.id);
      }
    },
    [setPlans, setSelectedPlanId]
  );

  const selectedPlan = plans[selectedPlanId];

  const today = new Date();
  const defaultGoalDate = addDays(today, selectedPlan.workouts.length - 1);
  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  const defaultUnits = selectedPlan.units;
  const [displayUnits, setDisplayUnits] = useState(defaultUnits);

  return (
    <div className="app">
      <h1 className="app-header">Calendar Hack</h1>
      <a
        className="about-link"
        href="https://github.com/hoovercj/calendar-hack/blob/master/README.md"
      >
        About
      </a>
      <Settings
        date={goalDate}
        units={displayUnits}
        selectedPlan={selectedPlanId}
        plans={Object.values(plans).map(({ id, title }) => {
          return { id, title };
        })}
        onDateChange={setGoalDate}
        onPlanChange={setSelectedPlanId}
        onUnitsChange={setDisplayUnits}
        onDownload={(filetype: Filetype) =>
          filetype === "ical"
            ? downloadPlanCalendar(selectedPlan, goalDate, displayUnits)
            : downloadPlanTemplate(selectedPlan, filetype)
        }
        onFileChange={filelist => handleFileChange(filelist, addOrUpdatePlan)}
        displayMode={planDisplayMode}
      />
      <Plan
        plan={selectedPlan}
        savePlan={addOrUpdatePlan}
        goalDate={goalDate}
        displayUnits={displayUnits}
        onDisplayModeChanged={setPlanDisplayMode}
      />
    </div>
  );
}

const handleFileChange = (
  filelist: FileList | null,
  addPlan: (plan: IPlan, select: boolean) => void
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
      console.log(`Imported plan: ${importedPlan.title}`);

      // Avoid plans with the same title when importing. They can be renamed later
      while (
        !!Object.values(initialPlans).find(p => p.title === importedPlan.title)
      ) {
        importedPlan.title = `[Copy] ${importedPlan.title}`;
      }

      const plan = importedPlan as IPlan;
      plan.id = getGuid();
      plan.workouts.forEach(w => w.id = getGuid());

      addPlan(plan, true);
    })
    .catch(error => alert(error));
};

export default App;
