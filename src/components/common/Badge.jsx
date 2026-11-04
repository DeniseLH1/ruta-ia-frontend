import React from 'react';

export const Badge = ({ children, color = 'cyan' }) => {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[color] || styles.cyan}`}>
      {children}
    </span>
  );
};