import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, AlertCircle, Download, FileText, Folder, HardDrive, Cpu, MemoryStick, SendHorizontal, Mic, MicOff, CloudUpload } from 'lucide-react';
import { cn } from "@/lib/utils";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY;

// Type definition for a message
interface Message {
  from: 'user' | 'ai';
  text: string;
}

// Type definition for an API key
interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
}

// Type definition for a file tree item
interface FileTreeItemProps {
  item: {
    name: string;
    type: 'folder' | 'file';
    path: string;
    children?: FileTreeItemProps['item'][];
  };
  level?: number;
  onFileSelect: (path: string) => void;
  activeFile: string;
}

// Recursive component to render file tree
const FileTreeItem = ({ item, level = 0, onFileSelect, activeFile }: FileTreeItemProps) => {
    const [isOpen, setIsOpen] = useState(true); // Default to open for folders

    const handleToggle = () => {
        if (item.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onFileSelect(item.path);
        }
    };

    const isSelected = item.type === 'file' && item.path === activeFile;

    return (
        <>
            <div
                onClick={handleToggle}
                style={{ paddingLeft: `${level * 1.5}rem` }}
                className={cn(
                    "flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-md text-sm",
                    isSelected && "bg-muted"
                )}
            >
                {item.type === 'folder' ? (
                    <Folder className="h-4 w-4 text-primary" />
                ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                {item.name}
            </div>
            {isOpen && item.children && (
                <ul className="space-y-1">
                    {item.children.map((child) => (
                        <FileTreeItem
                            key={child.path}
                            item={child}
                            level={level + 1}
                            onFileSelect={onFileSelect}
                            activeFile={activeFile}
                        />
                    ))}
                </ul>
            )}
        </>
    );
};

// Helper function to build a file tree structure from a flat object
const buildFileTree = (files: Record<string, { content: string }>) => {
    const tree: FileTreeItemProps['item'] = { name: 'root', type: 'folder', path: '', children: [] };

    Object.keys(files).forEach(path => {
        const parts = path.split('/');
        let currentLevel = tree.children;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            let node = currentLevel?.find(n => n.name === part && n.type === (isFile ? 'file' : 'folder'));

            if (!node) {
                if (isFile) {
                    node = { name: part, type: 'file', path };
                    currentLevel?.push(node);
                } else {
                    const folderPath = parts.slice(0, index + 1).join('/');
                    node = { name: part, type: 'folder', path: folderPath, children: [] };
                    currentLevel?.push(node);
                }
            }

            if (!isFile) {
                currentLevel = node.children;
            }
        });
    });

    const sortTree = (node: FileTreeItemProps['item']) => {
        if (node.children) {
            node.children.sort((a, b) => (a.type === 'folder' ? -1 : 1) - (b.type === 'folder' ? -1 : 1) || a.name.localeCompare(b.name));
            node.children.forEach(sortTree);
        }
    };
    sortTree(tree);

    return tree.children || [];
};

// Define a type with an index signature for the files state
interface FileContent {
  content: string;
}

interface FileState {
  [key: string]: FileContent;
}

