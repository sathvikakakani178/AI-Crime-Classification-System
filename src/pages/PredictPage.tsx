import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  RotateCcw, 
  Clock, 
  Share2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Textarea } from '@/components/UI/textarea';
import { Progress } from '@/components/UI/progress';
import { CrimeBadge, getCrimeIcon } from '@/components/CrimeBadge';
import { classifyCrime, generateId, ClassificationResult } from '@/lib/crimeClassifier';
import { savePrediction } from '@/lib/storage';
import { Prediction, CRIME_LABELS } from '@/types/crime';
import { useToast } from '@/hooks/use-toast';

export default function PredictPage() {
  const [narrative, setNarrative] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<Prediction | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const maxChars = 2000;
  const charCount = narrative.length;

  const handleAnalyze = async () => {
    if (narrative.trim().length < 10) {
      toast({
        title: 'Text too short',
        description: 'Please enter at least 10 characters to analyze.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const classification = classifyCrime(narrative);
    const prediction: Prediction = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      narrative: narrative.trim(),
      predictedCategory: classification.category,
      confidence: classification.confidence
    };

    savePrediction(prediction);
    setResult(prediction);
    setIsAnalyzing(false);

    toast({
      title: 'Analysis Complete',
      description: `Classified as ${CRIME_LABELS[classification.category]} with ${classification.confidence}% confidence.`
    });
  };

  const handleReset = () => {
    setNarrative('');
    setResult(null);
  };

  const handleCopyResult = async () => {
    if (!result) return;
    
    const text = `Crime Classification Result
Category: ${CRIME_LABELS[result.predictedCategory]}
Confidence: ${result.confidence}%
Date: ${new Date(result.timestamp).toLocaleString()}
Narrative: ${result.narrative}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied!',
      description: 'Result copied to clipboard.'
    });
  };

  const handleShare = async () => {
    if (!result) return;
    
    const text = `Crime Classification: ${CRIME_LABELS[result.predictedCategory]} (${result.confidence}% confidence)`;
    
    if (navigator.share) {
      await navigator.share({ title: 'Crime Classification Result', text });
    } else {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard.'
      });
    }
  };

  const ResultIcon = result ? getCrimeIcon(result.predictedCategory) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI Crime Analysis</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Crime Classification</h1>
        <p className="text-muted-foreground">
          Enter a crime narrative to predict its category using AI
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Enter Crime Narrative
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value.slice(0, maxChars))}
                placeholder="Describe the crime incident in detail. For example: 'Someone hacked into my email account and sent phishing emails to all my contacts. They also accessed my bank information...'"
                className="min-h-[250px] resize-none bg-muted/30 border-border/50 focus:border-primary input-glow"
                disabled={isAnalyzing}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {charCount} / {maxChars}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || narrative.trim().length < 10}
                className="flex-1 gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyze Crime
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sample narratives */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-3">Try a sample:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Cyber', text: 'Someone hacked into my computer and installed malware that encrypted all my files. They are demanding bitcoin payment.' },
                { label: 'Theft', text: 'My car was broken into last night. The thief smashed the window and stole my laptop, wallet, and phone from the back seat.' },
                { label: 'Fraud', text: 'I received a call from someone claiming to be from the IRS demanding immediate payment. They threatened arrest if I did not pay.' }
              ].map((sample) => (
                <Button
                  key={sample.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setNarrative(sample.text)}
                  disabled={isAnalyzing}
                  className="text-xs"
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Result Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Classification Result</h2>

          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Search className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-6 text-muted-foreground">Analyzing narrative...</p>
                <p className="text-sm text-muted-foreground">Processing with NLP model</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Category Badge */}
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    {ResultIcon && (
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <ResultIcon className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </motion.div>
                  <CrimeBadge category={result.predictedCategory} size="lg" />
                </div>

                {/* Confidence */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-semibold">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={handleCopyResult}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Analyze another */}
                <Button
                  onClick={handleReset}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" />
                  Analyze Another
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Enter a crime narrative on the left and click "Analyze Crime" to see the classification result.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
