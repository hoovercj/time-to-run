import React from "react";
import { Card } from "./Card";

import "./Week.scss";

interface WeekProps {
  title: string;
  dateString?: string;
  volumeString?: string;
  renderAsGrid?: boolean;
  children: React.ReactNode;
}

// TODO: Separators in normal vs grid mode at different screen widths
// Preferably do it all in CSS
// Proposal: render a grid and a normal header
// In "normal" mode, the normal header is always rendered
// In "grid" mode, both are rendered, and media queries determine which is visible
// TODO: Handle the action buttons
// TODO: Add a toggle control which is hidden at narrow widths

export function Week({ title, dateString, volumeString, children, renderAsGrid }: WeekProps) {
  return (
    <Card className={`week ${renderAsGrid ? "grid" : ""}`}>
      <h3>
        <span className="primary title">{title}</span>
        {dateString && <small className="subtitle primary grid">{dateString}</small>}
        {dateString && <small className="subtitle primary">({dateString})</small>}
        { volumeString && <small className="subtitle">Volume: {volumeString}</small>}
        { renderAsGrid && volumeString && <small className="subtitle grid">{volumeString}</small>}
      </h3>
      <div className="workouts-container">{children}</div>
    </Card>
  );
}