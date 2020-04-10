import React, { useCallback, useReducer, useEffect, useMemo } from "react";

import "./Plan.css";

import { Plan as IPlan, Workout as IWorkout, Units } from "../lib/workout";
import {
  func,
  getLongDateString,
  getDayOfWeekString,
  getShortDateString,
  getVolumeStringFromWorkouts,
  getGuid,
  getDateForWorkout
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { Card } from "./Card";

type ActionType =
  | "updateTitle"
  | "editWorkout"
  | "beginEdit"
  | "endEdit"
  | "setPlan"
  | "moveWorkout"
  | "deleteWorkout"
  | "insertWorkout";

interface Action {
  type: ActionType;
  payload?: any;
}

interface MoveWorkoutPayload {
  workout: IWorkout;
  forward: boolean;
}

function reducer(state: PlanState, { type, payload }: Action): PlanState {
  // TODO: deduplicate logic
  // TODO: delete and insert don't work because the dates aren't updated properly
  switch (type) {
    case "deleteWorkout": {
      const id = payload as string;
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: state.editedPlan.workouts.filter(w => w.id !== id)
        }
      };
    }
    case "insertWorkout": {
      const id = payload as string;
      const newWorkouts = [...state.editedPlan.workouts];
      const insertIndex = newWorkouts.findIndex(
        (w: IWorkout) => w.id === id
      );
      newWorkouts.splice(insertIndex, 0, {
        description: "",
        totalDistance: 0,
        id: getGuid()
      });
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: newWorkouts
        }
      };
    }
    case "moveWorkout": {
      const { workout, forward } = payload as MoveWorkoutPayload;
      const newState = {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts]
        }
      };

      const currentIndex = newState.editedPlan.workouts.findIndex(
        (w: IWorkout) => w.id === workout.id
      );
      const nextIndex = currentIndex + (forward ? 1 : -1);

      if (nextIndex < 0 || nextIndex >= newState.editedPlan.workouts.length) {
        return state;
      }

      const workoutToSwap = newState.editedPlan.workouts[nextIndex];

      newState.editedPlan.workouts[currentIndex] = {
        ...workoutToSwap,
      };

      newState.editedPlan.workouts[nextIndex] = {
        ...workout,
      };

      return newState;
    }
    case "setPlan": {
      const plan = payload as IPlan;
      return {
        ...state,
        plan: { ...plan },
        editedPlan: { ...plan }
      };
    }
    case "beginEdit": {
      return {
        ...state,
        viewMode: "edit"
      };
    }
    case "endEdit": {
      const save = payload as boolean;
      const plan = save ? state.editedPlan : state.plan;
      return {
        ...state,
        viewMode: "view",
        plan: { ...plan },
        editedPlan: { ...plan }
      };
    }
    case "updateTitle": {
      const newTitle = payload as string;
      return {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          title: newTitle
        }
      };
    }
    case "editWorkout": {
      const newWorkout = payload as IWorkout;
      const newState = {
        ...state,
        editedPlan: {
          ...state.editedPlan,
          workouts: [...state.editedPlan.workouts]
        }
      };

      const indexToUpdate = newState.editedPlan.workouts.findIndex(
        (workout: IWorkout) => workout.id === newWorkout.id
      );
      newState.editedPlan.workouts[indexToUpdate] = newWorkout;

      return newState;
    }
    default:
      throw new Error("Unsupported action type dispatched.");
  }
}

export interface PlanProps {
  plan: IPlan;
  goalDate: Date,
  savePlan: func<IPlan>;
  displayUnits: Units;
}

type Mode = "edit" | "view";
const DEFAULT_VIEWMODE: Mode = "view";
const WEEK_LENGTH = 7;

interface PlanState {
  viewMode: Mode;
  plan: IPlan;
  editedPlan: IPlan;
}

