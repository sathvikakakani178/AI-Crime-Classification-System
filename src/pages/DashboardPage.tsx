import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart as PieChartIcon,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ChartSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { getAnalytics } from '@/lib/storage';
import { CRIME_LABELS, CrimeCategory } from '@/types/crime';

const COLORS: Record<CrimeCategory, string> = {
  CYBER_CRIME: '#3B82F6',
  VIOLENCE: '#EF4444',
  FRAUD: '#F97316',
  THEFT: '#A855F7',
  HARASSMENT: '#EC4899',
  OTHER: '#6B7280'
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const analytics = useMemo(() => {
    return getAnalytics(dateRange);
  }, [dateRange]);

  const categoryData = useMemo(() => {
    return Object.entries(analytics.categoryDistribution)
      .map(([category, count]) => ({
        name: CRIME_LABELS[category as CrimeCategory],
        value: count,
        category: category as CrimeCategory
      }))
      .filter(item => item.value > 0);
  }, [analytics]);

  const pieData = categoryData.map(item => ({
    ...item,
    fill: COLORS[item.category]
  }));

  const handleRangeChange = (range: 'week' | 'month' | 'all') => {
    setIsLoading(true);
    setDateRange(range);
    setTimeout(() => setIsLoading(false), 300);
  };

  if (analytics.totalPredictions === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize crime classification trends and patterns
          </p>
        </motion.div>

        <EmptyState
          icon={PieChartIcon}
          title="No Data Available"
          description="Start analyzing crime narratives to see analytics and insights here."
          actionLabel="Analyze Crime"
          actionHref="/predict"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize crime classification trends and patterns
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRangeChange(range)}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Predictions"
          value={analytics.totalPredictions}
          icon={Activity}
          delay={0}
        />
        <StatsCard
          title="Most Common Crime"
          value={analytics.mostCommonCrime ? CRIME_LABELS[analytics.mostCommonCrime] : 'N/A'}
          icon={AlertTriangle}
          delay={0.1}
        />
        <StatsCard
          title="Average Confidence"
          value={`${analytics.averageConfidence}%`}
          icon={Target}
          delay={0.2}
        />
        <StatsCard
          title="Recent Activity"
          value={analytics.recentActivityCount}
          subtitle="Last 24 hours"
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution - Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Crime Category Distribution
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-muted/30 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Crime Type Breakdown
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-muted/30 rounded-lg" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data to display
            </div>
          )}
        </motion.div>

        {/* Predictions Over Time - Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Predictions Over Time
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-muted/30 rounded-lg" />
          ) : analytics.dailyPredictions.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.dailyPredictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Not enough data for trend analysis
            </div>
          )}
        </motion.div>

        {/* Confidence Trends - Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Confidence Trends
          </h3>
          {isLoading ? (
            <div className="h-64 animate-pulse bg-muted/30 rounded-lg" />
          ) : analytics.confidenceTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.confidenceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`${value}%`, 'Avg Confidence']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgConfidence" 
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Not enough data for trend analysis
            </div>
          )}
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-4"
      >
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">Crime Category Colors</h4>
        <div className="flex flex-wrap gap-4">
          {Object.entries(COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm">{CRIME_LABELS[category as CrimeCategory]}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
