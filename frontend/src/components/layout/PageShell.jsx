import { motion } from 'framer-motion';

export default function PageShell({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-white/50">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
