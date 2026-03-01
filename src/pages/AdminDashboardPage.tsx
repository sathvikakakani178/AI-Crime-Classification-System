import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  Download, 
  Trash2, 
  Users, 
  Activity,
  Database,
  Settings,
  FileText,
  Mail,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { 
  getPredictions, 
  getContactSubmissions,
  clearAllPredictions,
  exportPredictionsToCSV,
  exportContactsToCSV,
  downloadCSV,
  logout,
  getAuthUser,
  getAnalytics
} from '@/lib/storage';
import { CRIME_LABELS } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showClearPredictions, setShowClearPredictions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = getAuthUser();
  
  const data = useMemo(() => {
    const predictions = getPredictions();
    const contacts = getContactSubmissions();
    const analytics = getAnalytics('all');
    return { predictions, contacts, analytics };
  }, [refreshKey]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.'
    });
    navigate('/admin/login');
  };

  const handleExportPredictions = () => {
    const csv = exportPredictionsToCSV();
    downloadCSV(csv, `predictions-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: 'Exported',
      description: 'Predictions exported to CSV.'
    });
  };

  const handleExportContacts = () => {
    const csv = exportContactsToCSV();
    downloadCSV(csv, `contacts-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: 'Exported',
      description: 'Contact submissions exported to CSV.'
    });
  };

  const handleClearPredictions = () => {
    clearAllPredictions();
    setShowClearPredictions(false);
    setRefreshKey(k => k + 1);
    toast({
      title: 'Cleared',
      description: 'All predictions have been deleted.'
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshKey(k => k + 1);
    setIsRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Dashboard data has been updated.'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, <span className="text-foreground font-medium">{user?.username}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Predictions"
          value={data.predictions.length}
          icon={FileText}
          delay={0}
        />
        <StatsCard
          title="Contact Submissions"
          value={data.contacts.length}
          icon={Mail}
          delay={0.1}
        />
        <StatsCard
          title="Average Confidence"
          value={`${data.analytics.averageConfidence}%`}
          icon={Activity}
          delay={0.2}
        />
        <StatsCard
          title="Most Common Crime"
          value={data.analytics.mostCommonCrime ? CRIME_LABELS[data.analytics.mostCommonCrime] : 'N/A'}
          icon={BarChart3}
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Predictions Management */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Predictions Data</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage and export all crime predictions stored in the system.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportPredictions}
              disabled={data.predictions.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Predictions CSV
            </Button>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => setShowClearPredictions(true)}
              disabled={data.predictions.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Clear All Predictions
            </Button>
          </div>
        </div>

        {/* Contact Submissions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Contact Submissions</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            View and export all contact form submissions from users.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleExportContacts}
              disabled={data.contacts.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Contacts CSV
            </Button>
            <div className="text-center text-sm text-muted-foreground py-2">
              {data.contacts.length} submissions
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">System Settings</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage Type</span>
              <span className="font-medium">LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Started</span>
              <span className="font-medium">
                {user?.loginTime ? new Date(user.loginTime).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Status</span>
              <span className="text-green-500 font-medium">Simulated</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Recent Predictions</h3>
        {data.predictions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No predictions yet. Start by analyzing some crime narratives.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Narrative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.predictions.slice(0, 5).map((pred) => (
                  <tr key={pred.id} className="hover:bg-muted/20">
                    <td className="p-3 text-sm">
                      {new Date(pred.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {CRIME_LABELS[pred.predictedCategory]}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{pred.confidence}%</td>
                    <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                      {pred.narrative}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Clear Predictions Confirmation */}
      <ConfirmDialog
        open={showClearPredictions}
        onOpenChange={setShowClearPredictions}
        title="Clear All Predictions"
        description="This will permanently delete all prediction records. This action cannot be undone."
        confirmText="Clear All"
        onConfirm={handleClearPredictions}
        variant="destructive"
      />
    </div>
  );
}
