import {
  getCaretTextOffset,
  setCaretToTextOffset,
} from "./caret";

const NON_TEXT_CLIPBOARD_CONTENT_SELECTOR =
  "script, style, template, noscript";

function removeNonTextClipboardContent(root: ParentNode) {
  root
    .querySelectorAll(NON_TEXT_CLIPBOARD_CONTENT_SELECTOR)
    .forEach((node) => node.remove());
}

function getPlainTextFromHtml(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  removeNonTextClipboardContent(template.content);
  return template.content.textContent ?? "";
}

function getPlainTextFromElement(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  removeNonTextClipboardContent(clone);
  return clone.textContent ?? "";
}

function hasNonTextChildNodes(element: HTMLElement) {
  return Array.from(element.childNodes).some(
    (childNode) => childNode.nodeType !== Node.TEXT_NODE,
  );
}

export function getClipboardPlainText(clipboardData: DataTransfer) {
  const plainText = clipboardData.getData("text/plain");
  if (plainText) {
    return plainText;
  }

  const html = clipboardData.getData("text/html");
  if (!html) {
    return "";
  }

  return getPlainTextFromHtml(html);
}

export function sanitizeContentEditableToPlainText(element: HTMLElement) {
  const plainText = getPlainTextFromElement(element);
  const needsDomSanitization =
    hasNonTextChildNodes(element) || element.textContent !== plainText;

  if (!needsDomSanitization) {
    return plainText;
  }

  const caretOffset = getCaretTextOffset(element) ?? plainText.length;
  element.textContent = plainText;

  if (document.activeElement === element) {
    setCaretToTextOffset(
      element,
      Math.min(caretOffset, plainText.length),
    );
  }

  return plainText;
}
