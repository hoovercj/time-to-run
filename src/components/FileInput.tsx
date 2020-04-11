import React, { useCallback } from "react";

import "./FileInput.css";
import { func } from "../lib/utils";

export interface FileInputProps {
  id: string;
  text: string;
  onChange: func<FileList | null>;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export function FileInput({ text, disabled, onChange, id, accept, className: string }: FileInputProps) {
  const onChangeCallback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.files), [onChange]);
  return (
    <>
      <input
        type="file"
        id={id}
        name={id}
        accept={accept}
        onChange={onChangeCallback}
        disabled={disabled}
        className={"file-input"}
      />
      <label htmlFor={id} className="button">{text}</label>
    </>
  );
}
