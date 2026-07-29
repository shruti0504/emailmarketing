"use client";

import React, { useEffect } from "react";
import Alert from "./Alert";

interface AlertNotificationProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose?: () => void;
  durationMs?: number;
}

export default function AlertNotification({
  variant,
  title,
  message,
  onClose,
  durationMs = 2500,
}: AlertNotificationProps) {
  useEffect(() => {
    if (durationMs > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [durationMs, onClose]);

  return (
    <div className="relative mb-4 transition-all duration-300">
      <Alert variant={variant} title={title} message={message} />
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
