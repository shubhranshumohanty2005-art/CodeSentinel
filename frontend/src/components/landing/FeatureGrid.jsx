import { motion } from 'framer-motion';
import GlassCard from '../layout/GlassCard';

const features = [
  {
    icon: '🔍',
    title: 'PR Reviewer',
    description: 'Line-level code review with bug detection, style checks, and risk scoring.',
    color: '#00D4FF',
  },
  {
    icon: '📝',
    title: 'Docs & Changelog',
    description: 'Auto-generate README sections and Keep-a-Changelog entries from commits.',
    color: '#8B5CF6',
  },
  {
    icon: '🐛',
    title: 'Bug Triage',
    description: 'Smart label, severity, and owner suggestions with duplicate detection.',
    color: '#F59E0B',
  },
  {
    icon: '🧪',
    title: 'Test Generator',
    description: 'Generate working unit tests in your project\'s existing framework.',
    color: '#10B981',
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, i) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <GlassCard hover className="h-full">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
            >
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
