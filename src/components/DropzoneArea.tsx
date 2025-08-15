import { ClipboardEvent } from 'react';
import Dropzone from 'react-dropzone';
import { ChatExtraContextApi } from '../components/useChatExtraContext';
import { useAppContext } from '../utils/app.context';

export function DropzoneArea({
  children,
  extraContext,
  setIsDrag,
  disabled,
}: {
  children: React.ReactNode;
  extraContext: ChatExtraContextApi;
  disabled: boolean;
  setIsDrag: (flag: boolean) => void;
  onDragLeave?: () => void;
}) {
  const { config } = useAppContext();
  return (
    <Dropzone
      noClick
      onDrop={(files: File[]) => {
        setIsDrag(false);
        extraContext.onFileAdded(files);
      }}
      onDragEnter={() => setIsDrag(true)}
      onDragLeave={() => setIsDrag(false)}
      multiple={true}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          className="flex flex-col rounded-xl w-full"
          // when a file is pasted to the input, we handle it here
          // if a text is pasted, and if it is long text, we will convert it to a file
          onPasteCapture={(e: ClipboardEvent<HTMLInputElement>) => {
            const text = e.clipboardData.getData('text/plain');
            if (
              text.length > 0 &&
              config.pasteLongTextToFileLen > 0 &&
              text.length > config.pasteLongTextToFileLen
            ) {
              // if the text is too long, we will convert it to a file
              extraContext.addItems([
                {
                  type: 'context',
                  name: 'Pasted Content',
                  content: text,
                },
              ]);
              e.preventDefault();
              return;
            }

            // if a file is pasted, we will handle it here
            const files = Array.from(e.clipboardData.items)
              .filter((item) => item.kind === 'file')
              .map((item) => item.getAsFile())
              .filter((file) => file !== null);

            if (files.length > 0) {
              e.preventDefault();
              extraContext.onFileAdded(files);
            }
          }}
          {...getRootProps()}
        >
          <input
            id="file-upload"
            type="file"
            disabled={disabled}
            {...getInputProps()}
            hidden
          />

          {children}
        </div>
      )}
    </Dropzone>
  );
}
