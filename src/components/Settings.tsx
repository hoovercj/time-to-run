import React from "react";

import "./Settings.css";

import { Card } from "./Card";
import { getDateInputValueString } from "../lib/utils";

type func<T> = (value: T) => void;

export interface SettingsProps {
  date: Date;
  onDateChange: func<Date>;
  plan: string;
  onPlanChange: func<string>;
  units: string;
  onUnitsChange: func<string>;
}

export function Settings(props: SettingsProps) {
  const {
    date,
    onDateChange,
    // plan,
    // onPlanChange,
    units,
    onUnitsChange
  } = props;
  return (
    <Card>
      <div className="settings">
        <div className="field">
          <label htmlFor="date-input">1. Goal Race Date</label>
          <input
            id="date-input"
            type="date"
            value={getDateInputValueString(date)}
            onChange={e => {
              onDateChange(e.target.valueAsDate as Date);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="plan-input">2. Race Plan</label>
          <select id="plan-input">
            <option value="default">Default</option>
          </select>
        </div>
        {renderUnits(units, onUnitsChange)}
        <div className="field">
          <label htmlFor="download-input">4. Download .ical</label>
          <button id="download-input">Download</button>
        </div>
      </div>
    </Card>
  );
}

function renderUnits(units: string, onUnitsChange: func<string>) {
  return RadioGroup({
      label: "3. Units",
      name: "units",
      selectedValue: units,
      values: [{
        label: "Miles",
        value: "miles",
      }, {
        label: "Kilometers",
        value: "kilometers",
      }],
      onSelectedChange: onUnitsChange,
    });
}

interface RadioGroupProps {
  label: string;
  name: string;
  selectedValue: string;
  onSelectedChange: func<string>;
  values: { value: string; label: string }[];
}

function RadioGroup(props: RadioGroupProps) {
  const { label, name, selectedValue, values, onSelectedChange } = props;

  const labelId = `${name}-group-label`;

  const onRadioItemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onSelectedChange(event.target.value);
    }
  };

  return (
    <div className="field" role="radiogroup" aria-labelledby={labelId}>
      <div id={labelId}>{label}</div>
      {values.map(({ label, value }) => {
        return (
          <RadioItem
            key={value}
            label={label}
            value={value}
            name={name}
            checked={value === selectedValue}
            onChange={onRadioItemChange}
          />
        );
      })}
    </div>
  );
}

interface RadioItemProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function RadioItem({ label, name, value, checked, onChange }: RadioItemProps) {
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
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
