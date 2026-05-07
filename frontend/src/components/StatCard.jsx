import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-textSecondary">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-heading font-bold text-textPrimary">{value}</p>
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-textMuted">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
