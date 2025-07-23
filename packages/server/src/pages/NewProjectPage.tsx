import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Configuration for project types and their specific forms
const projectTypes = [
    { id: 'web', name: 'Web App' },
    { id: 'mobile', name: 'Mobile App' },
    { id: 'desktop', name: 'Desktop App' },
    { id: 'game', name: 'Game' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'social', name: 'Social Media' },
    { id: 'hardware', name: 'Hardware/IoT' },
];

const dynamicFields = {
    web: [
        { id: 'frontend', label: 'Frontend Framework', options: ['React', 'Vue', 'Svelte', 'Angular'] },
        { id: 'backend', label: 'Backend Language', options: ['Node.js', 'Python', 'Go', 'Rust'] },
    ],
    mobile: [
        { id: 'platform', label: 'Platform', options: ['iOS & Android (Cross-Platform)', 'iOS (Native)', 'Android (Native)'] },
    ],
    desktop: [
        { id: 'os', label: 'Target OS', options: ['macOS, Windows, Linux', 'macOS only', 'Windows only'] },
    ],
    hardware: [
        { id: 'microcontroller', label: 'Microcontroller', options: ['Arduino', 'Raspberry Pi', 'ESP32'] },
        { id: 'components', label: 'Key Components', options: ['Sensors', 'Actuators', 'Displays'] },
    ],
};

/**
 * Phase 2: The AI Project Creation Hub
 * Guides the user through creating a new project, from idea to detailed requirements.
 */
function NewProjectPage() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [reconstructedPrompt, setReconstructedPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);

    // Simulate AI prompt enhancement
    const handleGeneratePrompt = () => {
        if (!prompt) return;
        setIsGenerating(true);
        setTimeout(() => {
            const enhanced = `Based on the user's idea of "${prompt}", construct a full-stack application with the following architecture:
- A scalable and responsive frontend using modern web technologies.
- A robust backend API to handle data processing and business logic.
- A secure and efficient database schema.
- Comprehensive user authentication and authorization mechanisms.
- The system should be designed for high availability and deployed on a cloud-native infrastructure.`;
            setReconstructedPrompt(enhanced);
            setIsGenerating(false);
        }, 1500);
    };
    
    // Navigate to editor on final step
    const handleStartBuilding = () => {
        // Pass project type to editor page via state
        navigate('/editor', { state: { projectType: selectedType } });
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            {/* Step 1: Smart Prompt Engine */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Describe Your Vision</CardTitle>
                    <CardDescription>Start with your core idea. Our AI will help refine it into a technical blueprint.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="prompt-input">Your Idea</Label>
                    <Textarea id="prompt-input" placeholder="e.g., 'A platform for local artists to sell their work...'" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                    <Button onClick={handleGeneratePrompt} disabled={isGenerating || !prompt}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Generate Enhanced Prompt
                    </Button>
                    {reconstructedPrompt && (
                        <div>
                            <Label htmlFor="reconstructed-prompt">Reconstructed Prompt</Label>
                            <Textarea id="reconstructed-prompt" readOnly value={reconstructedPrompt} rows={6} className="mt-2 bg-muted" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Step 2: Project Type Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>2. Select Project Type</CardTitle>
                    <CardDescription>Choose the type of application or prototype you want to build.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {projectTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                                'rounded-lg border p-4 text-center transition-all hover:shadow-lg',
                                selectedType === type.id ? 'border-primary ring-2 ring-primary' : 'border-border'
                            )}
                        >
                            <p className="font-semibold">{type.name}</p>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Step 3: Dynamic Requirements Form */}
            {selectedType && dynamicFields[selectedType as keyof typeof dynamicFields] && (
                 <Card>
                    <CardHeader>
                        <CardTitle>3. Specify Details</CardTitle>
                        <CardDescription>Provide more information based on your project type.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dynamicFields[selectedType as keyof typeof dynamicFields].map((field) => (
                             <div key={field.id} className="space-y-2">
                                <Label>{field.label}</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${field.label}...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Final action button */}
            {selectedType && (
                <div className="text-center">
                    <Button size="lg" onClick={handleStartBuilding}>
                        Start Building
                        <MoveRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default NewProjectPage;