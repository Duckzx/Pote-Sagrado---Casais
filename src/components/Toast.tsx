import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'milestone';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center space-y-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="pointer-events-auto w-full max-w-sm bg-white border border-cookbook-border shadow-lg rounded-lg p-4 flex items-start space-x-3"
          >
            <div className={`mt-0.5 ${toast.type === 'milestone' ? 'text-cookbook-gold' : 'text-cookbook-primary'}`}>
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-serif italic text-sm text-cookbook-text">{toast.title}</h4>
              <p className="font-sans text-[10px] uppercase tracking-wider text-cookbook-text/60 font-bold mt-1">
                {toast.message}
              </p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-cookbook-text/40 hover:text-cookbook-text">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
