import React from "react";
import { InteractiveIcon } from "./InteractiveIcon";

export interface DragHandleProps {
  id: string;
  buttonClassName?: string;
  iconClassName?: string;
  draggableElement?: HTMLElement | null;
}

export function DragHandle(props: DragHandleProps) {
  return (
    <InteractiveIcon
      id={`drag-${props.id}`}
      title="Drag to reorder workouts"
      icon="arrows"
      as="div"
      className={props.buttonClassName}
      iconClassName={props.iconClassName}
      onDragStart={(event: React.DragEvent) => {
        event.dataTransfer.setData("id", props.id);
        event.dataTransfer.dropEffect = "move";
        if (props.draggableElement) {
          event.dataTransfer.setDragImage(props.draggableElement, 0, 0);
        }
      }}
    />
  );
}
