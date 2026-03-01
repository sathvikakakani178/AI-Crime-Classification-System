import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  BarChart3, 
  History, 
  Zap, 
  Lock,
  ArrowRight,
  Brain,
  Database,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/UI/button';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced NLP algorithms analyze crime narratives to identify patterns and classify incidents accurately.'
  },
  {
    icon: Zap,
    title: 'Real-Time Predictions',
    description: 'Get instant crime category predictions with confidence scores for any text narrative.'
  },
  {
    icon: Database,
    title: 'Comprehensive History',
    description: 'All predictions are saved locally for future reference, analysis, and export.'
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Visualize trends, distribution, and patterns across all your crime classifications.'
  }
];

const categories = [
  { name: 'Cyber Crime', color: 'bg-crime-cyber/20 border-crime-cyber/30 text-crime-cyber' },
  { name: 'Violence', color: 'bg-crime-violence/20 border-crime-violence/30 text-crime-violence' },
  { name: 'Fraud', color: 'bg-crime-fraud/20 border-crime-fraud/30 text-crime-fraud' },
  { name: 'Theft', color: 'bg-crime-theft/20 border-crime-theft/30 text-crime-theft' },
  { name: 'Harassment', color: 'bg-crime-harassment/20 border-crime-harassment/30 text-crime-harassment' },
  { name: 'Other', color: 'bg-crime-other/20 border-crime-other/30 text-crime-other' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Shield className="h-4 w-4" />
            <span>AI-Powered Crime Classification</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Classify Crime Narratives with{' '}
            <span className="gradient-text">Artificial Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Leverage advanced NLP algorithms to analyze crime reports, identify patterns, 
            and predict crime categories with high confidence scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/predict">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                Start Analyzing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                <BarChart3 className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Category badges */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {categories.map((cat, index) => (
            <motion.span
              key={cat.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`px-4 py-2 rounded-full border text-sm font-medium ${cat.color}`}
            >
              {cat.name}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Everything you need to analyze and classify crime narratives efficiently
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="glass-card p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How It Works
            </h2>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Enter Narrative', desc: 'Input the crime report or incident description' },
                { step: '02', title: 'AI Analysis', desc: 'Our NLP model processes and analyzes the text' },
                { step: '03', title: 'Get Results', desc: 'Receive category prediction with confidence score' },
                { step: '04', title: 'Track & Export', desc: 'View history, analytics, and export data' }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <span className="text-4xl font-bold text-primary/30">{item.step}</span>
                  <div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl" />
              <div className="absolute inset-4 glass-card rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Shield className="h-20 w-20 text-primary mx-auto mb-4 floating" />
                  <h3 className="text-2xl font-bold gradient-text">CrimeClassify AI</h3>
                  <p className="text-muted-foreground mt-2">Intelligent Crime Analysis</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start classifying crime narratives today with our AI-powered system.
          </p>
          <Link to="/predict">
            <Button size="lg" className="gap-2 text-lg px-8 py-6 pulse-glow">
              <Search className="h-5 w-5" />
              Analyze Your First Narrative
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
