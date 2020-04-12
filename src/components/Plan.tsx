import React, { useCallback, useReducer, useEffect } from "react";

import "./Plan.scss";

import { Plan as IPlan, Units } from "../lib/workout";
import {
  func,
  getLongDateString,
  DisplayMode,
  DEFAULT_DISPLAYMODE,
  getVolumeStringFromWorkouts
} from "../lib/utils";

import { IconButton } from "./IconButton";
import { reducer, Action } from "../lib/reducer";
import { Week } from "./Week";
import { Workout } from "./Workout";

export interface PlanProps {
  plan: IPlan;
  goalDate: Date;
  savePlan: func<IPlan>;
  displayUnits: Units;
  onDisplayModeChanged?: func<DisplayMode>;
}

const WEEK_LENGTH = 7;

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

  let renderedWeeks: JSX.Element[] = [];
  for (
    let weekNumber = 1, tempWorkouts = [...workouts];
    tempWorkouts.length > 0;
    weekNumber++
  ) {

    const weekWorkouts = tempWorkouts.splice(0, WEEK_LENGTH);
    const volumeString = getVolumeStringFromWorkouts(
      weekWorkouts,
      units,
      displayUnits
    );

    const renderedWorkouts = weekWorkouts.map((w, indexInWeek) => {
      return (
        <Workout
          {...w}
          workoutCount={workouts.length}
          workoutIndex={indexInWeek}
          goalDate={goalDate}
          key={w.id}
          dispatch={dispatch}
          units={units}
          displayUnits={displayUnits}
          displayMode={displayMode}
      />
      );
    });

    renderedWeeks.push(
      <Week
        key={weekNumber}
        title={`Week ${weekNumber}`}
        subtitle={`Total volume: ${volumeString}`}
      >
        {renderedWorkouts}
      </Week>
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
