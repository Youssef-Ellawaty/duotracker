import React from 'react';
import {
  Zap,
  FlaskConical,
  Calculator,
  Cog,
  Dna,
  Mountain,
  BookOpen,
  Languages,
  Globe,
  Award,
  Sparkles,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface SubjectIconProps extends LucideProps {
  name: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Zap':
      return <Zap {...props} />;
    case 'FlaskConical':
      return <FlaskConical {...props} />;
    case 'Calculator':
      return <Calculator {...props} />;
    case 'Cog':
      return <Cog {...props} />;
    case 'Dna':
      return <Dna {...props} />;
    case 'Mountain':
      return <Mountain {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Languages':
      return <Languages {...props} />;
    case 'Globe':
      return <Globe {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
