export function setCaretToEnd(element: HTMLElement) {
  element.focus();

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getCaretTextOffset(element: HTMLElement) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) {
    return null;
  }

  const prefixRange = range.cloneRange();
  prefixRange.selectNodeContents(element);
  prefixRange.setEnd(range.startContainer, range.startOffset);
  return prefixRange.toString().length;
}

export function setCaretToTextOffset(element: HTMLElement, offset: number) {
  element.focus();

  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  const targetOffset = Math.max(0, offset);
  let remainingOffset = targetOffset;
  const textWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
  );
  let currentNode = textWalker.nextNode();

  while (currentNode) {
    const textLength = currentNode.textContent?.length ?? 0;
    if (remainingOffset <= textLength) {
      range.setStart(currentNode, remainingOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    remainingOffset -= textLength;
    currentNode = textWalker.nextNode();
  }

  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function insertPlainTextAtSelection(
  element: HTMLElement,
  text: string,
) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    const nextText = `${element.textContent ?? ""}${text}`;
    element.textContent = nextText;
    setCaretToTextOffset(element, nextText.length);
    return nextText;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.commonAncestorContainer)) {
    const nextText = `${element.textContent ?? ""}${text}`;
    element.textContent = nextText;
    setCaretToTextOffset(element, nextText.length);
    return nextText;
  }

  range.deleteContents();

  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStart(textNode, text.length);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  return element.textContent ?? "";
}
