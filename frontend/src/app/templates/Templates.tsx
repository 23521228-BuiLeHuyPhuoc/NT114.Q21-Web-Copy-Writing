import { Layout } from '@/app/components/Layout';
import { CopyExamples } from '@/app/components/CopyExamples';
import { TipsSection } from '@/app/components/TipsSection';
import { IndustrySelector } from '@/app/components/IndustrySelector';
import { useState } from 'react';

export function CustomerTemplates() {
  const [selectedIndustry, setSelectedIndustry] = useState('ecommerce');

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Thư Viện Mẫu Copy</h1>
          <p className="text-foreground/70">Khám phá các mẫu copy chuyên nghiệp cho từng ngành nghề</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Chọn ngành nghề</h2>
          <IndustrySelector 
            selectedIndustry={selectedIndustry} 
            onSelectIndustry={setSelectedIndustry} 
          />
        </div>

        <div className="mb-8">
          <CopyExamples industry={selectedIndustry} />
        </div>

        <TipsSection />
      </div>
    </Layout>
  );
}
