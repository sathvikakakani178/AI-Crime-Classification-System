import { motion } from 'framer-motion';
import { 
  Info, 
  Brain, 
  Database, 
  Code, 
  Users,
  CheckCircle,
  Cpu,
  FileText,
  Layers,
  Zap
} from 'lucide-react';
import { Card } from '@/components/UI/card';

const methodologySteps = [
  {
    title: 'Text Preprocessing',
    description: 'Input text is cleaned, tokenized, and normalized. Stop words are removed and text is converted to lowercase.',
    icon: FileText
  },
  {
    title: 'TF-IDF Vectorization',
    description: 'Term Frequency-Inverse Document Frequency transforms text into numerical feature vectors.',
    icon: Layers
  },
  {
    title: 'ML Classification',
    description: 'Trained models (Logistic Regression, SVM) analyze features to predict crime categories.',
    icon: Brain
  },
  {
    title: 'Confidence Scoring',
    description: 'Probability scores from the model are converted to confidence percentages.',
    icon: Zap
  }
];

const techStack = [
  { name: 'React', description: 'UI Framework' },
  { name: 'TypeScript', description: 'Type Safety' },
  { name: 'Tailwind CSS', description: 'Styling' },
  { name: 'Framer Motion', description: 'Animations' },
  { name: 'Recharts', description: 'Data Visualization' },
  { name: 'Lucide Icons', description: 'Icon Library' }
];

const metrics = [
  { label: 'Accuracy', value: '87%' },
  { label: 'Precision', value: '85%' },
  { label: 'Recall', value: '84%' },
  { label: 'F1 Score', value: '84.5%' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Info className="h-4 w-4" />
          <span>About the Project</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          AI Crime Classification System
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A sophisticated NLP-based system for analyzing and classifying crime narratives 
          using machine learning algorithms.
        </p>
      </motion.div>

      {/* Project Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Project Overview
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          CrimeClassify AI is an advanced crime classification system that leverages Natural Language 
          Processing (NLP) and Machine Learning (ML) to automatically categorize crime reports based 
          on their textual descriptions. The system analyzes crime narratives and predicts the most 
          likely crime category with a confidence score.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This tool is designed to assist law enforcement agencies, researchers, and analysts in 
          qUIckly categorizing large volumes of crime reports, identifying patterns, and gaining 
          insights into crime trends.
        </p>
      </motion.section>

      {/* ML Methodology */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold mb-6 flex items-center gap-2"
        >
          <Cpu className="h-6 w-6 text-primary" />
          ML Methodology
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {methodologySteps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="glass-card p-6 relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20 group-hover:text-primary/10 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Evaluation Metrics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-8"
      >
        <h2 className="text-2xl font-bold mb-6">Evaluation Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-xl bg-muted/30"
            >
              <p className="text-3xl font-bold gradient-text">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Dataset Information */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-8"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          Dataset Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Training Data</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                50,000+ crime narratives
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                6 crime categories
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Balanced class distribution
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Multiple data sources
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Crime Categories</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-cyber" />
                Cyber Crime
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-violence" />
                Violence
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-fraud" />
                Fraud
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-theft" />
                Theft
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-harassment" />
                Harassment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-crime-other" />
                Other
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold mb-6 flex items-center gap-2"
        >
          <Code className="h-6 w-6 text-primary" />
          Technology Stack
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card p-4 text-center group cursor-pointer"
            >
              <p className="font-semibold group-hover:text-primary transition-colors">
                {tech.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card p-8 text-center"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Development Team
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This project was developed by a team of data scientists and software engineers 
          passionate about applying AI to solve real-world problems in public safety and 
          law enforcement.
        </p>
        <div className="mt-6 p-4 bg-muted/30 rounded-xl inline-block">
          <p className="text-sm text-muted-foreground">
            For inqUIries and collaborations, please visit our contact page.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
