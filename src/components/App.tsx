import React, { useState, useCallback, useEffect } from "react";
import { Plan as IPlan } from "../lib/workout";
import { addDays, getGuid, DEFAULT_DISPLAYMODE, getDateInputValueString } from "../lib/utils";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
import { PLANS } from "../workouts/workouts";
import {
  Filetype,
  downloadPlanCalendar,
  downloadPlanTemplate,
  printPlanCalendar,
  copyPlanLink
} from "../lib/exporter";
import { importFile } from "../lib/importer";
import { convertPlanUnits } from "../lib/formatter";

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
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlanId, setSelectedPlanId] = useState(Object.keys(plans)[0]);

  const selectedPlan = plans[selectedPlanId];
  const [displayUnits, setDisplayUnits] = useState(selectedPlan.units);
  useEffect(() => {
    const newSelectedPlan = plans[selectedPlanId];
    setDisplayUnits(newSelectedPlan.units);
  }, [plans, selectedPlanId]);

  const [displayPlan, setDisplayPlan] = useState(selectedPlan);

  useEffect(() => {
    if (displayUnits !== selectedPlan.units) {
      const convertedPlan = convertPlanUnits(selectedPlan, displayUnits);
      setDisplayPlan(convertedPlan);
    } else {
      setDisplayPlan(selectedPlan);
    }
  }, [displayUnits, selectedPlan]);

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

  let defaultGoalDate = addDays(new Date(), selectedPlan.workouts.length - 1);
  // Most races are on Sunday, so default to setting the initial goal date to Sunday
  if (defaultGoalDate.getDay() !== 0) {
    // 6 - 0
    defaultGoalDate = addDays(defaultGoalDate, 7 - defaultGoalDate.getDay());
  }

  const [goalDate, setGoalDate] = useState(defaultGoalDate);

  return (
    <>
      <Settings
        date={goalDate}
        units={displayUnits}
        selectedPlan={selectedPlanId}
        plans={Object.values(plans).map(({ id, title, raceType }) => {
          return { id, title, raceType };
        })}
        onDateChange={setGoalDate}
        onPlanChange={setSelectedPlanId}
        onUnitsChange={setDisplayUnits}
        onDownload={(filetype: Filetype) => {
          switch (filetype) {
            case "ical":
              // TODO: Make sure this works. Simplify if needed
              downloadPlanCalendar(selectedPlan, goalDate, displayUnits);
              break;
            case "print":
              printPlanCalendar();
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
        plan={displayPlan}
        savePlan={addOrUpdatePlan}
        goalDate={goalDate}
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
