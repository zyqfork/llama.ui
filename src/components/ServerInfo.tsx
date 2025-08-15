import { useAppContext } from '../utils/app.context';

export function ServerInfo() {
  const { serverProps } = useAppContext();
  const modalities = [];
  if (serverProps?.modalities?.audio) {
    modalities.push('audio');
  }
  if (serverProps?.modalities?.vision) {
    modalities.push('vision');
  }

  return (
    <div
      className="sticky bottom-0 w-full pt-1 pb-1 text-base-content/70 text-xs text-center"
      tabIndex={0}
      aria-description="Server information"
    >
      <span>
        <b>Llama.cpp</b> {serverProps?.build_info}
      </span>

      <span className="sm:ml-2">
        {modalities.length > 0 ? (
          <>
            <br className="sm:hidden" />
            <b>Supported modalities:</b> {modalities.join(', ')}
          </>
        ) : (
          ''
        )}
      </span>
    </div>
  );
}
