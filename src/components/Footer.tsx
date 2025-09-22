import { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export const Footer: FC = () => {
  const { t: trans } = useTranslation();

  return (
    <footer
      className="w-full max-md:pb-4 py-1 text-base-content/70 text-xs text-center"
      tabIndex={0}
      aria-description={trans('footer.ariaDesc')}
    >
      <Trans i18nKey="footer.disclaimer" />
    </footer>
  );
};
