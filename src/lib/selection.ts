// This solution is based on a StackOverflow answer by Tim Down:
// https://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376

export interface ISelection {
  start: number;
  end: number;
}

export const saveSelection = (container: HTMLElement): ISelection => {
  const range =
    window.getSelection()?.getRangeAt(0) ?? createEmptyRangeAtStart(container);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;

  return {
    start: start,
    end: start + range.toString().length,
  };
};

export const restoreSelection = (
  container: HTMLElement,
  previousSelection: ISelection
) => {
  const currentSelection = window.getSelection();
  if (!currentSelection) {
    return;
  }

  let charIndex = 0;
  const range = document.createRange();
  range.setStart(container, 0);
  range.collapse(true);
  var nodeStack: Node[] = [container];
  let node: Node;
  let foundStart = false;
  let stop = false;

  while (!stop && (node = nodeStack.pop()!)) {
    if (node.nodeType === Node.TEXT_NODE) {
      var nextCharIndex = charIndex + (node as Text).length;
      if (
        !foundStart &&
        previousSelection.start >= charIndex &&
        previousSelection.start <= nextCharIndex
      ) {
        range.setStart(node, previousSelection.start - charIndex);
        foundStart = true;
      }
      if (
        foundStart &&
        previousSelection.end >= charIndex &&
        previousSelection.end <= nextCharIndex
      ) {
        range.setEnd(node, previousSelection.end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      var i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  currentSelection.removeAllRanges();
  currentSelection.addRange(range);
};

const createEmptyRangeAtStart = (container: HTMLElement): Range => {
  const range = document.createRange();
  range.setStart(container, 0);
  range.collapse(true);

  return range;
};
