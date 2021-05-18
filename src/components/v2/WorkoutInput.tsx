import React, { useEffect, useState } from "react";
import { Mention, MentionsInput, DataFunc } from "react-mentions";
import defaultStyle from "./WorkoutInputMentionInputStyle";
import defaultMentionStyle from "./WorkoutInputMentionStyle";

// ^^__5 miles__~~ becomes #5D
const MarkupToWorkoutString = (markup: string): string => {
  return markup.replaceAll(/\^\^__(\d+)\s?\w*__~~/g, (match, distance) => `#${distance}D`);
}

// #5D becomes ^^__5 miles__~~
const WorkoutStringToMarkup = (workout: string): string => {
  // TODO: improve regex to allow decimals
  return workout.replaceAll(/#(\d+)D/g, (match, distance) => `^^__${distance} miles__~~`)
}

export interface WorkoutInputProps {
  initialWorkoutString: string;
  onWorkoutStringChanged: (value: string) => void;
}

export const WorkoutInput = ({ initialWorkoutString, onWorkoutStringChanged }: WorkoutInputProps) => {
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(WorkoutStringToMarkup(initialWorkoutString ?? ""));
  }, [initialWorkoutString])

  const onChange = React.useCallback((_, newValue, newPlainTextValue, mentions) => {
    setValue(newValue);
    onWorkoutStringChanged(MarkupToWorkoutString(newValue));
  }, [onWorkoutStringChanged]);

  const filter = React.useCallback<DataFunc>((query, callback) => {
    return [{
      id: "1",
      display: `${query} miles`,
      dataTest: `#${query}D`
    }]
  }, []);

  return (
    <div>
      <MentionsInput
        value={value}
        onChange={onChange}
        style={defaultStyle}
      >
        <Mention
          // first (outer) capture group is the part to be replaced on completion
          // second (inner) capture group is for extracting the search query
          // Note: Without $, suggestions appear everywhere in the input after a number.
          // $ makes it so they appear only immediately after
          // TODO: allow adding "miles" or "km" " or "kilometers" as part of the trigger
          trigger={/((\d+)\s?)$/}
          data={filter}
          style={defaultMentionStyle}
          appendSpaceOnAdd={true}
          markup="^^____display____~~"
        />
      </MentionsInput>
      {/* TODO: Add tests for the conversion functions */}
      {/* Add to the story so these values can be previewed somehow */}
      {/* <div>{value}</div>
      <div>{MarkupToWorkoutString(value)}</div>
      <div>{WorkoutStringToMarkup(MarkupToWorkoutString(value))}</div> */}
    </div>
  );
}