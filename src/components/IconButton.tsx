import React from "react";

import "./IconButton.css";

import { func } from "../lib/utils";

import { ReactComponent as SaveIcon } from "../icons/save.svg";
import { ReactComponent as EditIcon } from "../icons/edit.svg";
import { ReactComponent as TimesIcon } from "../icons/times.svg";
import { ReactComponent as PlusIcon } from "../icons/plus.svg";
import { ReactComponent as MinusIcon } from "../icons/minus.svg";
import { ReactComponent as ChevronUpIcon } from "../icons/chevron-up.svg";
import { ReactComponent as ChevronDownIcon } from "../icons/chevron-down.svg";

export type Icon = "save" | "edit" | "times" | "plus" | "minus" | "chevronup" | "chevrondown";

const iconToComponent: {[key in Icon]: React.FunctionComponent<React.SVGProps<SVGSVGElement>>} = {
  save: SaveIcon,
  edit: EditIcon,
  times: TimesIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  chevronup: ChevronUpIcon,
  chevrondown: ChevronDownIcon,
}


export interface IconButtonProps {
  buttonClassName?: string;
  iconClassName?: string;
  title: string;
  onClick: func<void>;
  icon: Icon;
}

export function IconButton(props: IconButtonProps) {
  const buttonClassName = `button icon-button ${props.buttonClassName || ""}`.trim();
  const iconClassName = `icon ${props.iconClassName || ""}`.trim();

  const IconComponent = iconToComponent[props.icon];

  return (
    <button
      onClick={() => props.onClick()}
      title={props.title}
      className={buttonClassName}
    >
      <IconComponent className={iconClassName} />
    </button>
  );
}
