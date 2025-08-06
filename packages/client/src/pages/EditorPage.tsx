import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, Folder, HardDrive, Cpu, MemoryStick, SendHorizontal, Bot } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Phase 3 & 7: The Integrated Editor & Hardware Prototyping page.
 * The view adapts based on the project type selected in the New Project page.
 */
function EditorPage() {
  const location = useLocation();
  // Determine project type from navigation state, default to 'web'
  const { projectType = 'web', generatedCode } = location.state || {};
  const editorDefaultValue = generatedCode || `// Welcome to ALT-AI-MATE Editor\n// Start typing your code here.\nfunction App() {\n  return <h1>Hello, World!</h1>\n}`;
  
  const isHardwareProject = projectType === 'hardware';

  // State for AI Assistant Chat
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! How can I help you debug or optimize your code?' }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if(!input.trim()) return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
        setMessages([...newMessages, { from: 'ai', text: 'That\'s an interesting question. Let me analyze your code...' }]);
    }, 1000);
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
            <li key={file.name} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-md">
                {file.type === 'folder' ? <Folder className="h-4 w-4 text-primary"/> : <FileText className="h-4 w-4 text-muted-foreground"/>}
                {file.name}
            </li>
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
            theme="vs-dark"
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
              <iframe src="about:blank" title="Live Preview" className="w-full h-full bg-white border rounded-md shadow-inner" />
            </div>
          </TabsContent>
          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="flex-grow flex flex-col">
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
                <Input placeholder="Ask for help..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                <Button onClick={handleSendMessage}><SendHorizontal className="h-4 w-4"/></Button>
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