import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import ScannerView from './views/ScannerView';
import CatalogView from './views/CatalogView';

export type Tab = 'scanner' | 'catalog';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner');

  return (
    <AppLayout activeTab={activeTab} onChangeTab={setActiveTab}>
      <div className="h-full w-full">
        {activeTab === 'scanner' && <ScannerView />}
        {activeTab === 'catalog' && <CatalogView />}
      </div>
    </AppLayout>
  );
}

export default App;
