import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Loader2, RotateCcw, Clock, Share2,
  Copy, Check, Sparkles, Globe, AlertTriangle,
  BookOpen, Scale, ChevronDown, ChevronUp, Wifi, WifiOff
} from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Progress } from '@/components/UI/progress';
import { Badge } from '@/components/UI/badge';
import { CrimeBadge, getCrimeIcon } from '@/components/CrimeBadge';
import { classifyCrimeAPI, checkHealth } from '@/lib/api';
import { savePrediction } from '@/lib/storage';
import { Prediction, CRIME_LABELS, SEVERITY_COLORS } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PredictPage() {
  const [narrative, setNarrative] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAllScores, setShowAllScores] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const { toast } = useToast();

  const maxChars = 2000;

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  const handleAnalyze = async () => {
    if (narrative.trim().length < 10) {
      toast({ title: 'Text too short', description: 'Please enter at least 10 characters.', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    try {
      const prediction = await classifyCrimeAPI(narrative.trim());
      savePrediction(prediction);
      setResult(prediction);
      toast({
        title: 'Analysis Complete',
        description: `Classified as ${CRIME_LABELS[prediction.predictedCategory]} — ${prediction.severity} severity.`,
      });
    } catch (err: any) {
      toast({ title: 'Analysis Failed', description: err.message || 'Backend unreachable.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => { setNarrative(''); setResult(null); setShowAllScores(false); };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Crime Classification Result\nCategory: ${CRIME_LABELS[result.predictedCategory]}\nSeverity: ${result.severity} (${result.severityScore}/10)\nConfidence: ${result.confidence}%\nExplanation: ${result.explanation}\n\nLegal Steps:\n${result.legalNextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Full result copied to clipboard.' });
  };

  const ResultIcon = result ? getCrimeIcon(result.predictedCategory) : null;
  const severityColor = result ? SEVERITY_COLORS[result.severity] : '';

  const samples = [
    { label: 'Cyber', text: 'Someone hacked into my email and sent phishing messages to my contacts. They also accessed my bank account.' },
    { label: 'Fraud', text: 'A man called claiming to be from the RBI and convinced me to transfer money to a "safe account". I lost ₹2 lakhs.' },
    { label: 'Violence', text: 'My neighbor attacked me with an iron rod during a boundary dispute. I was hospitalized for 3 days.' },
    { label: 'Hindi', text: 'किसी ने मेरे बैंक खाते को हैक करके पैसे निकाल लिए। मुझे एक संदिग्ध लिंक पर क्लिक करने के बाद यह हुआ।' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>ML-Powered Crime Analysis</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Crime Classification</h1>
        <p className="text-muted-foreground">Enter a crime narrative in any language — our AI will classify, score severity, and suggest legal steps.</p>
      </motion.div>

      {/* Backend status */}
      {backendOnline !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={cn('flex items-center gap-2 text-sm px-4 py-2 rounded-lg border w-fit mx-auto',
            backendOnline ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
          {backendOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          {backendOnline ? 'ML Backend Online' : 'Backend Offline — Check Railway deployment'}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />Enter Crime Narrative
            <Globe className="h-4 w-4 text-muted-foreground ml-auto" />
            <span className="text-xs text-muted-foreground font-normal">Any language</span>
          </h2>

          <div className="relative">
            <Textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value.slice(0, maxChars))}
              placeholder="Describe the incident in detail. Supports English, Hindi, Telugu, Tamil, and 20+ languages..."
              className="min-h-[220px] resize-none bg-muted/30 border-border/50 focus:border-primary"
              disabled={isAnalyzing}
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{narrative.length} / {maxChars}</div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAnalyze} disabled={isAnalyzing || narrative.trim().length < 10} className="flex-1 gap-2" size="lg">
              {isAnalyzing ? <><Loader2 className="h-5 w-5 animate-spin" />Analyzing...</> : <><Search className="h-5 w-5" />Analyze Crime</>}
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset} disabled={isAnalyzing}><RotateCcw className="h-5 w-5" /></Button>
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {samples.map((s) => (
                <Button key={s.label} variant="outline" size="sm" onClick={() => setNarrative(s.text)} disabled={isAnalyzing} className="text-xs">
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Classification Result</h2>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Search className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-6 text-muted-foreground">Running ML classification...</p>
                <p className="text-sm text-muted-foreground">Detecting language & analyzing</p>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                {/* Language badge */}
                {result.translated && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-lg px-3 py-2">
                    <Globe className="h-3 w-3" />
                    Detected {result.detectedLanguage} — translated to English for analysis
                  </div>
                )}

                {/* Category */}
                <div className="text-center py-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    {ResultIcon && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
                        <ResultIcon className="h-7 w-7 text-primary" />
                      </div>
                    )}
                  </motion.div>
                  <CrimeBadge category={result.predictedCategory} size="lg" />
                </div>

                {/* Severity */}
                <div className={cn('flex items-center justify-between px-4 py-3 rounded-lg border', severityColor)}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Severity: {result.severity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{result.severityScore}/10</span>
                    <Progress value={result.severityScore * 10} className="h-2 w-20" />
                  </div>
                </div>

                {/* Confidence */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Confidence</span>
                    <span className="font-semibold">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-2" />
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(result.timestamp).toLocaleString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />New
                  </Button>
                </div>

                {/* All scores toggle */}
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground gap-1"
                  onClick={() => setShowAllScores(!showAllScores)}>
                  {showAllScores ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showAllScores ? 'Hide' : 'Show'} all category scores
                </Button>
                {showAllScores && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                    {result.allScores.sort((a, b) => b.score - a.score).map((s) => (
                      <div key={s.category} className="flex items-center gap-2 text-xs">
                        <span className="w-32 text-muted-foreground truncate">{s.category.replace('_', ' ')}</span>
                        <Progress value={s.score} className="h-1.5 flex-1" />
                        <span className="w-10 text-right">{s.score.toFixed(1)}%</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Enter a crime narrative and click "Analyze Crime" to get AI classification with severity and legal guidance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Explanation & Legal Steps (shown after result) */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid md:grid-cols-2 gap-6">
            {/* AI Explanation */}
            <div className="glass-card p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />AI Explanation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation}</p>
            </div>

            {/* Legal Steps */}
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />Suggested Legal Steps
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSteps(!showSteps)} className="text-xs gap-1">
                  {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showSteps ? 'Collapse' : 'Expand'}
                </Button>
              </div>
              <AnimatePresence>
                {showSteps && (
                  <motion.ol initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {result.legalNextSteps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                        <span className="text-muted-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </motion.ol>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
