import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Save, Key } from "lucide-react";

/**
 * Settings page with API key management for multiple AI providers.
 */
function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false
  });
  
  const [savedStatus, setSavedStatus] = useState('');
  const saveTimeoutRef = useRef<number | null>(null);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('alt-ai-mate-api-keys');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (error) {
        console.error('Error loading saved API keys:', error);
      }
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveApiKeys = (keys: typeof apiKeys) => {
    try {
      localStorage.setItem('alt-ai-mate-api-keys', JSON.stringify(keys));
      setSavedStatus('API keys saved successfully!');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => setSavedStatus(''), 3000);
    } catch (error) {
      setSavedStatus('Error saving API keys');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = window.setTimeout(() => setSavedStatus(''), 3000);
    }
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    const newKeys = { ...apiKeys, [provider]: value };
    setApiKeys(newKeys);
    saveApiKeys(newKeys);
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev]
    }));
  };

  const clearApiKey = (provider: string) => {
    const newKeys = {
      ...apiKeys,
      [provider]: ''
    };
    setApiKeys(newKeys);
    saveApiKeys(newKeys);
  };

  const providers = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Get your API key from Google AI Studio',
      url: 'https://makersuite.google.com/app/apikey',
      models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini Pro']
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Get your API key from OpenAI Platform',
      url: 'https://platform.openai.com/api-keys',
      models: ['GPT-4', 'GPT-4 Turbo', 'GPT-3.5 Turbo']
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Get your API key from Anthropic Console',
      url: 'https://console.anthropic.com/',
      models: ['Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku']
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                AI Provider API Keys
              </CardTitle>
              <CardDescription>
                Configure your API keys for different AI providers. Keys are stored locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {savedStatus && (
                <div className={`p-3 rounded-md text-sm ${
                  savedStatus.includes('Error') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {savedStatus}
                </div>
              )}
              
              {providers.map((provider) => (
                <Card key={provider.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                      <Badge variant={apiKeys[provider.id as keyof typeof apiKeys] ? "default" : "secondary"}>
                        {apiKeys[provider.id as keyof typeof apiKeys] ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id={`${provider.id}-key`}
                            type={showKeys[provider.id as keyof typeof showKeys] ? "text" : "password"}
                            placeholder={`Enter your ${provider.name} API key`}
                            name={`${provider.id}-key`}
                            value={apiKeys[provider.id as keyof typeof apiKeys]}
                            onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleShowKey(provider.id)}
                          >
                            {showKeys[provider.id as keyof typeof showKeys] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => clearApiKey(provider.id)}
                          disabled={!apiKeys[provider.id as keyof typeof apiKeys]}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Available Models:</Label>
                      <div className="flex flex-wrap gap-1">
                        {provider.models.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <a 
                        href={provider.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Get your {provider.name} API key →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings and email address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" name="email" type="email" defaultValue="developer@alt-ai-mate.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input id="profile-name" name="name" defaultValue="Developer" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;