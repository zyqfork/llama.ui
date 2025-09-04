import { Bars3Icon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useAppContext } from '../context/app.context';
import { useInferenceContext } from '../context/inference.context';
import { FilterableDropdown } from '../utils/common';

export default function Header() {
  const {
    config,
    config: { model },
    setShowSettings,
    saveConfig,
  } = useAppContext();
  const { models } = useInferenceContext();

  const selectedModel = useMemo(() => {
    const selectedModel = models.find((m) => m.id === model);
    return selectedModel ? selectedModel.name : '';
  }, [models, model]);

  return (
    <header className="flex flex-row items-center xl:py-2 sticky top-0 z-10">
      {/* open sidebar button */}
      <label
        htmlFor="toggle-drawer"
        className="btn btn-ghost w-8 h-8 p-0 xl:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </label>

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
    </header>
  );
}
