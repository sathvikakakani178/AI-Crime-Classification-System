import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/UI/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/UI/dialog';
import { CrimeBadge } from '@/components/CrimeBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { 
  getPredictions, 
  deletePrediction, 
  clearAllPredictions,
  exportPredictionsToCSV,
  downloadCSV
} from '@/lib/storage';
import { Prediction, CRIME_CATEGORIES, CRIME_LABELS, CrimeCategory } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>(getPredictions());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const { toast } = useToast();

  const filteredPredictions = useMemo(() => {
    return predictions.filter(p => {
      const matchesSearch = p.narrative.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.predictedCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [predictions, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredPredictions.length / ITEMS_PER_PAGE);
  const paginatedPredictions = filteredPredictions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id: string) => {
    deletePrediction(id);
    setPredictions(getPredictions());
    setDeleteId(null);
    toast({
      title: 'Deleted',
      description: 'Prediction removed from history.'
    });
  };

  const handleClearAll = () => {
    clearAllPredictions();
    setPredictions([]);
    setShowClearAll(false);
    setCurrentPage(1);
    toast({
      title: 'History Cleared',
      description: 'All predictions have been removed.'
    });
  };

  const handleExport = () => {
    const csv = exportPredictionsToCSV();
    downloadCSV(csv, `crime-predictions-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: 'Exported',
      description: 'Predictions exported to CSV file.'
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

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
            <History className="h-8 w-8 text-primary" />
            Classification History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all past crime predictions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={predictions.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowClearAll(true)}
            disabled={predictions.length === 0}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search narratives..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 bg-muted/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] bg-muted/30">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CRIME_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CRIME_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Results count */}
      {filteredPredictions.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPredictions.length)} of {filteredPredictions.length} predictions
        </p>
      )}

      {/* Table */}
      {predictions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Predictions Yet"
          description="Start by analyzing a crime narrative. All your predictions will appear here."
          actionLabel="Analyze Crime"
          actionHref="/predict"
        />
      ) : filteredPredictions.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Results Found"
          description="Try adjusting your search or filter criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setCategoryFilter('all');
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Narrative</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <AnimatePresence>
                  {paginatedPredictions.map((prediction, index) => (
                    <motion.tr
                      key={prediction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(prediction.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(prediction.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm max-w-md">
                          {truncateText(prediction.narrative)}
                        </p>
                      </td>
                      <td className="p-4">
                        <CrimeBadge category={prediction.predictedCategory} size="sm" />
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{prediction.confidence}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPrediction(prediction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(prediction.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
        <DialogContent className="glass-card border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Prediction Details
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CrimeBadge category={selectedPrediction.predictedCategory} size="lg" />
                <span className="text-2xl font-bold">{selectedPrediction.confidence}%</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Analyzed on:</p>
                <p className="font-medium">{new Date(selectedPrediction.timestamp).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Full Narrative:</p>
                <p className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                  {selectedPrediction.narrative}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Prediction"
        description="Are you sure you want to delete this prediction? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        variant="destructive"
      />

      {/* Clear All Confirmation */}
      <ConfirmDialog
        open={showClearAll}
        onOpenChange={setShowClearAll}
        title="Clear All History"
        description="Are you sure you want to delete all predictions? This action cannot be undone."
        confirmText="Clear All"
        onConfirm={handleClearAll}
        variant="destructive"
      />
    </div>
  );
}
