import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';
import EditorPage from './pages/EditorPage';
import DeployPage from './pages/DeployPage';
import ServersPage from './pages/ServerPage';
import IpGuardPage from './pages/IpGuardPage';
import SettingsPage from './pages/SettingsPage';
import BillingPage from './pages/BillingPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen w-full flex-col">
        <Header />
        <div className="flex h-[calc(100vh-theme(height.16))] w-full">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel
              collapsible
              collapsedSize={4}
              minSize={15}
              maxSize={20}
              onCollapse={() => setIsCollapsed(true)}
              onExpand={() => setIsCollapsed(false)}
              className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'min-w-[50px]' : 'min-w-[250px]'}`}
            >
              <Sidebar isCollapsed={isCollapsed} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
              <main className="h-full overflow-auto bg-muted/40 p-4 md:p-6 lg:p-8">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/new-project" element={<NewProjectPage />} />
                  <Route path="/editor" element={<EditorPage />} />
                  <Route path="/deploy" element={<DeployPage />} />
                  <Route path="/servers" element={<ServersPage />} />
                  <Route path="/ip-guard" element={<IpGuardPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;