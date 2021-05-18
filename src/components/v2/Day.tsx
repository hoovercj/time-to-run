import React, { useEffect, useState } from "react"
import { WorkoutInput } from "./WorkoutInput";
import { WeekDay } from "./model";
import { getDayOfWeekString } from "../../lib/utils";
import { InteractiveIcon } from "../InteractiveIcon";
import { formatWorkoutFromTemplate } from "../../lib/formatter";

export interface DayProps {
  className?: string;
  content: WeekDay;
  onSave?: (workout: WeekDay) => void;
}

export const Day = ({ className, content, onSave }: DayProps) => {
  const { date, workout } = content;
  const dateString = getDayOfWeekString(date);

  let workoutString = workout?.description ?? "";

  const [edit, setEdit] = useState(false);
  const [savedWorkoutString, setSavedWorkoutString] = useState(workoutString);
  const [editedWorkoutString, setEditedWorkoutString] = useState(workoutString);

  const editable = !!onSave && !!workout;

  useEffect(() => {
    setSavedWorkoutString(workoutString);
  }, [workoutString])

  const onSaveCallback = () => {
    // setSavedWorkoutString is called to allow Workout to function as a standalone component,
    // though it is likely that the wrapping component will pass in an updated workoutString prop as well.
    setSavedWorkoutString(editedWorkoutString);
    if (workout) {
      onSave?.({
        date,
        workout: {
          ...workout,
          description: editedWorkoutString,
        }
      });
    }
    setEdit(false);
  };

  const onCancelCallback = () => {
    setEdit(false);
  }

  const renderActions = () => {
    return !editable
      ? null
      : <>
        {!edit && <InteractiveIcon title="Edit" icon="edit" onClick={()=>setEdit(true)}/>}
        {edit && <>
          <InteractiveIcon title="Save" icon="save" onClick={onSaveCallback}/>
          <InteractiveIcon title="Cancel" icon="times" onClick={onCancelCallback}/>
          {/* TODO: Add Options: Copy workout, Delete, New Before/After ? */}
          {/* <button onClick={onOptionsCallback}>Options</button> */}
        </>}
      </>;
  }

  return (
    <div className={`workout-container ${className ?? ""}`}>
      <div className="workout-header-container">
        <span className="workout-header-date primary">{dateString}</span>
        {renderActions()}
      </div>
      <div className="workout-body-container">
        {editable && edit
          ? <WorkoutInput
            initialWorkoutString={savedWorkoutString}
            onWorkoutStringChanged={setEditedWorkoutString}
          />
          : <div>{formatWorkoutFromTemplate(savedWorkoutString)}</div>}
      </div>
    </div>
  );
}
