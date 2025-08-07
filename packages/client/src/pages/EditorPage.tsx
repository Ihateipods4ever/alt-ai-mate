import { useState, useRef, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FileText, Folder, HardDrive, Cpu, MemoryStick, SendHorizontal, Bot, Loader2, AlertCircle, Download } from 'lucide-react';
import { cn } from "@/lib/utils";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY;

/**
 * A recursive component to render the file explorer tree.
 */
const FileTreeItem = ({ item, level = 0 }: { item: any, level?: number }) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder');

  const handleToggle = () => {
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
    // In a real app, clicking a file would update the editor content.
  };

  return (
    <>
      <div
        onClick={handleToggle}
        style={{ paddingLeft: `${level * 1.5}rem` }}
        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-md text-sm"
      >
        {item.type === 'folder' ? (
          <Folder className="h-4 w-4 text-primary" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        )}
        {item.name}
      </div>
      {isOpen && item.children && (
        <ul className="space-y-1">{item.children.map((child: any) => <FileTreeItem key={child.name} item={child} level={level + 1} />)}</ul>
      )}
    </>
  );
};

/**
 * Phase 3 & 7: The Integrated Editor & Hardware Prototyping page.
 * The view adapts based on the project type selected in the New Project page.
 */
function EditorPage() {
  const location = useLocation();
  // Determine project type from navigation state, default to 'web'
  const { projectType = 'web', generatedCode } = location.state || {};
  const editorDefaultValue = generatedCode || `// Welcome to ALT-AI-MATE Editor\n// Start typing your code here.\nfunction App() {\n  return <h1>Hello, World!</h1>\n}`;
  const [editorContent, setEditorContent] = useState(editorDefaultValue);
  
  const isHardwareProject = projectType === 'hardware';

  // State for AI Assistant Chat
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! How can I help you debug or optimize your code?' }
  ]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });

  // Load API keys and available models on component mount
  useEffect(() => {
    // Load API keys from localStorage
    const savedKeys = localStorage.getItem('alt-ai-mate-api-keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Error loading saved API keys:', error);
      }
    }

    // Fetch available models from the server
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_URL}/api/models`);
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  const getModelProvider = (modelId: string) => {
    if (modelId.startsWith('gemini')) return 'gemini';
    if (modelId.startsWith('gpt')) return 'openai';
    if (modelId.startsWith('claude')) return 'anthropic';
    return 'gemini';
  };

  const isModelAvailable = (modelId: string) => {
    const provider = getModelProvider(modelId);
    return apiKeys[provider as keyof typeof apiKeys] !== '';
  };

  const handleModelChange = (newModel: string) => {
    console.log('Model changed from', selectedModel, 'to', newModel);
    setSelectedModel(newModel);
  };

  const handleSendMessage = async () => {
    if(!input.trim()) return;
    
    // Check if the selected model has an API key configured
    if (!isModelAvailable(selectedModel)) {
      const provider = getModelProvider(selectedModel);
      setMessages([...messages, { 
        from: 'ai', 
        text: `Please configure your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key in Settings before using this model.` 
      }]);
      return;
    }

    setIsAiLoading(true);
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch(`${API_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-key': INTERNAL_API_KEY,
        },
        body: JSON.stringify({ 
          message: input, 
          context: editorContent,
          model: selectedModel,
          apiKeys 
        })
      });
      const data = await response.json();
      setMessages([...newMessages, { from: 'ai', text: data.response }]);
    } catch (error) {
      setMessages([...newMessages, { from: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  // Mock data for File Explorer / Component Library
  const files = [
    { name: 'src', type: 'folder', children: [{ name: 'App.tsx', type: 'file' }, { name: 'index.css', type: 'file' }] },
    { name: 'package.json', type: 'file' }
  ];
  
  const hardwareComponents = [
      { name: 'Arduino Uno', icon: Cpu },
      { name: 'Raspberry Pi 4', icon: Cpu },
      { name: 'Resistor', icon: MemoryStick },
      { name: 'LED', icon: MemoryStick },
      { name: 'Temperature Sensor', icon: MemoryStick },
  ];
  
  const bomItems = [
      { component: 'Arduino Uno', quantity: 1 },
      { component: 'Temperature Sensor (DHT11)', quantity: 2 },
      { component: '10k Ohm Resistor', quantity: 4 },
  ];

  // Render the left panel based on project type
  const renderLeftPanel = () => {
    if (isHardwareProject) {
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Component Library</h3>
          <Input placeholder="Search components..." className="mb-4" />
          <ul className="space-y-2">
            {hardwareComponents.map(comp => (
              <li key={comp.name} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-md">
                <comp.icon className="h-4 w-4 text-primary" />
                {comp.name}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">File Explorer</h3>
        <ul className="space-y-1">
            {files.map(file => (
                <FileTreeItem key={file.name} item={file} />
            ))}
        </ul>
      </div>
    );
  };
  
  // Render the center panel based on project type
  const renderCenterPanel = () => {
      if(isHardwareProject) {
          return (
             <div className="h-full flex items-center justify-center bg-muted/20 border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                    <HardDrive className="h-16 w-16 mx-auto mb-4"/>
                    <h2 className="text-xl font-semibold">Hardware Blueprint Designer</h2>
                    <p>Drag and drop components from the library to design your circuit.</p>
                </div>
            </div>
          )
      }
      return (
        <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue={editorDefaultValue}
            onChange={(value) => setEditorContent(value || '')}
            options={{ minimap: { enabled: false } }}
        />
      )
  }

  // Render the right panel based on project type
  const renderRightPanel = () => {
    if (isHardwareProject) {
        return (
            <div className="p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4">Bill of Materials (BOM)</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Component</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bomItems.map(item => (
                             <TableRow key={item.component}>
                                <TableCell>{item.component}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    const previewHtml = `
      <html>
        <head>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style> body { font-family: sans-serif; margin: 0; } #root { padding: 1rem; } </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              ${editorContent}
              const container = document.getElementById('root');
              const root = ReactDOM.createRoot(container);
              root.render(<App />);
            } catch (err) {
              const root = document.getElementById('root');
              root.innerHTML = '<div style="color: red;"><h3>Error</h3><pre>' + err.message + '</pre></div>';
              console.error(err);
            }
       t    </script>
        </body>
      </html>
    `;

    return (
       <Tabs defaultValue="preview" className="h-full flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>
          {/* Live Preview Tab */}
          <TabsContent value="preview" className="flex-grow flex flex-col">
            <div className="flex items-center justify-end p-2 border-b">
              <Select defaultValue="desktop">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop (1920x1080)</SelectItem>
                  <SelectItem value="tablet">Tablet (768x1024)</SelectItem>
                  <SelectItem value="mobile">Mobile (375x812)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-grow p-4 bg-muted/20">
              <iframe srcDoc={previewHtml} title="Live Preview" className="w-full h-full bg-white border rounded-md shadow-inner" sandbox="allow-scripts" />
            </div>
          </TabsContent>
          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="flex-grow flex flex-col">
            {/* Model Selection */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">AI Model:</div>
                  <Select value={selectedModel} onValueChange={handleModelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      {availableModels.length > 0 ? (
                        availableModels.map((modelOption: any) => (
                          <SelectItem 
                            key={modelOption.id} 
                            value={modelOption.id}
                            disabled={!isModelAvailable(modelOption.id)}
                          >
                            {modelOption.name} ({modelOption.provider})
                            {!isModelAvailable(modelOption.id) && " - API key required"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Default)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-xs text-muted-foreground">
                    Current: {selectedModel}
                  </div>
                  {!isModelAvailable(selectedModel) && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>API key required</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.from === 'user' && "justify-end")}>
                        {msg.from === 'ai' && <Avatar className="h-8 w-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>}
                        <p className={cn("max-w-xs rounded-lg p-3 text-sm", msg.from === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
                            {msg.text}
                        </p>
                    </div>
                ))}
            </div>
            <div className="p-2 border-t flex items-center gap-2">
                <Input placeholder="Ask for help..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} disabled={isAiLoading}/>
                <Button onClick={handleSendMessage} disabled={isAiLoading}>
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4"/>}
                </Button>
            </div>
          </TabsContent>
        </Tabs>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
      <ResizablePanel defaultSize={15} minSize={10}>
        {renderLeftPanel()}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={55} minSize={30}>
        {renderCenterPanel()}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        {renderRightPanel()}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default EditorPage;