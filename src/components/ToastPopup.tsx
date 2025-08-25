import { FC } from 'react';
import toast, { Toast } from 'react-hot-toast';

export const ToastPopup: FC<{
  t: Toast;
  title: string;
  description: string;
  submitBtn: string;
  cancelBtn: string;
  onSubmit: () => Promise<void> | void;
}> = ({ t, title, description, submitBtn, cancelBtn, onSubmit }) => (
  <div className="flex flex-col gap-2">
    <p className="font-medium">{title}</p>
    <p className="text-sm">{description}</p>
    <div className="flex justify-center gap-2 mt-1">
      <button
        onClick={() => {
          toast.dismiss(t.id);
          onSubmit();
        }}
        className="btn btn-neutral btn-sm"
      >
        {submitBtn}
      </button>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="btn btn-ghost btn-sm"
      >
        {cancelBtn}
      </button>
    </div>
  </div>
);
