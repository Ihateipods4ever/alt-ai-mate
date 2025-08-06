import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

// Use Vite's env variable for the API URL, with a fallback for local development.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Phase 2: The New Project page where users define their project.
 */
function NewProjectPage() {
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('web');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateCode = async () => {
        if (!prompt || !projectName) {
            setError('Please provide a project name and a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/generate-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, projectType, name: projectName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred.');
            }

            const data = await response.json();
            
            // Navigate to the editor page with the generated code and project type in the state.
            navigate('/app/editor', {
                state: {
                    generatedCode: data.code,
                    projectType: projectType,
                }
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
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
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="prompt">AI Prompt</Label>
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