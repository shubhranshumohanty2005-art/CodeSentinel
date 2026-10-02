import LegalLayout from '../components/layout/LegalLayout';
import { privacyContent } from '../content/legal';

export default function Privacy() {
  return (
    <LegalLayout
      title={privacyContent.title}
      lastUpdated={privacyContent.lastUpdated}
      sections={privacyContent.sections}
    />
  );
}