function EditorPage() {
  const location = useLocation();
  const { currentProject, updateProjectFiles, generateCode } = useApp();
  const { projectType = 'web', generatedCode } = location.state || {};
  const isHardwareProject = projectType === 'hardware';

  const initialFiles: FileState = currentProject?.files || {
    'src/App.tsx': {
        content: generatedCode || `// Welcome to ALT-AI-MATE Editor\n// Select a file to start editing.\nfunction App() {\n  return <h1>Hello, World!</h1>\n}`
    },
    'src/index.css': {
        content: `body {\n  font-family: sans-serif;\n  margin: 20px;\n  background-color: #f0f0f0;\n}`
    },
    'package.json': {
        content: JSON.stringify({ name: 'my-project', version: '0.1.0' }, null, 2)
    }
  };

  const [files, setFiles] = useState<FileState>(initialFiles);
  const [activeFile, setActiveFile] = useState('src/App.tsx');
  const [fileTree, setFileTree] = useState(buildFileTree(initialFiles));
  const [editorContent, setEditorContent] = useState(initialFiles[activeFile]?.content || '');

  const [messages, setMessages] = useState<Message[]>([
    { from: 'ai', text: 'Hello! How can I help you debug or optimize your code?' }
  ]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Handle file selection and update editor content
  const handleFileSelect = (path: string) => {
    setActiveFile(path);
    setEditorContent(files[path]?.content || '');
  };

  // Update file content when editor changes
  const handleEditorChange = (value: string | undefined) => {
    const updatedFiles = { ...files };
    if (activeFile && value !== undefined) {
      updatedFiles[activeFile].content = value;
      setFiles(updatedFiles);
      
      // Save to context if we have a current project
      if (currentProject) {
        updateProjectFiles(currentProject.id, updatedFiles);
      }
    }
    setEditorContent(value || '');
  };

  useEffect(() => {
    const savedKeys = localStorage.getItem('alt-ai-mate-api-keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Error loading saved API keys:', error);
      }
    }

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

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: Event) => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognition);
    }
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
    setSelectedModel(newModel);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setIsAiLoading(true);
    const newMessage: Message = { from: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    const userInput = input;
    setInput('');

    try {
      // Check if this is a code generation request
      const isCodeRequest = /generate|create|write|build|make|code|function|component/i.test(userInput);
      
      if (isCodeRequest) {
        // Use the generateCode function from context
        const generatedCode = await generateCode(userInput, 'javascript', 'react');
        
        // Create a new file with the generated code
        const fileName = `generated_${Date.now()}.js`;
        const updatedFiles = {
          ...files,
          [fileName]: { content: generatedCode }
        };
        
        setFiles(updatedFiles);
        setFileTree(buildFileTree(updatedFiles));
        
        // Update project files if we have a current project
        if (currentProject) {
          updateProjectFiles(currentProject.id, updatedFiles);
        }
        
        setMessages(prevMessages => [...prevMessages, { 
          from: 'ai', 
          text: `I've generated the code and created a new file: ${fileName}. Click on it to view the generated code!` 
        }]);
      } else {
        // Handle as regular chat
        const response = await fetch(`${API_URL}/api/ai-chat`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-internal-api-key': INTERNAL_API_KEY,
          },
          body: JSON.stringify({
            message: userInput,
            context: editorContent,
            model: selectedModel,
            apiKeys
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setMessages(prevMessages => [...prevMessages, { from: 'ai', text: data.response }]);
        } else {
          // Fallback response
          setMessages(prevMessages => [...prevMessages, { 
            from: 'ai', 
            text: `I understand you want help with: "${userInput}". While I can't connect to external AI services right now, I can help you with code generation. Try asking me to "generate a React component" or "create a function for [specific task]".` 
          }]);
        }
      }
    } catch (error) {
      console.error('AI chat error:', error);
      
      // Try to handle as code generation even if API fails
      if (/generate|create|write|build|make|code|function|component/i.test(userInput)) {
        try {
          const generatedCode = await generateCode(userInput, 'javascript', 'react');
          const fileName = `generated_${Date.now()}.js`;
          const updatedFiles = {
            ...files,
            [fileName]: { content: generatedCode }
          };
          
          setFiles(updatedFiles);
          setFileTree(buildFileTree(updatedFiles));
          
          if (currentProject) {
            updateProjectFiles(currentProject.id, updatedFiles);
          }
          
          setMessages(prevMessages => [...prevMessages, { 
            from: 'ai', 
            text: `I've generated the code for you and created: ${fileName}` 
          }]);
        } catch (genError) {
          setMessages(prevMessages => [...prevMessages, { 
            from: 'ai', 
            text: 'Sorry, I encountered an error generating code. Please try again with a more specific request.' 
          }]);
        }
      } else {
        setMessages(prevMessages => [...prevMessages, { 
          from: 'ai', 
          text: 'Sorry, I encountered an error. Please try again or ask me to generate code for you!' 
        }]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleDownloadFiles = async () => {
    const zip = new JSZip();
    
    // Add all files to the zip
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content);
    });
    
    // Generate and download the zip file
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${projectType || 'project'}-files.zip`);
    } catch (error) {
      console.error('Error creating zip file:', error);
    }
  };

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">File Explorer</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleDownloadFiles} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        <ul className="space-y-1">
            {fileTree.map((item) => (
                <FileTreeItem
                    key={item.name}
                    item={item}
                    onFileSelect={handleFileSelect}
                    activeFile={activeFile}
                />
            ))}
        </ul>
      </div>
    );
  };

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
            value={editorContent}
            onChange={handleEditorChange}
            options={{ minimap: { enabled: false } }}
        />
      )
  };

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

    // Encode jsContent for safe embedding in the srcDoc string
    const cssContent = files['src/index.css']?.content || '';
    const jsContent = editorContent || files['src/App.tsx']?.content || '';
    const encodedJsContent = btoa(jsContent);

    const previewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Preview</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
              margin: 0; 
              padding: 0;
              background: white;
            } 
            #root { 
              min-height: 100vh;
              padding: 1rem; 
            }
            ${cssContent}
          </style>
        </head>
        <body>
          <div id="root">Loading...</div>
          <script type="text/babel">
            try {
              // Decode the Base64 encoded JavaScript content
              const encodedCode = '${encodedJsContent}';
              let code = atob(encodedCode);
              
              // Ensure React is available in the script scope
              if (!code.includes('import React') && !code.includes('const React')) {
                code = 'const React = window.React;\\n' + code;
              }
              
              // Transform code using Babel
              const transformedCode = Babel.transform(code, { presets: ['react'] }).code;
              
              // Use a function wrapper to capture the App component
              let App = undefined;
              const exports = {}; // Mock exports object
              const module = { exports }; // Mock module object
              
              // Execute the transformed code
              eval(transformedCode);
              
              // Check if App component is available, prioritizing default export or a variable named App
              if (typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) {
                App = exports.default;
              } else if (typeof window.App === 'function' || (typeof window.App === 'object' && window.App !== null)) {
                 App = window.App; // Check if the component was attached to window
              } else if (typeof window.exports !== 'undefined' && (typeof window.exports.default === 'function' || (typeof window.exports.default === 'object' && window.exports.default !== null))) {
                 App = window.exports.default; // Check if exports were attached to window
              }
              
              // Render the App component
              const container = document.getElementById('root');
              container.innerHTML = ''; // Clear loading message
              if (typeof App !== 'undefined') {
                const root = ReactDOM.createRoot(container);
                root.render(React.createElement(App));
              } else {
                container.innerHTML = '<div style="color: orange; padding: 20px;"><h3>No App component found</h3><p>Make sure your code exports a default App component.</p></div>';
              }
            } catch (err) {
              console.error('Preview error:', err);
              const root = document.getElementById('root');
              root.innerHTML = \`
                <div style="color: red; padding: 20px; font-family: monospace;">
                  <h3>Preview Error</h3>
                  <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">\${err.message}</pre>
                  <details style="margin-top: 10px;">
                    <summary>Stack Trace</summary>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">\${err.stack || 'No stack trace available'}</pre>
                  </details>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;

    return (
       <Tabs defaultValue="preview" className="h-full flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>
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
          <TabsContent value="ai-assistant" className="flex-grow flex flex-col">
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
            <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-96" style={{ scrollbarWidth: 'thin' }}>
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleVoiceInput} 
                  disabled={!recognition}
                  className={cn(isListening && "bg-red-100 border-red-300")}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={isAiLoading}>
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4"/>}
                </Button>
            </div>
          </TabsContent>
        </Tabs>
    );
  };

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