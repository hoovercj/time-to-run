import React, { useMemo, useCallback, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import "./Settings.scss";

import { Card } from "./Card";
import { func, DisplayMode } from "../lib/utils";
import { Filetype } from "../lib/exporter";
import { Units } from "../lib/workout";
import { FileInput } from "./FileInput";

export interface SettingsProps {
  date: Date;
  onDateChange: func<Date>;
  plans: Array<{ id: string; title: string; raceType: string }>;
  selectedPlan: string;
  onPlanChange: func<string>;
  units: Units;
  onUnitsChange: func<Units>;
  onDownload: func<Filetype>;
  onFileChange: func<FileList | null>;
  displayMode: DisplayMode;
}

export const Settings = React.memo(function (props: SettingsProps) {
  const {
    date,
    onDateChange,
    plans,
    selectedPlan,
    onPlanChange,
    units,
    onUnitsChange,
    onDownload,
    onFileChange,
    displayMode,
  } = props;

  const isEditMode = displayMode === "edit";

  const renderedUnits = useMemo(
    () => renderUnits(units, onUnitsChange, isEditMode),
    [units, onUnitsChange, isEditMode]
  );

  const datepicker = useRef<DatePicker>(null);
  const onDatepickerSelect = useCallback(() => {
    // By default, the datepicker loses focus when selecting a date,
    // this ensures focus is preserved
    setTimeout(() => datepicker.current && datepicker.current.setFocus(), 0);
  }, [datepicker]);

  const onDatepickerInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        // By default, the datepicker loses focus when the input is focused
        // and the escape key is pressed. this ensures focus is preserved
        setTimeout(() => {
          if (datepicker.current) {
            datepicker.current.setFocus();
            datepicker.current.setOpen(false, true);
          }
        }, 0);
      }
    },
    [datepicker]
  );

  const disabledTitle = isEditMode
    ? "Finish editing before changing or downloading plans."
    : "";
  return (
    <Card>
      <div className="settings">
        <div className="field">
          <label htmlFor="date-input">1. Set Goal Race Date</label>
          <DatePicker
            id={"date-input"}
            ref={datepicker}
            selected={date}
            onChange={(date) => date && onDateChange(date)}
            onSelect={onDatepickerSelect}
            onKeyDown={onDatepickerInputKeyDown}
            customInput={<input inputMode="none" />}
            disabled={isEditMode}
          />
        </div>
        <div className="field" title={disabledTitle}>
          <label htmlFor="plan-input">2. Select Race Plan</label>
          <select
            id="plan-input"
            value={selectedPlan}
            onChange={(e) => onPlanChange(e.target.value)}
            disabled={isEditMode}
          >
            {Object.entries(
              plans.reduce((groups, { id, raceType, title }) => {
                const group = groups[raceType] ?? [];
                group.push(
                  <option key={id} value={id}>
                    {title}
                  </option>
                );
                groups[raceType] = group;
                return groups;
              }, {} as Record<string, JSX.Element[]>)
            ).map(([raceType, options]) => {
              return <optgroup label={raceType} key={raceType}>{options}</optgroup>;
            })}
          </select>
          <label>Or Upload your Own</label>
          <FileInput
            id="plan-upload"
            text="Select file"
            accept=".json,.csv"
            onChange={onFileChange}
            disabled={isEditMode}
          />
        </div>
        {renderedUnits}
        <div className="field" title={disabledTitle}>
          <label id="download-label">4. Download</label>
          <button
            className="download-button"
            aria-labelledby="download-label download-ical-button"
            id="download-ical-button"
            onClick={() => onDownload("ical")}
            disabled={isEditMode}
          >
            iCal
          </button>
          <button
            className="download-button"
            aria-labelledby="download-label download-json-button"
            id="download-json-button"
            onClick={() => onDownload("json")}
            disabled={isEditMode}
          >
            json
          </button>
          <button
            className="download-button"
            aria-labelledby="download-label download-csv-button"
            id="download-csv-button"
            onClick={() => onDownload("csv")}
            disabled={isEditMode}
          >
            csv
          </button>
          {/* Hide this button until it can provide more value */}
          {/* <button
            className="download-button"
            onClick={() => onDownload("link")}
            disabled={isEditMode}
          >
            Copy link
          </button> */}
          <button
            className="download-button"
            aria-labelledby="download-label download-print-button"
            id="download-print-button"
            onClick={() => onDownload("print")}
            disabled={isEditMode}
          >
            print
          </button>
        </div>
      </div>
    </Card>
  );
});

function renderUnits(
  units: string,
  onUnitsChange: func<Units>,
  disabled?: boolean
) {
  return (
    <RadioGroup
      label="3. Set Distance Units"
      name="units"
      selectedValue={units}
      values={[
        {
          label: "Miles",
          value: "miles",
        },
        {
          label: "Kilometers",
          value: "kilometers",
        },
      ]}
      onSelectedChange={onUnitsChange}
      disabled={disabled}
    />
  );
}

interface RadioGroupProps {
  label: string;
  name: string;
  selectedValue: string;
  onSelectedChange: func<any>;
  values: { value: string; label: string }[];
  disabled?: boolean;
}

const RadioGroup = React.memo(function (props: RadioGroupProps) {
  const { label, name, selectedValue, values, onSelectedChange, disabled } =
    props;

  const labelId = `${name}-group-label`;

  const onRadioItemChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        onSelectedChange(event.target.value);
      }
    },
    [onSelectedChange]
  );

  return (
    <div className="field" role="radiogroup" aria-labelledby={labelId}>
      <label id={labelId}>{label}</label>
      {values.map(({ label, value }) => {
        return (
          <RadioItem
            key={value}
            label={label}
            value={value}
            name={name}
            checked={value === selectedValue}
            onChange={onRadioItemChange}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
});

interface RadioItemProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RadioItem = React.memo(function ({
  label,
  name,
  value,
  checked,
  disabled,
  onChange,
}: RadioItemProps) {
  const id = `${name}-input-${value}`;

  return (
    <div className="inline-field">
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={id} className="label-inline">
        {label}
      </label>
    </div>
  );
});