export function Plan({ plan, savePlan, goalDate, displayUnits }: PlanProps) {
  const [state, dispatch] = useReducer(reducer, {
    viewMode: DEFAULT_VIEWMODE,
    plan: plan,
    editedPlan: plan
  });

  useEffect(() => {
    dispatch({ type: "setPlan", payload: plan });
  }, [plan]);

  const editActionCallback = useCallback(
    (action: Action) => {
      if (action.type === "endEdit" && action.payload === true) {
        savePlan(state.editedPlan);
      }
      dispatch(action);
    },
    [dispatch, savePlan, state.editedPlan]
  );

  // Properties that aren't editable
  const { units } = plan;
  // Properties that are editable
  const { viewMode, editedPlan } = state;
  const { title, workouts } = editedPlan;

  const numWeeks = Math.ceil(workouts.length / WEEK_LENGTH);
  let renderedWeeks: JSX.Element[] = [];
  for (let i = 0; i < numWeeks; i++) {
    renderedWeeks.push(Week({
      displayUnits,
      units,
      dispatch,
      viewMode,
      weekNumber: i,
      allWorkouts: workouts,
      goalDate: goalDate,
    }));
  }

  return (
    <div>
      <h2 className="plan-title">{renderTitle(title, dispatch, viewMode)}</h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      <div className="actions-container">
        {renderActions(state, editActionCallback)}
      </div>
      {renderedWeeks}
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
          onChange={e =>
            dispatch({ type: "updateTitle", payload: e.target.value })
          }
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

  const primaryAction: Action = isEditMode
    ? { type: "endEdit", payload: true }
    : { type: "beginEdit" };
  const cancelEditAction: Action = { type: "endEdit", payload: false };

  // TODO: Make buttons nicer. possibly icons next to the plan title?
  return (
    <>
      <button
        className="button primary"
        onClick={() => dispatch(primaryAction)}
      >
        {isEditMode ? "Save" : "Edit"}
      </button>
      {isEditMode && (
        // TODO: Focus is lost after clicking cancel
        <button className="button" onClick={() => dispatch(cancelEditAction)}>
          Cancel
        </button>
      )}
    </>
  );
}

interface WeekProps {
  allWorkouts: IWorkout[];
  weekNumber: number;
  units: Units;
  displayUnits: Units;
  dispatch: func<Action>;
  viewMode: Mode;
  goalDate: Date;
}

function Week({
  weekNumber,
  allWorkouts,
  units,
  displayUnits,
  dispatch,
  viewMode,
  goalDate,
}: WeekProps) {

  const weekStartIndex = weekNumber * WEEK_LENGTH;
  const weekEndIndex = Math.min(weekStartIndex + WEEK_LENGTH, allWorkouts.length);
  const weekWorkouts = allWorkouts.slice(weekStartIndex, weekEndIndex);

  return (
    <Card key={weekNumber}>
      <h3>
        Week {weekNumber + 1}&nbsp;&nbsp;
        <small>
          Total volume:{" "}
          {getVolumeStringFromWorkouts(weekWorkouts, units, displayUnits)}
        </small>
      </h3>
      <div className="workouts-container">
        {weekWorkouts.map((workout, index) => (
          <Workout
            workoutCount={allWorkouts.length}
            workoutIndex={weekStartIndex + index}
            goalDate={goalDate}
            key={workout.id}
            dispatch={dispatch}
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
  id: string;
  units: Units;
  displayUnits: Units;
  description: string;
  totalDistance: number;
  dispatch: func<Action>;
  viewMode: Mode;
  goalDate: Date;
  workoutIndex: number;
  workoutCount: number;
}

export const Workout = React.memo(function(props: WorkoutProps) {
  const {
    units,
    displayUnits,
    dispatch,
    id,
    description,
    totalDistance,
    viewMode,
    workoutCount,
    workoutIndex,
    goalDate,
  } = props;

  // TODO: useMemo may not be useful inside a memo function, but I'm including it just in case
  const date = useMemo(() => getDateForWorkout(workoutIndex, workoutCount, goalDate), [workoutIndex, workoutCount, goalDate]);

  const dayOfWeekString = getDayOfWeekString(date);
  const shortDateString = getShortDateString(date);
  const formattedDescription = formatWorkoutFromTemplate(
    description,
    units,
    displayUnits
  );

  const onDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalDistance = Number.parseFloat(e.target.value);
    dispatch({
      type: "editWorkout",
      payload: {
        date,
        description,
        totalDistance: newTotalDistance,
        id
      }
    });
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    dispatch({
      type: "editWorkout",
      payload: {
        date,
        totalDistance,
        description: newDescription,
        id: id
      }
    });
  };

  const onMove = (forward: boolean) => {
    const payload: MoveWorkoutPayload = {
      forward,
      workout: {
        totalDistance,
        description,
        id
      }
    };

    dispatch({ type: "moveWorkout", payload });
  };

  const onDelete = () => dispatch({ type: "deleteWorkout", payload: id });

  const onInsert = () => dispatch({ type: "insertWorkout", payload: id });

  return (
    <div className={`workout ${viewMode}`}>
      <div className="date-column">
        <div className="date-string">
          {dayOfWeekString} - {shortDateString}
        </div>
        {viewMode === "edit" && (
          <div className="edit-workout-action-container">
            {/* TODO: focus should move to the newly added item */}
            <button onClick={onInsert} className="button">
              Add new
            </button>
            {/* TODO: focus is lost after deleting */}
            <button onClick={onDelete} className="button">
              Delete
            </button>
            <button onClick={() => onMove(false)} className="button">
              Move up
            </button>
            <button onClick={() => onMove(true)} className="button">
              Move down
            </button>
          </div>
        )}
      </div>
      <div className="description">
        {viewMode === "edit" && (
          <>
            <div>
              {/* TODO: Address mismatch between "total distance" and the display units */}
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
