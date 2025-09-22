import {
  Bars3Icon,
  Cog8ToothIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/app';
import { useChatContext } from '../context/chat';
import { useInferenceContext } from '../context/inference';
import { Dropdown } from './common';

export default function Header() {
  const navigate = useNavigate();
  const { t: trans } = useTranslation();
  const {
    config,
    config: { model },
    saveConfig,
    showSettings,
  } = useAppContext();
  const { models } = useInferenceContext();
  const { viewingChat } = useChatContext();

  const currConv = useMemo(() => viewingChat?.conv ?? null, [viewingChat]);
  const title = useMemo(
    () =>
      showSettings
        ? trans('header.title.settings')
        : currConv
          ? currConv.name
          : trans('header.title.noChat'),
    [trans, currConv, showSettings]
  );

  const selectedModel = useMemo(() => {
    const selectedModel = models.find((m) => m.id === model);
    return selectedModel ? selectedModel.name : <s>{model}</s>;
  }, [models, model]);

  return (
    <header className="flex flex-col gap-2 justify-center max-md:pb-2 md:py-2 sticky top-0 z-10">
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
            if (showSettings) return;
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
          title={trans('header.buttons.newConvBtnTitle')}
          aria-label={trans('header.buttons.newConvBtnLabel')}
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      </section>

      {showSettings && (
        <section className="flex items-center max-xl:hidden">
          <label
            className="font-medium truncate text-center px-4"
            aria-label={title}
          >
            {title}
          </label>
        </section>
      )}

      {!showSettings && (
        <section className="flex flex-row items-center">
          {/* model information */}
          <Dropdown
            className="ml-2 px-1 xl:px-4 py-0"
            entity="Model"
            options={models.map((model) => ({
              value: model.id,
              label: model.name,
            }))}
            filterable={true}
            hideChevron={models.length < 2}
            align="start"
            currentValue={
              <span className="max-w-64 sm:max-w-80 truncate text-nowrap font-semibold">
                {selectedModel}
              </span>
            }
            renderOption={(option) => (
              <span className="max-w-64 sm:max-w-80 truncate text-nowrap">
                {option.label}
              </span>
            )}
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
              className="btn btn-ghost w-8 h-8 p-0 rounded-full max-xl:hidden"
              title={trans('header.buttons.settingsBtnTitle')}
              aria-label={trans('header.buttons.settingsBtnLabel')}
              onClick={() => navigate('/settings')}
            >
              {/* settings button */}
              <Cog8ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}
    </header>
  );
}
