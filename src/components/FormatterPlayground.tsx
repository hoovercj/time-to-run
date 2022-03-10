import React from "react";
import * as Formatter from "../lib/formatter";
import { Units } from "../lib/workout";
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { ISelection, saveSelection, restoreSelection } from "../lib/selection";

export interface FormatterPlaygroundProps {
  defaultValue: string;
  inputUnits: Units;
  outputUnits: Units;
  editable: boolean;
}

export const FormatterPlayground = (props: FormatterPlaygroundProps) => {
  const { defaultValue, inputUnits, outputUnits, editable } = props;

  const [inputValue, setInputValue] = React.useState(props.defaultValue);
  const selectionToRestore = React.useRef<ISelection | null>(null);

  React.useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const onInputChanged = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setInputValue(event.target.value);
  }, []);

  const contentEditableRef = React.useRef<HTMLElement>(null);
  const onContentEditableChanged = React.useCallback((event: ContentEditableEvent) => {
    if (!contentEditableRef.current) {
      return;
    }

    const eventHtml = event.target.value;
    const newHtml = Formatter.formatTemplateFromText(contentEditableRef.current.innerText);

    if (newHtml !== eventHtml) {
      selectionToRestore.current = saveSelection(contentEditableRef.current);
    } else {
      // TODO: is this correct?
      selectionToRestore.current = null;
    }

    setInputValue(Formatter.formatTemplateFromText(contentEditableRef.current.innerText));
  }, []);

  React.useEffect(() => {
    if (!contentEditableRef.current || !selectionToRestore.current) {
      return;
    }

    restoreSelection(contentEditableRef.current, selectionToRestore.current);
    selectionToRestore.current = null;
  }, [inputValue]);

  const formattedTextValue = React.useMemo(() => {
    return Formatter.formatWorkoutFromTemplate(inputValue, inputUnits, outputUnits);
  }, [inputUnits, inputValue, outputUnits]);

  const formattedHTMLValue = React.useMemo(() => {
    return Formatter.formatHtmlFromTemplate(inputValue, inputUnits, outputUnits);
  }, [inputUnits, inputValue, outputUnits]);

  return <>
    <div><input value={inputValue} onChange={onInputChanged} /></div>
    <div><span>{formattedTextValue}</span></div>
    <ContentEditable
      innerRef={contentEditableRef}
      html={formattedHTMLValue}
      disabled={!editable}
      onChange={onContentEditableChanged}
    />
  </>
}
