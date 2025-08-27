import { Bars3Icon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { THEMES } from '../config';
import { useAppContext } from '../context/app.context';
import { useInferenceContext } from '../context/inference.context';
import { classNames } from '../utils/misc';

export default function Header() {
  const { config, setShowSettings, saveConfig, currentTheme, switchTheme } =
    useAppContext();
  const { models } = useInferenceContext();

  return (
    <header className="flex flex-row items-center xl:py-2 sticky top-0 z-10">
      {/* open sidebar button */}
      <label
        htmlFor="toggle-drawer"
        className="btn btn-ghost w-8 h-8 p-0 xl:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </label>

      {/* model information*/}
      <div className="grow text-nowrap overflow-hidden truncate ml-2 px-1 sm:px-4 py-0">
        <strong>
          {models.length === 1 && <>{config.model}</>}
          {models.length > 1 && (
            <select
              className="max-w-56 truncate"
              value={config.model}
              onChange={(e) =>
                saveConfig({
                  ...config,
                  model: e.target.value,
                })
              }
            >
              {models.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  className="bg-base-300 text-base-content"
                >
                  {m.name}
                </option>
              ))}
            </select>
          )}
        </strong>
      </div>

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
        <div className="dropdown dropdown-end dropdown-bottom">
          <button
            tabIndex={0}
            className="btn btn-ghost m-1 w-8 h-8 p-0 rounded-full"
            title="Themes"
            aria-label="Open theme menu"
          >
            <div className="bg-base-100 grid shrink-0 grid-cols-2 gap-1 rounded-md p-1 shadow-sm">
              <div className="bg-base-content size-1 rounded-full"></div>{' '}
              <div className="bg-primary size-1 rounded-full"></div>{' '}
              <div className="bg-secondary size-1 rounded-full"></div>{' '}
              <div className="bg-accent size-1 rounded-full"></div>
            </div>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content bg-base-100 rounded-box z-[1] w-50 p-2 shadow-2xl h-80 text-sm overflow-y-auto"
          >
            <li>
              <button
                className={classNames({
                  'flex gap-3 p-2 btn btn-sm btn-ghost': true,
                  'btn-active': currentTheme === 'auto',
                })}
                onClick={() => switchTheme('auto')}
              >
                <div className="w-32 ml-6 pl-1 truncate text-left">auto</div>
              </button>
            </li>
            {THEMES.map((theme) => (
              <li key={theme}>
                <button
                  className={classNames({
                    'flex gap-3 p-2 btn btn-sm btn-ghost': true,
                    'btn-active': currentTheme === theme,
                  })}
                  data-set-theme={theme}
                  data-act-class="[&amp;_svg]:visible"
                  onClick={() => switchTheme(theme)}
                >
                  <div
                    data-theme={theme}
                    className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
                  >
                    <div className="bg-base-content size-1 rounded-full"></div>{' '}
                    <div className="bg-primary size-1 rounded-full"></div>{' '}
                    <div className="bg-secondary size-1 rounded-full"></div>{' '}
                    <div className="bg-accent size-1 rounded-full"></div>
                  </div>
                  <div className="w-32 truncate text-left">{theme}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
