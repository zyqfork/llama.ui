import {
  ArrowUpIcon,
  PaperClipIcon,
  StopIcon,
} from '@heroicons/react/24/solid';
import { useState } from 'react';
import { classNames } from '../utils/misc';
import ChatInputExtraContextItem from './ChatInputExtraContextItem.tsx';
import { DropzoneArea } from './DropzoneArea.tsx';
import { ServerInfo } from './ServerInfo.tsx';
import { ChatExtraContextApi } from './useChatExtraContext.tsx';
import { ChatTextareaApi } from './useChatTextarea.ts';

export function ChatInput({
  textarea,
  extraContext,
  onSend,
  onStop,
  isGenerating,
}: {
  textarea: ChatTextareaApi;
  extraContext: ChatExtraContextApi;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
}) {
  const [isDrag, setIsDrag] = useState(false);

  return (
    <div
      role="group"
      aria-label="Chat input"
      className={classNames({
        'flex flex-col items-end pt-8 sticky bottom-0 bg-base-100': true,
        'opacity-50': isDrag, // simply visual feedback to inform user that the file will be accepted
      })}
    >
      <DropzoneArea
        extraContext={extraContext}
        setIsDrag={setIsDrag}
        disabled={isGenerating}
      >
        {!isGenerating && (
          <ChatInputExtraContextItem
            items={extraContext.items}
            removeItem={extraContext.removeItem}
          />
        )}

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
                onSend();
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
                htmlFor="file-upload"
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
                  onClick={onSend}
                  aria-label="Send message"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </DropzoneArea>
      <ServerInfo />
    </div>
  );
}
