import { ClipboardEvent, useState } from 'react';
import Dropzone from 'react-dropzone';
import { ChatExtraContextApi } from '../components/useChatExtraContext';
import { useAppContext } from '../utils/app.context';
import { classNames } from '../utils/misc';

export function DropzoneArea({
  children,
  extraContext,
  disabled,
}: {
  children: React.ReactNode;
  extraContext: ChatExtraContextApi;
  disabled: boolean;
  onDragLeave?: () => void;
}) {
  const { config } = useAppContext();
  const [isDrag, setIsDrag] = useState(false);
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
          className={classNames({
            'flex flex-col rounded-xl w-full': true,
            'opacity-50': isDrag, // simply visual feedback to inform user that the file will be accepted
          })}
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
