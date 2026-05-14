import { CrimeCategory } from '@/types/crime';

const keywords: Record<Exclude<CrimeCategory, 'OTHER'>, string[]> = {
  CYBER_CRIME: [
    'hack', 'hacking', 'hacked', 'phishing', 'malware', 'data breach', 'cyber', 
    'online', 'digital', 'website', 'computer', 'internet', 'ransomware', 'virus',
    'ddos', 'spam', 'spyware', 'trojan', 'encryption', 'password', 'account',
    'bitcoin', 'cryptocurrency', 'dark web', 'scam email', 'social engineering',
    'identity', 'database', 'server', 'network', 'firewall', 'unauthorized access'
  ],
  VIOLENCE: [
    'assault', 'attack', 'attacked', 'fight', 'fighting', 'murder', 'weapon', 
    'violent', 'hit', 'hitting', 'kill', 'killed', 'killing', 'harm', 'harmed',
    'beaten', 'beat', 'punch', 'punched', 'stab', 'stabbed', 'shot', 'shooting',
    'gun', 'knife', 'domestic', 'abuse', 'battery', 'homicide', 'manslaughter',
    'injury', 'injured', 'wound', 'wounded', 'blood', 'physical', 'force'
  ],
  FRAUD: [
    'scam', 'scammed', 'fraud', 'fraudulent', 'fake', 'cheat', 'cheated', 
    'deceive', 'deceived', 'money', 'credit card', 'identity theft', 'forgery',
    'forged', 'embezzlement', 'ponzi', 'pyramid scheme', 'tax fraud', 'wire fraud',
    'insurance fraud', 'mortgage fraud', 'counterfeit', 'false', 'misrepresentation',
    'investment', 'financial', 'bank', 'account fraud', 'check fraud'
  ],
  THEFT: [
    'steal', 'stealing', 'stole', 'stolen', 'theft', 'robbery', 'robbed', 
    'burglary', 'burglarized', 'shoplifting', 'pickpocket', 'broke in', 'break in',
    'breaking', 'larceny', 'carjacking', 'mugging', 'mugged', 'snatched', 
    'took', 'taking', 'missing', 'property', 'belongings', 'wallet', 'purse',
    'phone', 'car', 'vehicle', 'house', 'home invasion', 'looting'
  ],
  HARASSMENT: [
    'harass', 'harassed', 'harassment', 'threaten', 'threatened', 'threatening',
    'stalk', 'stalked', 'stalking', 'abuse', 'abused', 'bully', 'bullied', 
    'bullying', 'intimidate', 'intimidated', 'unwanted', 'repeatedly', 
    'following', 'followed', 'messages', 'calls', 'contact', 'workplace',
    'sexual harassment', 'verbal', 'emotional', 'psychological', 'cyberbullying',
    'hate', 'discrimination', 'hostile', 'offensive'
  ]
};

export interface ClassificationResult {
  category: CrimeCategory;
  confidence: number;
  scores: Record<CrimeCategory, number>;
}

export function classifyCrime(text: string): ClassificationResult {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  const scores: Partial<Record<CrimeCategory, number>> = {};
  
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    let score = 0;
    for (const keyword of categoryKeywords) {
      if (keyword.includes(' ')) {
        // Multi-word keyword - check for phrase
        if (lowerText.includes(keyword)) {
          score += 2; // Higher weight for phrase matches
        }
      } else {
        // Single word - check word boundaries
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
    }
    scores[category as CrimeCategory] = score;
  }
  
  scores.OTHER = 0;

  const maxCategory = (Object.keys(scores) as CrimeCategory[]).reduce((a, b) => 
    (scores[a] || 0) > (scores[b] || 0) ? a : b
  );

  const maxScore = scores[maxCategory] || 0;
  
  // Calculate confidence based on score and text length
  let confidence: number;
  if (maxScore === 0) {
    confidence = 35 + Math.random() * 15; // 35-50% for unknown
  } else if (maxScore === 1) {
    confidence = 55 + Math.random() * 10; // 55-65%
  } else if (maxScore === 2) {
    confidence = 65 + Math.random() * 10; // 65-75%
  } else if (maxScore <= 4) {
    confidence = 75 + Math.random() * 10; // 75-85%
  } else {
    confidence = Math.min(85 + (maxScore * 2), 98); // 85-98%
  }

  return {
    category: maxScore > 0 ? maxCategory : 'OTHER',
    confidence: Math.round(confidence * 10) / 10,
    scores: scores as Record<CrimeCategory, number>
  };
}

export function generateId(): string {
  return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
