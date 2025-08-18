import { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer
      className="w-full py-1 text-base-content/70 text-xs text-center"
      tabIndex={0}
      aria-description="Statement"
    >
      <span>The content created by AI may be inaccurate.</span>
    </footer>
  );
};
