import React, { useCallback, useReducer, useEffect } from "react";

import "./Plan.css";

import { ScheduledPlan, ScheduledWorkout, Units } from "../lib/workout";
import {
  chunkArray,
  func,
  getLongDateString,
  getDayOfWeekString,
  getShortDateString,
  getVolumeStringFromWorkouts
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { Card } from "./Card";

export interface PlanProps {
  plan: ScheduledPlan;
  savePlan: func<ScheduledPlan>;
}

type Mode = "edit" | "view";
const DEFAULT_VIEWMODE: Mode = "view";
const WEEK_LENGTH = 7;


interface PlanState {
  viewMode: Mode;
  plan: ScheduledPlan;
  editedPlan: ScheduledPlan;
}

type ActionType = "updateTitle" | "editWorkout" | "beginEdit" | "endEdit" | "setPlan";

interface Action {
  type: ActionType;
  payload?: any;
}

function reducer(state: PlanState, { type, payload }: Action): PlanState {
  switch (type) {
    case "setPlan": {
      const plan = payload as ScheduledPlan;
      return {
        ...state,
        plan: { ...plan },
        editedPlan: { ...plan },
      };
    }
    case "beginEdit":
      return {
        ...state,
        viewMode: "edit",
      };
    case "endEdit":
      const save = payload as boolean;
      const plan = save ? state.editedPlan : state.plan;
      return {
        ...state,
        viewMode: "view",
        plan: { ...plan },
        editedPlan: { ...plan },
      };
    case "updateTitle":
      const newTitle = payload as string;
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          title: newTitle,
        }
      };
    case "editWorkout":
      const newWorkout = payload as ScheduledWorkout;
      const newState = {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts],
        }
      };

      const indexToUpdate = newState.editedPlan.workouts.findIndex(
        (workout: ScheduledWorkout) => workout.id === newWorkout.id
      );
      newState.editedPlan.workouts[indexToUpdate] = newWorkout;

      return newState;
    default:
      throw new Error("Unsupported action type dispatched.");
  }
}

export function Plan({ plan, savePlan }: PlanProps) {
  const [state, dispatch] = useReducer(reducer, {
    viewMode: DEFAULT_VIEWMODE,
    plan: plan,
    editedPlan: plan,
  });

  useEffect(() => {
    dispatch({ type: "setPlan", payload: plan });
  }, [plan])

  const editActionCallback = useCallback(
    (action: Action) => {
      if (action.type === "endEdit" && action.payload === true) {
        savePlan(state.editedPlan);
      }
      dispatch(action);
    },
    [dispatch, savePlan, state.editedPlan]
  );

  const editWorkoutCallback: func<ScheduledWorkout> = useCallback(
    (updatedWorkout: ScheduledWorkout) => {
      dispatch({ type: "editWorkout", payload: updatedWorkout });
    },
    [dispatch]
  );

  // Properties that aren't editable
  const { goalDate, units, displayUnits } = plan;
  // Properties that are editable
  const { viewMode, editedPlan } = state;
  const { title, workouts } = editedPlan;
  const weeks: ScheduledWorkout[][] = chunkArray(workouts, WEEK_LENGTH);

  return (
    <div>
      {/* TODO: Add and remove workouts */}
      <h2 className="plan-title">
        {renderTitle(title, dispatch, viewMode)}
      </h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      {/* TODO: Make buttons nicer. possibly icons next to the plan title? */}
      {/* TODO: Add "delete" button */}
      <div className="actions-container">{renderActions(state, editActionCallback)}</div>
      {weeks.map((week, index) =>
        Week({
          displayUnits,
          units,
          updateWorkout: editWorkoutCallback,
          viewMode,
          weekNumber: index + 1,
          workouts: week
        })
      )}
    </div>
  );
}

function renderTitle(
  title: string,
  dispatch: func<Action>,
  viewMode: Mode
): JSX.Element | string {
  switch (viewMode) {
    case "edit":
      return (
        <input
          className="plan-title-input"
          onChange={e => dispatch({type: "updateTitle", payload: e.target.value})}
          value={title}
        />
      );
    case "view":
    default:
      return title;
  }
}

function renderActions(state: PlanState, dispatch: func<Action>) {
  const isEditMode = state.viewMode === "edit";

  const primaryAction: Action = isEditMode ? { type: "endEdit", payload: true } : { type: "beginEdit" };
  const cancelEditAction: Action = { type: "endEdit", payload: false };

  return (
    <>
      <button className="button primary" onClick={() => dispatch(primaryAction)}>
        {isEditMode ? "Save" : "Edit"}
      </button>
      {isEditMode && <button className="button" onClick={() => dispatch(cancelEditAction)}>
        Cancel
      </button>}
    </>
  );
}

interface WeekProps {
  weekNumber: number;
  workouts: ScheduledWorkout[];
  units: Units;
  displayUnits: Units;
  updateWorkout: func<ScheduledWorkout>;
  viewMode: Mode;
}

function Week({
  weekNumber,
  workouts,
  units,
  displayUnits,
  updateWorkout,
  viewMode
}: WeekProps) {
  return (
    <Card key={weekNumber}>
      <h3>
        Week {weekNumber}&nbsp;&nbsp;
        <small>
          Total volume:{" "}
          {getVolumeStringFromWorkouts(workouts, units, displayUnits)}
        </small>
      </h3>
      <div className="workouts-container">
        {workouts.map(workout => (
          <Workout
            key={workout.id}
            updateWorkout={updateWorkout}
            units={units}
            displayUnits={displayUnits}
            viewMode={viewMode}
            {...workout}
          />
        ))}
      </div>
    </Card>
  );
}

export interface WorkoutProps {
  id: number;
  date: Date;
  units: Units;
  displayUnits: Units;
  description: string;
  totalDistance: number;
  updateWorkout: func<ScheduledWorkout>;
  viewMode: Mode;
}

export const Workout = React.memo(function(props: WorkoutProps) {
  const {
    date,
    units,
    displayUnits,
    updateWorkout,
    id,
    description,
    totalDistance,
    viewMode
  } = props;

  const dayOfWeekString = getDayOfWeekString(date);
  const shortDateString = getShortDateString(date);
  const formattedDescription = formatWorkoutFromTemplate(
    description,
    units,
    displayUnits
  );

  const onDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalDistance = Number.parseFloat(e.target.value);
    updateWorkout({
      date,
      description,
      totalDistance: newTotalDistance,
      id
    });
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    updateWorkout({
      date,
      totalDistance,
      description: newDescription,
      id: id
    });
  };

  return (
    <div className={`workout ${viewMode}`}>
      <div className="date-column">
        <div className="date-string">{dayOfWeekString} - {shortDateString}</div>
      </div>
      <div className="description">
        {viewMode === "edit" && (
          <>
            <div>
              Total Distance: {/* TODO: make inputs nicer */}
              <input
                value={totalDistance}
                type="number"
                onChange={onDistanceChange}
              />
            </div>
            <div>
              <input
                className={"description-input"}
                value={description}
                onChange={onDescriptionChange}
              />
            </div>
          </>
        )}
        <div>{formattedDescription}</div>
      </div>
    </div>
  );
});
