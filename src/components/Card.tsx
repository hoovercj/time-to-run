import React from "react";

import "./Card.scss";

export interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={`card ${className ||""}`}>
      {children}
    </div>
  );
}