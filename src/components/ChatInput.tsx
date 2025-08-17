import {
  ArrowUpIcon,
  PaperClipIcon,
  StopIcon,
} from '@heroicons/react/24/solid';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useVSCodeContext } from '../utils/llama-vscode.ts';
import { classNames, cleanCurrentUrl } from '../utils/misc';
import { MessageExtra } from '../utils/types.ts';
import { DropzoneArea } from './DropzoneArea.tsx';
import { useChatExtraContext } from './useChatExtraContext.tsx';
import { ChatTextareaApi, useChatTextarea } from './useChatTextarea.ts';

/**
 * If the current URL contains "?m=...", prefill the message input with the value.
 * If the current URL contains "?q=...", prefill and SEND the message.
 */
const prefilledMsg = {
  content() {
    const url = new URL(window.location.href);
    return url.searchParams.get('m') ?? url.searchParams.get('q') ?? '';
  },
  shouldSend() {
    const url = new URL(window.location.href);
    return url.searchParams.has('q');
  },
  clear() {
    cleanCurrentUrl(['m', 'q']);
  },
};

export function ChatInput({
  onSend,
  onStop,
  isGenerating,
}: {
  onSend: (
    content: string,
    extra: MessageExtra[] | undefined
  ) => Promise<boolean>;
  onStop: () => void;
  isGenerating: boolean;
}) {
  const textarea: ChatTextareaApi = useChatTextarea(prefilledMsg.content());
  const extraContext = useChatExtraContext();
  useVSCodeContext(textarea, extraContext);

  const sendNewMessage = async () => {
    const lastInpMsg = textarea.value();
    if (lastInpMsg.trim().length === 0) {
      toast.error('Please enter a message');
      return;
    }

    textarea.setValue('');
    if (!(await onSend(lastInpMsg, extraContext.items))) {
      // restore the input message if failed
      textarea.setValue(lastInpMsg);
    }
    // OK
    extraContext.clearItems();
  };

  // for vscode context
  textarea.refOnSubmit.current = sendNewMessage;

  useEffect(() => {
    if (prefilledMsg.shouldSend()) {
      // send the prefilled message if needed
      sendNewMessage();
    } else {
      // otherwise, focus on the input
      textarea.focus();
    }
    prefilledMsg.clear();
    // no need to keep track of sendNewMessage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textarea.ref]);

  return (
    <DropzoneArea
      inputId="new-message-file-upload"
      extraContext={extraContext}
      disabled={isGenerating}
    >
      <div className="bg-base-200 border-1 border-base-content/30 rounded-lg p-2 flex flex-col">
        <textarea
          // Default (mobile): Enable vertical resize, overflow auto for scrolling if needed
          // Large screens (lg:): Disable manual resize, apply max-height for autosize limit
          className="w-full focus:outline-none px-2 border-none focus:ring-0 resize-none"
          placeholder="Type a message (Shift+Enter to add a new line)"
          ref={textarea.ref}
          onInput={textarea.onInput} // Hook's input handler (will only resize height on lg+ screens)
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendNewMessage();
            }
          }}
          id="msg-input"
          dir="auto"
          // Set a base height of 2 rows for mobile views
          // On lg+ screens, the hook will calculate and set the initial height anyway
          rows={2}
        ></textarea>

        {/* buttons area */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <label
              htmlFor="new-message-file-upload"
              className={classNames({
                'btn w-8 h-8 p-0 rounded-full': true,
                'btn-disabled': isGenerating,
              })}
              aria-label="Upload file"
              tabIndex={0}
              role="button"
            >
              <PaperClipIcon className="h-5 w-5" />
            </label>
          </div>

          <div className="flex items-center">
            {isGenerating && (
              <button
                className="btn btn-neutral w-8 h-8 p-0 rounded-full"
                onClick={onStop}
              >
                <StopIcon className="h-5 w-5" />
              </button>
            )}

            {!isGenerating && (
              <button
                className="btn btn-neutral w-8 h-8 p-0 rounded-full"
                onClick={sendNewMessage}
                aria-label="Send message"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DropzoneArea>
  );
}
