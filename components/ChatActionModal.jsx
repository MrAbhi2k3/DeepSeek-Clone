import React, { useEffect, useState } from 'react';

const ChatActionModal = ({
  isOpen,
  mode,
  title,
  message,
  confirmText,
  value,
  onChange,
  onConfirm,
  onClose,
  isLoading,
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (mode === 'rename') {
      onChange(localValue);
      onConfirm(localValue.trim());
      return;
    }

    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-[#121216] p-5 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-300">{message}</p>

        {mode === 'rename' && (
          <input
            className="mt-4 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-400"
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Enter new chat name"
            autoFocus
          />
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleConfirm}
            disabled={isLoading || (mode === 'rename' && !localValue.trim())}
          >
            {isLoading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatActionModal;
