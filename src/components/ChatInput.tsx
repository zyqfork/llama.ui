import { memo, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  LuArrowUp,
  LuCircleStop,
  LuMic,
  LuPaperclip,
  LuSquare,
} from 'react-icons/lu';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { useChatContext } from '../context/chat';
import { ChatTextareaApi, useChatTextarea } from '../hooks/useChatTextarea';
import { useFileUpload } from '../hooks/useFileUpload';
import SpeechToText, {
  IS_SPEECH_RECOGNITION_SUPPORTED,
  SpeechRecordCallback,
} from '../hooks/useSpeechToText';
import { MessageExtra } from '../types';
import { classNames, cleanCurrentUrl } from '../utils';
import { DropzoneArea } from './DropzoneArea';
import { Textarea } from './ui/textarea';

/**
 * If the current URL contains "?m=...", prefill the message input with the value.
 * If the current URL contains "?q=...", prefill and SEND the message.
 */
function getPrefilledContent() {
  const searchParams = new URL(window.location.href).searchParams;
  return searchParams.get('m') || searchParams.get('q') || '';
}
function isPrefilledSend() {
  const searchParams = new URL(window.location.href).searchParams;
  return searchParams.has('q');
}
function resetPrefilled() {
  cleanCurrentUrl(['m', 'q']);
}

type CallbackSendMessage = (
  content: string,
  extra: MessageExtra[] | undefined
) => Promise<boolean>;

export const ChatInput = memo(
  ({ convId, onSend }: { convId?: string; onSend: CallbackSendMessage }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const textarea: ChatTextareaApi = useChatTextarea(getPrefilledContent());
    const extraContext = useFileUpload();
    const { isGenerating, stopGenerating } = useChatContext();

    const isPending = useMemo(
      () => (!convId ? false : isGenerating(convId)),
      [convId, isGenerating]
    );

    const handleStop = useCallback(() => {
      if (!convId) return;
      stopGenerating(convId);
    }, [convId, stopGenerating]);

    const handleRecord: SpeechRecordCallback = useCallback(
      (text: string) => textarea.setValue(text),
      [textarea]
    );

    const sendNewMessage = async () => {
      const lastInpMsg = textarea.value();
      if (lastInpMsg.trim().length === 0) {
        toast.error(t('chatInput.errors.emptyMessage'));
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
      // set textarea with prefilled value
      const prefilled = getPrefilledContent();
      if (prefilled) {
        textarea.setValue(prefilled);
      }

      // send the prefilled message if needed
      // otherwise, focus on the input
      if (isPrefilledSend()) sendNewMessage();
      else textarea.focus();

      // no need to keep track of sendNewMessage
      resetPrefilled();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.location.href]);

    return (
      <div
        className="shrink-0 w-full lg:max-w-[900px] bg-base-100 mx-auto p-1 md:p-2"
        aria-label={t('chatInput.ariaLabels.chatInput')}
      >
        <DropzoneArea
          inputId="new-message-file-upload"
          extraContext={extraContext}
          disabled={isPending}
        >
          <div className="bg-base-200 flex flex-col lg:border-1 lg:border-base-content/30 rounded-lg shadow-sm md:shadow-md p-2">
            <Textarea
              // Default (mobile): Enable vertical resize, overflow auto for scrolling if needed
              // Large screens (lg:): Disable manual resize, apply max-height for autosize limit
              className="text-base p-0 px-2"
              variant="transparent"
              size="full"
              placeholder={t('chatInput.placeholder')}
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
              // Set a base height of 2 rows for mobile views
              // On lg+ screens, the hook will calculate and set the initial height anyway
              rows={2}
            />

            {/* buttons area */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2 items-center">
                <label
                  htmlFor="new-message-file-upload"
                  className={classNames({
                    'btn btn-ghost w-8 h-8 p-0 rounded-full': true,
                    'btn-disabled': isPending,
                  })}
                  aria-label={t('chatInput.ariaLabels.uploadFile')}
                  tabIndex={0}
                  role="button"
                >
                  <LuPaperclip className="lucide h-5 w-5" />
                </label>

                <Button
                  className="xl:hidden"
                  variant="ghost"
                  size="icon-rounded"
                  title={t('header.title.settings')}
                  aria-label={t('header.ariaLabels.settings')}
                  onClick={() => navigate('/settings')}
                >
                  <TbAdjustmentsHorizontal className="lucide h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center">
                {IS_SPEECH_RECOGNITION_SUPPORTED && !isPending && (
                  <SpeechToText onRecord={handleRecord}>
                    {({ isRecording, startRecording, stopRecording }) => (
                      <>
                        {!isRecording && (
                          <Button
                            className="mr-2"
                            variant="ghost"
                            size="icon-rounded"
                            onClick={startRecording}
                            title="Record"
                            aria-label="Start Recording"
                          >
                            <LuMic className="h-5 w-5" />
                          </Button>
                        )}
                        {isRecording && (
                          <Button
                            className="mr-2"
                            variant="ghost"
                            size="icon-rounded"
                            onClick={stopRecording}
                            title="Stop"
                            aria-label="Stop Recording"
                          >
                            <LuCircleStop className="h-5 w-5" />
                          </Button>
                        )}
                      </>
                    )}
                  </SpeechToText>
                )}

                {isPending && (
                  <Button
                    variant="neutral"
                    size="icon-rounded"
                    onClick={handleStop}
                  >
                    <LuSquare className="lucide h-4 w-4" fill="currentColor" />
                  </Button>
                )}

                {!isPending && (
                  <Button
                    variant="neutral"
                    size="icon-rounded"
                    onClick={sendNewMessage}
                    aria-label={t('chatInput.ariaLabels.send')}
                  >
                    <LuArrowUp className="lucide h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DropzoneArea>
      </div>
    );
  }
);
