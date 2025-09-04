import {
  Bars3Icon,
  Cog8ToothIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/app.context';
import { useInferenceContext } from '../context/inference.context';
import { FilterableDropdown } from '../utils/common';
import { useMessageContext } from '../context/message.context';
import lang from '../lang/en.json';

export default function Header() {
  const navigate = useNavigate();
  const {
    config,
    config: { model },
    setShowSettings,
    saveConfig,
  } = useAppContext();
  const { models } = useInferenceContext();
  const { viewingChat } = useMessageContext();

  const currConv = useMemo(() => viewingChat?.conv ?? null, [viewingChat]);
  const title = useMemo(
    () => (currConv ? currConv.name : lang['header.title.noChat']),
    [currConv]
  );

  const selectedModel = useMemo(() => {
    const selectedModel = models.find((m) => m.id === model);
    return selectedModel ? selectedModel.name : '';
  }, [models, model]);

  return (
    <header className="flex flex-col gap-2 justify-center md:py-2 sticky top-0 z-10">
      <section className="flex flex-row items-center xl:hidden">
        {/* open sidebar button */}
        <label htmlFor="toggle-drawer" className="btn btn-ghost w-8 h-8 p-0">
          <Bars3Icon className="h-5 w-5" />
        </label>

        {/* spacer */}
        <label
          className="grow font-medium truncate text-center cursor-pointer px-4"
          aria-label={title}
          role="button"
          onClick={() => {
            if (currConv) navigate(`/chat/${currConv.id}`);
            else navigate('/');
          }}
        >
          {title}
        </label>

        {/* new conversation button */}
        <button
          className="btn btn-ghost w-8 h-8 p-0 rounded-full"
          onClick={() => navigate('/')}
          aria-label="New conversation"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      </section>

      <section className="flex flex-row items-center">
        {/* model information */}
        <FilterableDropdown
          className="ml-2 px-1 sm:px-4 py-0"
          entity="Model"
          options={models.map((model) => ({
            value: model.id,
            label: model.name,
          }))}
          currentValue={
            <span className="max-w-56 sm:max-w-80 truncate text-nowrap font-semibold">
              {selectedModel}
            </span>
          }
          renderOption={(option) => <span>{option.label}</span>}
          isSelected={(option) => model === option.value}
          onSelect={(option) =>
            saveConfig({
              ...config,
              model: option.value,
            })
          }
        />

        {/* spacer */}
        <div className="grow"></div>

        {/* action buttons (top right) */}
        <div className="flex items-center">
          <button
            className="btn btn-ghost w-8 h-8 p-0 rounded-full"
            title="Settings"
            aria-label="Open settings menu"
            onClick={() => setShowSettings(true)}
          >
            {/* settings button */}
            <Cog8ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </section>
    </header>
  );
}
