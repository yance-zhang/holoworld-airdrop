import classNames from 'classnames';
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function showError(message: string) {
  toast.custom((t) => (
    <div
      className={classNames(
        'flex max-w-sm items-center rounded-lg border border-red-500/20 bg-red-950/90 p-3 text-red-100 shadow-lg backdrop-blur-sm',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex-1 pr-2 text-sm font-medium">{message}</div>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md p-1 text-red-300 transition-colors hover:bg-red-800/50 hover:text-red-100"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  ));
}

export function showInfo(message: string) {
  toast.custom((t) => (
    <div
      className={classNames(
        'flex max-w-sm items-center rounded-lg border border-blue-500/20 bg-blue-950/90 p-3 text-blue-100 shadow-lg backdrop-blur-sm',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex-1 pr-2 text-sm font-medium">{message}</div>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md p-1 text-blue-300 transition-colors hover:bg-blue-800/50 hover:text-blue-100"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  ));
}

export function showSuccess(message: string) {
  toast.custom((t) => (
    <div
      className={classNames(
        'flex max-w-sm items-center rounded-lg border border-green-500/20 bg-green-950/90 p-3 text-green-100 shadow-lg backdrop-blur-sm',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      <div className="flex-1 pr-2 text-sm font-medium">{message}</div>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-md p-1 text-green-300 transition-colors hover:bg-green-800/50 hover:text-green-100"
      >
        <XIcon className="size-3" />
      </button>
    </div>
  ));
}
