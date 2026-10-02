import LegalLayout from '../components/layout/LegalLayout';
import { termsContent } from '../content/legal';

export default function Terms() {
  return (
    <LegalLayout
      title={termsContent.title}
      lastUpdated={termsContent.lastUpdated}
      sections={termsContent.sections}
    />
  );
}
