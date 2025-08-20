// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isString = (x: any) => !!x.toLowerCase;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isBoolean = (x: any) => x === true || x === false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNumeric = (n: any) => !isString(n) && !isNaN(n) && !isBoolean(n);
export const escapeAttr = (str: string) =>
  str.replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// copy text to clipboard
export const copyStr = (textToCopy: string) => {
  // Navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy);
  } else {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    // Move textarea out of the viewport so it's not visible
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.prepend(textArea);
    textArea.select();
    document.execCommand('copy');
  }
};

export function classNames(classes: Record<string, boolean>): string {
  return Object.entries(classes)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(' ');
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const throttle = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  let isWaiting = false;

  return (...args: T) => {
    if (isWaiting) {
      return;
    }

    callback(...args);
    isWaiting = true;

    setTimeout(() => {
      isWaiting = false;
    }, delay);
  };
};

export const cleanCurrentUrl = (removeQueryParams: string[]) => {
  const url = new URL(window.location.href);
  removeQueryParams.forEach((param) => {
    url.searchParams.delete(param);
  });
  window.history.replaceState({}, '', url.toString());
};

export const splitMessageContent = (content: string | null) => {
  if (content == null || content.trim().length === 0) return { content };

  const REGEX_THINK_OPEN = /<think>|<\|channel\|>analysis<\|message\|>/;
  const REGEX_THINK_CLOSE =
    /<\/think>|<\|start\|>assistant<\|channel\|>final<\|message\|>/;

  let actualContent = '';
  let thought = '';
  let thinkSplit = content.split(REGEX_THINK_OPEN, 2);
  actualContent += thinkSplit[0];
  while (thinkSplit[1] !== undefined) {
    // <think> tag found
    thinkSplit = thinkSplit[1].split(REGEX_THINK_CLOSE, 2);
    thought += thinkSplit[0];
    if (thinkSplit[1] !== undefined) {
      // </think> closing tag found
      thinkSplit = thinkSplit[1].split(REGEX_THINK_OPEN, 2);
      actualContent += thinkSplit[0];
    }
  }
  return { content: actualContent, reasoning_content: thought };
};
