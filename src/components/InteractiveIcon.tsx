import React from "react";

import "./InteractiveIcon.scss";

import { func } from "../lib/utils";

import { ReactComponent as SaveIcon } from "../icons/save.svg";
import { ReactComponent as EditIcon } from "../icons/edit.svg";
import { ReactComponent as TimesIcon } from "../icons/times.svg";
import { ReactComponent as PlusIcon } from "../icons/plus.svg";
import { ReactComponent as MinusIcon } from "../icons/minus.svg";
import { ReactComponent as ChevronUpIcon } from "../icons/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../icons/chevron-down.svg";
import { ReactComponent as ArrowsIcon } from "../icons/arrows.svg";

export type Icon = "save" | "edit" | "times" | "plus" | "minus" | "chevronup" | "chevrondown" | "arrows";

const iconToComponent: {[key in Icon]: React.FunctionComponent<React.SVGProps<SVGSVGElement>>} = {
  save: SaveIcon,
  edit: EditIcon,
  times: TimesIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  chevronup: ChevronUpIcon,
  chevrondown: ChevronDownIcon,
  arrows: ArrowsIcon,
}

// TODO: Consider extending HTMLButton props
// OR adding a comment why it was decided NOT
// to extend them
export interface InteractiveIconProps {
  title: string;
  icon: Icon;
  className?: string;
  iconClassName?: string;
  onClick?: func<void>;
  disabled?: boolean;
  elementRef?: React.RefObject<HTMLElement>;
  id?: string;
  onDragStart?: React.DragEventHandler;
  as?: any;
}



export function InteractiveIcon(props: InteractiveIconProps) {
  const className = `button-clear interactive-icon ${props.className || ""}`.trim();
  const iconClassName = `icon ${props.iconClassName || ""}`.trim();

  const IconComponent = iconToComponent[props.icon];

  const Component = props.as ?? 'button';

  return (
    <Component
      id={props.id}
      onClick={() => props.onClick?.()}
      title={props.title}
      className={className}
      disabled={props.disabled}
      ref={props.elementRef}
      draggable={!!props.onDragStart}
      onDragStart={props.onDragStart}
    >
      <IconComponent className={iconClassName} />
    </Component>
  );
}
