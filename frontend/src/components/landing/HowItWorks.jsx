import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Connect your GitHub',
    description: 'Sign in with GitHub and connect your repositories in one click.',
    icon: '🔗',
  },
  {
    number: '02',
    title: 'Choose your tool',
    description: 'Select from PR Review, Docs Generator, Bug Triage, or Test Scaffolding.',
    icon: '🛠️',
  },
  {
    number: '03',
    title: 'AI analyzes your code',
    description: 'Our multi-provider AI chain processes your request with fallback reliability.',
    icon: '🤖',
  },
  {
    number: '04',
    title: 'Act on results',
    description: 'Post reviews, commit docs, apply labels, or create test files — directly to GitHub.',
    icon: '🚀',
  },
];

export default function HowItWorks() {
  return (
    <div className="py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center text-white mb-16"
      >
        How it <span className="text-gradient">works</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-3xl mb-4">
              {step.icon}
            </div>
            <div className="text-xs font-mono text-accent mb-2">{step.number}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-white/40">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
