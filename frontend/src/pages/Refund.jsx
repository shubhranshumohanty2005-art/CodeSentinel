import LegalLayout from '../components/layout/LegalLayout';
import { refundContent } from '../content/legal';

export default function Refund() {
  return (
    <LegalLayout
      title={refundContent.title}
      lastUpdated={refundContent.lastUpdated}
      sections={refundContent.sections}
    />
  );
}
