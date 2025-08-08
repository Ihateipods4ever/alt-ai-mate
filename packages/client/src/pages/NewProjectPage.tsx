import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, AlertCircle, Wand2, Mic, MicOff } from 'lucide-react';
import { cn } from "@/lib/utils";

// Use Vite's env variable for the API URL, with a fallback for local development.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY;

/**
 * Phase 2: The New Project page where users define their project.
 */
function NewProjectPage() {
    const navigate = useNavigate();
    const { createProject, generateProject } = useApp();
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('web');
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('gemini-1.5-pro');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    const [apiKeys, setApiKeys] = useState({
        gemini: '',
        openai: '',
        anthropic: ''
    });
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

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

        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            
            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
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

    const handleGenerateCode = async () => {
        if (!prompt || !projectName) {
            setError('Please provide a project name and a prompt.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Use the new generateProject function from context
            const project = await generateProject(`${projectName}: ${prompt}`, projectType);
            
            // Navigate to the editor page with the generated project
            navigate('/app/editor', {
                state: {
                    projectId: project.id,
                    projectType: projectType,
                }
            });

        } catch (err: any) {
            setError(err.message || 'Failed to generate project');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) {
            setError('Please provide a prompt to enhance.');
            return;
        }

        if (!isModelAvailable(model)) {
            const provider = getModelProvider(model);
            setError(`Please configure your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key in Settings before using this model.`);
            return;
        }

        setIsEnhancing(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/enhance-prompt`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-internal-api-key': INTERNAL_API_KEY,
                },
                body: JSON.stringify({ 
                    prompt, 
                    projectType,
                    model,
                    apiKeys 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            const data = await response.json();
            setPrompt(data.enhancedPrompt);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsEnhancing(false);
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

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Create a New Project</CardTitle>
                <CardDescription>Describe your project, and let our AI generate the foundation for you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" placeholder="My Awesome App" value={projectName} onChange={e => setProjectName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="project-type">Project Type</Label>
                        <Select value={projectType} onValueChange={setProjectType}>
                            <SelectTrigger id="project-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="web">Web Application</SelectItem>
                                <SelectItem value="mobile">Mobile Application</SelectItem>
                                <SelectItem value="desktop">Desktop Application</SelectItem>
                                <SelectItem value="hardware">Hardware/IoT</SelectItem>
                                <SelectItem value="game">Game Development</SelectItem>
                                <SelectItem value="social">Social Media Platform</SelectItem>
                                <SelectItem value="ecommerce">E-commerce Store</SelectItem>
                                <SelectItem value="api">REST API/Backend</SelectItem>
                                <SelectItem value="blockchain">Blockchain/Web3</SelectItem>
                                <SelectItem value="ai">AI/Machine Learning</SelectItem>
                                <SelectItem value="chrome-extension">Chrome Extension</SelectItem>
                                <SelectItem value="chatbot">Chatbot/Virtual Assistant</SelectItem>
                                <SelectItem value="dashboard">Analytics Dashboard</SelectItem>
                                <SelectItem value="cms">Content Management System</SelectItem>
                                <SelectItem value="portfolio">Portfolio Website</SelectItem>
                                <SelectItem value="blog">Blog/News Site</SelectItem>
                                <SelectItem value="landing">Landing Page</SelectItem>
                                <SelectItem value="saas">SaaS Application</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="ai-model">AI Model</Label>
                        <Link to="/app/settings" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            Configure API Keys
                        </Link>
                    </div>
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger id="ai-model">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableModels.length > 0 ? (
                                availableModels.map((modelOption: any) => (
                                    <SelectItem 
                                        key={modelOption.id} 
                                        value={modelOption.id}
                                        disabled={!isModelAvailable(modelOption.id)}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span>{modelOption.name}</span>
                                            <div className="flex items-center gap-2 ml-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {modelOption.provider}
                                                </Badge>
                                                {!isModelAvailable(modelOption.id) && (
                                                    <AlertCircle className="h-3 w-3 text-orange-500" />
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Default)</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {!isModelAvailable(model) && (
                        <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <span>API key required for this model. Configure it in Settings.</span>
                        </div>
                    )}
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="prompt">AI Prompt</Label>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleVoiceInput} 
                                disabled={!recognition}
                                className={cn(isListening && "bg-red-100 border-red-300")}
                            >
                                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleEnhancePrompt} 
                                disabled={isEnhancing || !prompt.trim()}
                            >
                                {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                Enhance
                            </Button>
                        </div>
                    </div>
                    <Textarea id="prompt" placeholder="e.g., 'A simple to-do list app with a clean interface'" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter>
                <Button onClick={handleGenerateCode} disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Generating...' : 'Generate Code'}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default NewProjectPage;