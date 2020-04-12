import React from "react";

import { Card } from "./Card";

interface WeekProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function Week({ title, subtitle, children }: WeekProps) {
  return (
    <Card>
      <h3>
        <span className="primary">{title}</span>&nbsp;&nbsp;
        <small>{subtitle}</small>
      </h3>
      <div className="workouts-container">{children}</div>
    </Card>
  );
}