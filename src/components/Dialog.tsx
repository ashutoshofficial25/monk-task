import { ReactNode } from "react";
import { IoMdClose } from "react-icons/io";

interface IProps {
  open: boolean;
  title: string;
  onClose: VoidFunction;
  children: ReactNode;
}

export default function Dialog({ open, title, onClose, children }: IProps) {
  if (!open) return null;

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-4 sm:p-4 sm:pb-4 flex items-center justify-between">
              <div className="text-md font-semibold">{title}</div>
              <IoMdClose className="text-xl cursor-pointer" onClick={onClose} />
            </div>

            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
