export default function Badge({ type = 'info', children }) {
  const classes = {
    critical: 'badge-critical',
    warning: 'badge-warning',
    info: 'badge-info',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium',
  };

  return (
    <span className={classes[type] || classes.info}>
      {children}
    </span>
  );
}
