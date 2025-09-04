import { Bars3Icon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { THEMES } from '../config';
import { useAppContext } from '../context/app.context';
import { useInferenceContext } from '../context/inference.context';
import { FilterableDropdown, DropdownOption, Dropdown } from '../utils/common';

export default function Header() {
  const {
    config,
    config: { model },
    setShowSettings,
    saveConfig,
    currentTheme,
    switchTheme,
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
        renderOption={(option: DropdownOption) => <span>{option.label}</span>}
        isSelected={(option: DropdownOption) => model === option.value}
        onSelect={(option: DropdownOption) =>
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

        {/* theme controller is copied from https://daisyui.com/components/theme-controller/ */}
        <Dropdown
          entity="Theme"
          options={['auto', ...THEMES].map((theme) => ({
            value: theme,
            label: theme,
          }))}
          hideChevron={true}
          currentValue={
            <div className="btn btn-ghost m-1 w-8 h-8 p-0 rounded-full">
              <div className="bg-base-100 grid shrink-0 grid-cols-2 gap-1 rounded-md p-1 shadow-sm">
                <div className="bg-base-content size-1 rounded-full"></div>{' '}
                <div className="bg-primary size-1 rounded-full"></div>{' '}
                <div className="bg-secondary size-1 rounded-full"></div>{' '}
                <div className="bg-accent size-1 rounded-full"></div>
              </div>
            </div>
          }
          renderOption={(option: DropdownOption) => (
            <>
              <div
                data-theme={option.value}
                className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
              >
                <div className="bg-base-content size-1 rounded-full"></div>{' '}
                <div className="bg-primary size-1 rounded-full"></div>{' '}
                <div className="bg-secondary size-1 rounded-full"></div>{' '}
                <div className="bg-accent size-1 rounded-full"></div>
              </div>
              <div className="w-32 truncate text-left">{option.label}</div>
            </>
          )}
          isSelected={(option: DropdownOption) => currentTheme === option.value}
          onSelect={(option) => switchTheme(option.value)}
        />
      </div>
    </header>
  );
}
