import React, { useState, useEffect } from 'react';

const Notification = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-900 border-green-400' :
                  type === 'error' ? 'bg-red-900 border-red-400' :
                  type === 'warning' ? 'bg-yellow-900 border-yellow-400' :
                  'bg-blue-900 border-blue-400';

  const textColor = type === 'success' ? 'text-green-200' :
                    type === 'error' ? 'text-red-200' :
                    type === 'warning' ? 'text-yellow-200' :
                    'text-blue-200';

  return (
    <div className={`fixed top-4 right-4 z-50 border-2 ${bgColor} p-4 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <div className={textColor}>
          <div className="flex items-center">
            <span className="mr-2">
              {type === 'success' && '✅'}
              {type === 'error' && '❌'}
              {type === 'warning' && '⚠️'}
              {type === 'info' && 'ℹ️'}
            </span>
            <span>{message}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose && onClose();
          }}
          className={`ml-4 ${textColor} hover:text-white text-xl`}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
