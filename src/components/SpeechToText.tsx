import {
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export type SpeechRecordCallback = (text: string) => void;

const userLanguage =
  navigator.languages && navigator.languages.length > 0
    ? navigator.languages[0]
    : navigator.language
      ? navigator.language
      : 'en-US';

const BrowserSpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export const IS_SPEECH_RECOGNITION_SUPPORTED =
  (window.SpeechRecognition || window.webkitSpeechRecognition) !== undefined;

interface SpeechToTextProps {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onRecord?: SpeechRecordCallback;
}

interface SpeechToTextState {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
}

const useSpeechToText = ({
  lang = userLanguage,
  continuous = true,
  interimResults = true,
  onRecord,
}: SpeechToTextProps = {}): SpeechToTextState => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!BrowserSpeechRecognition) {
      console.error('Speech Recognition not supported');
      return;
    }

    // Clean up previous recognition
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
    }

    const recognition = new BrowserSpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      if (!event?.results) return;

      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = Array.from(result)
          .map((alt) => alt.transcript)
          .join(' ');

        if (result.isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setTranscript(final + interim);
      onRecord?.(final + interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error: ', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current = null;
      }
    };
  }, [lang, continuous, interimResults, onRecord]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  };
};

const SpeechToText = forwardRef<
  SpeechToTextState,
  SpeechToTextProps & { children: (props: SpeechToTextState) => ReactNode }
>(({ children, lang, continuous, interimResults }, ref) => {
  const { isRecording, transcript, startRecording, stopRecording } =
    useSpeechToText({
      lang,
      continuous,
      interimResults,
    });

  useImperativeHandle(
    ref,
    () => ({
      isRecording,
      transcript,
      startRecording,
      stopRecording,
    }),
    [isRecording, startRecording, stopRecording, transcript]
  );

  return (
    <Fragment>
      {children({ isRecording, transcript, startRecording, stopRecording })}
    </Fragment>
  );
});

export default SpeechToText;
