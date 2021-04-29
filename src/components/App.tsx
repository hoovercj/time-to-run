import React, { useState, useCallback } from "react";
import { Plan as IPlan } from "../lib/workout";
import { addDays, getGuid, DEFAULT_DISPLAYMODE, getDateInputValueString } from "../lib/utils";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
import { PLANS } from "../workouts/workouts";
import {
  Filetype,
  downloadPlanCalendar,
  downloadPlanTemplate,
  copyPlanLink
} from "../lib/exporter";
import { importFile } from "../lib/importer";

// TODO: Add support for IE / Edge
// TODO: Read additional / modified plans from local storage
const initialPlans: { [key: string]: IPlan } = {};
PLANS.forEach(p => {
  initialPlans[p.id] = {
    ...p,
    workouts: p.workouts.map(w => {
      return {
        ...w,
        // TODO: Should I just pre-generate these guids?
        id: getGuid()
      };
    })
  };
});

function App() {
  const defaultPlanId = Object.keys(initialPlans)[0];
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [plans, setPlans] = useState(initialPlans);
  const [planDisplayMode, setPlanDisplayMode] = useState(DEFAULT_DISPLAYMODE);

  // TODO: when adding or updating plan, persist it to local storage
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

  const defaultGoalDate = addDays(new Date(), selectedPlan.workouts.length - 1);
  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  const defaultUnits = selectedPlan.units;
  const [displayUnits, setDisplayUnits] = useState(defaultUnits);

  return (
    <>
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
        onDownload={(filetype: Filetype) => {
          switch (filetype) {
            case "ical":
              downloadPlanCalendar(selectedPlan, goalDate, displayUnits);
              break;
            case "link":
              const isDefaultDateSelected = getDateInputValueString(goalDate) === getDateInputValueString(defaultGoalDate);
              copyPlanLink(selectedPlan, !!initialPlans[selectedPlan.id], isDefaultDateSelected ? undefined : goalDate);
            break;
            default:
              downloadPlanTemplate(selectedPlan, filetype);
              break;
          }
        }}
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
    </>
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

      // Avoid plans with the same title when importing. They can be renamed later
      while (
        !!Object.values(initialPlans).find(p => p.title === importedPlan.title)
      ) {
        importedPlan.title = `[Copy] ${importedPlan.title}`;
      }

      const plan = importedPlan as IPlan;
      plan.id = getGuid();
      plan.workouts.forEach(w => (w.id = getGuid()));

      addPlan(plan, true);
    })
    .catch(error => alert(error));
};

export default App;
