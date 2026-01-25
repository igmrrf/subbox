'use client';

interface SmartPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  slideCount: number;
}

export function SmartPasteModal({ isOpen, onClose, onConfirm, slideCount }: SmartPasteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-2">Long Text Detected</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The text you pasted is quite long. Would you like to automatically split it into <strong>{slideCount}</strong> separate slides?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer"
          >
            No, keep it here
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
          >
            Yes, split it
          </button>
        </div>
      </div>
    </div>
  );
}
