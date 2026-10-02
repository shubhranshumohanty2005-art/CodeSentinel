import LegalLayout from '../components/layout/LegalLayout';
import { cookiesContent } from '../content/legal';

export default function Cookies() {
  return (
    <LegalLayout
      title={cookiesContent.title}
      lastUpdated={cookiesContent.lastUpdated}
      sections={cookiesContent.sections}
    />
  );
}
