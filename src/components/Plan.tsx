import React, { useCallback, useReducer, useEffect, useMemo } from "react";

import "./Plan.scss";

import { Plan as IPlan, Workout as IWorkout, Units } from "../lib/workout";
import {
  func,
  getDayOfWeekString,
  getShortDateString,
  getVolumeStringFromWorkouts,
  getGuid,
  getDateForWorkout,
  getDistanceString,
  getLongDateString,
  DisplayMode,
  DEFAULT_DISPLAYMODE
} from "../lib/utils";
import { formatWorkoutFromTemplate } from "../lib/formatter";
import { Card } from "./Card";
import { IconButton } from "./IconButton";

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
      const insertIndex = newWorkouts.findIndex((w: IWorkout) => w.id === id);
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
        ...workoutToSwap
      };

      newState.editedPlan.workouts[nextIndex] = {
        ...workout
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
        displayMode: "edit"
      };
    }
    case "endEdit": {
      const save = payload as boolean;
      const plan = save ? state.editedPlan : state.plan;
      return {
        ...state,
        displayMode: "view",
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
  goalDate: Date;
  savePlan: func<IPlan>;
  displayUnits: Units;
  onDisplayModeChanged?: func<DisplayMode>;
}

const WEEK_LENGTH = 7;

interface PlanState {
  displayMode: DisplayMode;
  plan: IPlan;
  editedPlan: IPlan;
}

export function Plan({
  plan,
  savePlan,
  goalDate,
  displayUnits,
  onDisplayModeChanged
}: PlanProps) {
  const [state, dispatch] = useReducer(reducer, {
    displayMode: DEFAULT_DISPLAYMODE,
    plan: plan,
    editedPlan: plan
  });

  useEffect(
    () => onDisplayModeChanged && onDisplayModeChanged(state.displayMode),
    [state.displayMode, onDisplayModeChanged]
  );

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
  const { displayMode, editedPlan } = state;
  const { title, workouts } = editedPlan;

  const isEditMode = displayMode === "edit";

  const numWeeks = Math.ceil(workouts.length / WEEK_LENGTH);
  let renderedWeeks: JSX.Element[] = [];
  for (let i = 0; i < numWeeks; i++) {
    renderedWeeks.push(
      <Week
        key={i}
        displayUnits={displayUnits}
        units={units}
        dispatch={dispatch}
        displayMode={displayMode}
        weekNumber={i}
        allWorkouts={workouts}
        goalDate={goalDate}
      />
    );
  }

  return (
    <div className={`plan ${displayMode}`}>
      <h2 className="plan-heading">
        {renderTitle(title, dispatch, isEditMode)}
        {renderActions(isEditMode, editActionCallback)}
      </h2>
      <div className="goal-race">Goal Race: {getLongDateString(goalDate)}</div>
      {renderedWeeks}
    </div>
  );
}

function renderTitle(
  title: string,
  dispatch: func<Action>,
  isEditMode: boolean
): JSX.Element | string {
  return isEditMode ? (
    <input
      type="text"
      className="plan-title-input"
      onChange={e => dispatch({ type: "updateTitle", payload: e.target.value })}
      value={title}
    />
  ) : (
    <span className="plan-title-text primary">{title}</span>
  );
}

function renderActions(isEditMode: boolean, dispatch: func<Action>) {
  const primaryAction: Action = isEditMode
    ? { type: "endEdit", payload: true }
    : { type: "beginEdit" };
  const cancelEditAction: Action = { type: "endEdit", payload: false };

  const buttonClassName = "heading-action-button";
  const iconClassName = "heading-action-icon";

  // TODO: add keyboard shortucts for actions
  return (
    <>
      <IconButton
        onClick={() => dispatch(primaryAction)}
        title={isEditMode ? "Save" : "Edit"}
        icon={isEditMode ? "save" : "edit"}
        buttonClassName={buttonClassName}
        iconClassName={iconClassName}
      />
      {isEditMode && (
        // TODO: Focus is lost after clicking cancel
        <IconButton
          title="Cancel"
          onClick={() => dispatch(cancelEditAction)}
          icon="times"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
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
  displayMode: DisplayMode;
  goalDate: Date;
}

const Week = React.memo(function({
  weekNumber,
  allWorkouts,
  units,
  displayUnits,
  dispatch,
  displayMode,
  goalDate
}: WeekProps) {
  const weekStartIndex = weekNumber * WEEK_LENGTH;
  const weekEndIndex = Math.min(
    weekStartIndex + WEEK_LENGTH,
    allWorkouts.length
  );
  const weekWorkouts = useMemo(
    () => allWorkouts.slice(weekStartIndex, weekEndIndex),
    [allWorkouts, weekStartIndex, weekEndIndex]
  );
  const volumeString = useMemo(
    () => getVolumeStringFromWorkouts(weekWorkouts, units, displayUnits),
    [weekWorkouts, units, displayUnits]
  );

  return (
    <Card key={weekNumber}>
      <h3>
        <span className="primary">Week {weekNumber + 1}</span>&nbsp;&nbsp;
        <small>Total volume: {volumeString}</small>
      </h3>
      <div className="workouts-container">
        {weekWorkouts.map((workout, index) => (
          <Workout
            {...workout}
            workoutCount={allWorkouts.length}
            workoutIndex={weekStartIndex + index}
            goalDate={goalDate}
            key={workout.id}
            dispatch={dispatch}
            units={units}
            displayUnits={displayUnits}
            displayMode={displayMode}
          />
        ))}
      </div>
    </Card>
  );
});

export interface WorkoutProps {
  id: string;
  units: Units;
  displayUnits: Units;
  description: string;
  totalDistance: number;
  dispatch: func<Action>;
  displayMode: DisplayMode;
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
    displayMode,
    workoutCount,
    workoutIndex,
    goalDate
  } = props;

  const date = useMemo(
    () => getDateForWorkout(workoutIndex, workoutCount, goalDate),
    [workoutIndex, workoutCount, goalDate]
  );
  const dayOfWeekString = useMemo(() => getDayOfWeekString(date), [date]);
  const shortDateString = useMemo(() => getShortDateString(date), [date]);
  const formattedDescription = useMemo(
    () => formatWorkoutFromTemplate(description, units, displayUnits),
    [description, units, displayUnits]
  );
  const distanceString = useMemo(
    () => getDistanceString(totalDistance, units, displayUnits),
    [totalDistance, units, displayUnits]
  );

  const onDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newTotalDistance = Number.parseFloat(e.target.value);
    if (isNaN(newTotalDistance) || newTotalDistance < 0) {
      newTotalDistance = 0;
    }
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

  const buttonClassName = "workout-action-button";
  const iconClassName = "workout-action-icon";

  // TODO: Add keyboard shortcuts for actions
  const renderActions = () =>
    displayMode === "edit" && (
      <div className="my-row edit-workout-action-container">
        {/* TODO: focus is lost when moving workout between weeks */}
        <IconButton
          onClick={() => onMove(false)}
          title="Move up"
          icon="chevronup"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
        <IconButton
          onClick={() => onMove(true)}
          title="Move down"
          icon="chevrondown"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
        {/* TODO: focus should move to the newly added item */}
        <IconButton
          onClick={onInsert}
          title="Add new workout"
          icon="plus"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
        />
        {/* TODO: focus is lost after deleting */}
        <IconButton
          onClick={onDelete}
          title="Delete"
          icon="minus"
          buttonClassName={buttonClassName}
          iconClassName={iconClassName}
          disabled={workoutCount <= 1}
        />
      </div>
    );

  return (
    <div className={`workout ${displayMode}`}>
      <div className="date-column">
        <div className="my-row date-string primary">
          {dayOfWeekString} - {shortDateString}
        </div>
        {renderActions()}
      </div>
      <div className="description-column">
        {displayMode === "edit" && (
          <>
            <div className="my-row total-distance-row">
              Total Distance:
              <input
                value={totalDistance}
                type="number"
                onChange={onDistanceChange}
                className="total-distance-input"
              />
              <span>{distanceString}</span>
            </div>
            <div className="my-row description-row">
              <input
                type="text"
                className={"description-input"}
                value={description}
                onChange={onDescriptionChange}
              />
            </div>
          </>
        )}
        <div className="my-row formatted-description-row">
          {formattedDescription}
        </div>
      </div>
    </div>
  );
});
