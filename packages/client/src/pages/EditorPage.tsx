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
import LivePreview from '@/components/preview/LivePreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
                className={cn(
                    "flex items-center gap-2 cursor-pointer py-2 pr-2 hover:bg-muted rounded-md text-sm",
                    `pl-[${(level * 1.5) + 0.5}rem]`, // Use arbitrary padding for dynamic indentation
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

    const userMessage: Message = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsAiLoading(true);

    // Use a simple keyword check to decide if the user wants to generate a whole new app
    const isGenerationRequest = /generate|create|build|make a/i.test(userInput);

    if (isGenerationRequest) {
      // --- Handle Full Application Generation ---
      try {
        const response = await fetch(`${API_URL}/api/generate-app`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: userInput }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate application.');
        }

        const data = await response.json();
        const { files: generatedFiles } = data;

        // The AI returns a file structure, let's update our state.
        // This will replace the current file structure with the new one.
        const newFileState: FileState = {};
        for (const path in generatedFiles) {
          newFileState[path] = { content: generatedFiles[path] };
        }

        setFiles(newFileState);
        setFileTree(buildFileTree(newFileState));

        // Set the active file to the new App.tsx and update the editor
        const newActiveFile = 'src/App.tsx';
        setActiveFile(newActiveFile);
        setEditorContent(newFileState[newActiveFile]?.content || '');

        if (currentProject) {
          updateProjectFiles(currentProject.id, newFileState);
        }

        const aiResponse: Message = {
          from: 'ai',
          text: `I've generated a new application for you. You can see the files on the left and a live preview on the right.`,
        };
        setMessages(prev => [...prev, aiResponse]);

      } catch (error: any) {
        console.error('App generation error:', error);
        const aiResponse: Message = {
          from: 'ai',
          text: `Sorry, I encountered an error while generating the application: ${error.message}`,
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } else {
      // --- Handle Regular AI Chat Assistance ---
      try {
        // Get API keys from localStorage
        const savedApiKeys = localStorage.getItem('alt-ai-mate-api-keys');
        let apiKeys = {};
        if (savedApiKeys) {
          try {
            apiKeys = JSON.parse(savedApiKeys);
          } catch (error) {
            console.warn('Failed to parse saved API keys:', error);
          }
        }

        const response = await fetch(`${API_URL}/api/ai-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            context: editorContent, // Send the current code as context
            model: selectedModel,
            apiKeys, // Send API keys to backend
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AI chat failed.');
        }

        const data = await response.json();
        const aiResponse: Message = { from: 'ai', text: data.response };
        setMessages(prev => [...prev, aiResponse]);

      } catch (error: any) {
        console.error('AI chat error:', error);
        
        // Intelligent fallback AI assistant
        const generateLocalAIResponse = (userMessage: string, context: string): string => {
          const lowerMessage = userMessage.toLowerCase();
          
          // Code help and explanations
          if (lowerMessage.includes('explain') || lowerMessage.includes('what does') || lowerMessage.includes('how does')) {
            if (context.includes('function') || context.includes('const') || context.includes('let')) {
              return `I can see you're working with JavaScript code. Based on your code context, here are some key points:

• **Functions**: Use \`function name() {}\` or \`const name = () => {}\` for reusable code blocks
• **Variables**: Use \`const\` for constants, \`let\` for variables that change
• **Best Practices**: Always use meaningful variable names and add comments

Would you like me to help you with a specific part of your code?`;
            }
            return `I'd be happy to explain! While I can't access advanced AI features right now, I can help with:

• **Code structure and syntax**
• **Best practices and patterns**
• **Debugging common issues**
• **Suggesting improvements**

What specific part would you like me to explain?`;
          }
          
          // Code generation requests
          if (lowerMessage.includes('create') || lowerMessage.includes('generate') || lowerMessage.includes('make') || lowerMessage.includes('build')) {
            if (lowerMessage.includes('function')) {
              return `I can help you create a function! Here's a template:

\`\`\`javascript
function myFunction(parameter) {
    // Your code here
    return result;
}

// Or using arrow function syntax:
const myFunction = (parameter) => {
    // Your code here
    return result;
}
\`\`\`

What specific functionality do you need?`;
            }
            
            if (lowerMessage.includes('component') || lowerMessage.includes('react')) {
              return `Here's a React component template:

\`\`\`jsx
import React, { useState } from 'react';

const MyComponent = () => {
    const [state, setState] = useState('');
    
    return (
        <div>
            <h1>My Component</h1>
            {/* Your JSX here */}
        </div>
    );
};

export default MyComponent;
\`\`\`

What kind of component do you want to create?`;
            }
            
            return `I can help you create code! Try using the **Generate Code** button above for:

• **Text editors** - Full-featured editors with formatting
• **Calculators** - Scientific calculators with memory functions  
• **Todo lists** - Task management with priorities
• **Forms** - Input validation and submission
• **APIs** - REST endpoint templates

Or tell me specifically what you'd like to build!`;
          }
          
          // Debugging help
          if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('fix') || lowerMessage.includes('debug')) {
            return `I can help debug your code! Common issues and solutions:

**Syntax Errors:**
• Missing semicolons, brackets, or parentheses
• Typos in variable/function names

**Runtime Errors:**
• \`undefined\` variables - check spelling and scope
• \`Cannot read property\` - check if object exists first

**Logic Errors:**
• Use \`console.log()\` to trace values
• Check conditional statements and loops

Share your error message or problematic code, and I'll help identify the issue!`;
          }
          
          // Performance and optimization
          if (lowerMessage.includes('optimize') || lowerMessage.includes('performance') || lowerMessage.includes('faster')) {
            return `Here are key optimization tips:

**JavaScript Performance:**
• Use \`const\` and \`let\` instead of \`var\`
• Avoid global variables
• Use efficient loops (\`for\` vs \`forEach\` for large arrays)
• Debounce expensive operations

**React Performance:**
• Use \`React.memo()\` for expensive components
• Implement \`useMemo()\` and \`useCallback()\` for heavy computations
• Avoid inline functions in JSX

**General:**
• Minimize DOM manipulations
• Use efficient data structures
• Implement lazy loading for large datasets

What specific area would you like to optimize?`;
          }
          
          // Learning and tutorials
          if (lowerMessage.includes('learn') || lowerMessage.includes('tutorial') || lowerMessage.includes('how to')) {
            return `I'd love to help you learn! Here are some great starting points:

**JavaScript Fundamentals:**
• Variables and data types
• Functions and scope
• Objects and arrays
• Async/await and promises

**React Concepts:**
• Components and JSX
• State and props
• Hooks (useState, useEffect)
• Event handling

**Best Practices:**
• Code organization
• Error handling
• Testing strategies
• Version control with Git

What topic interests you most? I can provide specific examples and explanations!`;
          }
          
          // Default helpful response
          return `Hi! I'm your local coding assistant. While the advanced AI features are temporarily unavailable, I can still help you with:

🔧 **Code Generation** - Use the "Generate Code" button for instant templates
📝 **Code Review** - I can spot common issues and suggest improvements  
🐛 **Debugging** - Help identify and fix errors
📚 **Learning** - Explain concepts and best practices
⚡ **Optimization** - Performance tips and efficient patterns

**Quick Tips:**
• Try generating a "calculator" or "text editor" with the Generate Code button
• Use meaningful variable names and add comments
• Test your code frequently with \`console.log()\`

What would you like help with today?`;
        };
        
        const aiResponse: Message = {
          from: 'ai',
          text: generateLocalAIResponse(userInput, editorContent),
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    }

    setIsAiLoading(false);
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

    const cssContent = files['src/index.css']?.content || '';
    const jsContent = editorContent || files['src/App.tsx']?.content || '';

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
              <LivePreview code={jsContent} css={cssContent} />
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
            <div className="flex-grow p-4 space-y-4 overflow-y-auto max-h-96 thin-scrollbar">
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
