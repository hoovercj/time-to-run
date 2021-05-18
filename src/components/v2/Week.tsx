import React, { useRef, useState } from "react";
import "./Week.scss";

import { WeekDays, WeekDay } from "./model";
import { Day } from "./Day";
import { Card } from "../Card";
import { getShortDateStringWithoutYear } from "../../lib/utils";

export type DisplayMode = "row" | "column" | "auto";

export interface WeekProps {
  display?: DisplayMode
  weekNumber: number;
  days: WeekDays;
  onSave: (day: WeekDay) => void;
}

export const Week = (props: WeekProps) => {
  const { weekNumber, days, onSave, display } = props;
  const isDisplayAuto = !display || display === "auto";

  // Consider lifting "auto" up to the "weeks" level
  const mediaQuery = useRef(window.matchMedia("(max-width: 768px)"));
  const initialDisplayMode = !isDisplayAuto
    ? display!
    : mediaQuery.current.matches
      ? "column"
      : "row";

  const [displayMode, setDisplayMode] = useState<Omit<DisplayMode,"auto">>(initialDisplayMode);

  React.useLayoutEffect(() => {
    const currentMediaQuery = mediaQuery.current;
    let listener: (ev: MediaQueryListEvent | MediaQueryList) => void;
    if (isDisplayAuto) {
      listener = (e) => {
        e.matches
          ? setDisplayMode("column")
          : setDisplayMode("row");
      };

      currentMediaQuery.addEventListener("change", listener);
      listener(currentMediaQuery);
    } else {
      setDisplayMode(display!);
    }

    return () => {
      currentMediaQuery && listener && currentMediaQuery.removeEventListener("change", listener);
    };
  }, [isDisplayAuto, display]);

  const firstDate = days[0].date;
  const lastDate = days[days.length - 1].date;
  const volume = days.reduce((volume, day) => {
    return day.workout ? volume + day.workout.totalDistance : volume;
  }, 0);

  // TODO: Evaluate if this is beneficial or not
  const daysToRender = days.filter(day => displayMode === "row" ? true : !!day.workout);

  return (
    <Card className={`week-container ${displayMode}`}>
      <h3 className="week-header-container">
        <span className="primary title">Week {weekNumber}</span>
        <small className="primary subtitle">{getShortDateStringWithoutYear(firstDate)}-{getShortDateStringWithoutYear(lastDate)}</small>
        <small className="subtitle">Volume: {volume}</small>
      </h3>
        <div className="week-body-container">
          {daysToRender.map(day => (
            <div key={day.date.getTime()} className="week-day-container">
              <Day
                className="week-body-day"
                content={day}
                onSave={onSave}
              />
            </div>
          ))}
        </div>
    </Card>
  );
}