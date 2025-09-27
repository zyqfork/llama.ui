import React, { useCallback, useEffect } from 'react';

const TO_BOTTOM = 100;
const DELAY = 80;

export function scrollSmooth(element: HTMLElement) {
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
}

export function useChatScroll(elementRef: React.RefObject<HTMLElement>) {
  const scrollImmediate = useCallback(
    (delay: number = DELAY) => {
      const element = elementRef?.current;
      if (!element) return;
      setTimeout(() => scrollSmooth(element), delay);
    },
    [elementRef]
  );

  const scrollToBottom = useCallback(() => {
    const element = elementRef?.current;
    if (!element) return;

    const { scrollHeight, scrollTop, clientHeight } = element;
    const spaceToBottom = scrollHeight - scrollTop - clientHeight;
    if (spaceToBottom < TO_BOTTOM) {
      scrollSmooth(element);
    }
  }, [elementRef]);

  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;

    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [elementRef, scrollToBottom]);

  return { scrollImmediate, scrollToBottom };
}
