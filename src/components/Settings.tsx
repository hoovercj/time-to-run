import React from "react";

import "./Settings.css";

import { Card } from "./Card";
import { getDateInputValueString } from "../lib/utils";
import { Filetype } from "../lib/exporter";
import { Units } from "../lib/workout";

type func<T> = (value: T) => void;

export interface SettingsProps {
  date: Date;
  onDateChange: func<Date>;
  plans: string[];
  selectedPlan: string;
  onPlanChange: func<string>;
  units: Units;
  onUnitsChange: func<Units>;
  onDownload: func<Filetype>;
}

export function Settings(props: SettingsProps) {
  const {
    date,
    onDateChange,
    plans,
    selectedPlan,
    onPlanChange,
    units,
    onUnitsChange,
    onDownload,
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
          <select id="plan-input" value={selectedPlan} onChange={(e) => onPlanChange(e.target.value)}>
            {plans.map(plan => {
                return (
                  <option key={plan} value={plan}>{plan}</option>
                );
            })}
          </select>
        </div>
        {renderUnits(units, onUnitsChange)}
        <div className="field">
          <label id="download-label">4. Download</label>
          <button className="download-button" aria-labelledby="download-label download-ical-button" id="download-ical-button" onClick={() => onDownload("ical")}>iCal</button>
          <button className="download-button" aria-labelledby="download-label download-json-button" id="download-json-button" onClick={() => onDownload("json")}>json</button>
          {/* <button className="download-button" aria-labelledby="download-label download-csv-button" id="download-csv-button" onClick={() => onDownload("csv")}>csv</button> */}
        </div>
      </div>
    </Card>
  );
}

function renderUnits(units: string, onUnitsChange: func<Units>) {
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
      onSelectedChange: (value: string) => onUnitsChange(value as Units),
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
