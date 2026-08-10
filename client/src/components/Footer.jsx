import React from 'react';

/**
 * Footer Component
 * Simple, elegant footer for the college project.
 */
const Footer = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
      <div className="max-w-6xl mx-auto px-4">
        <p className="font-medium text-slate-700">AI Routine Maker | College Project</p>
        <p className="text-xs text-slate-400 mt-1">
          Built with React JS, Vite & Tailwind CSS
        </p>
      </div>
    </footer>
  );
};

export default Footer;
