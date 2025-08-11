"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AIService {
    gemini = null;
    openai = null;
    anthropic = null;
    constructor() {
        // Initialize AI clients with API keys from environment
        if (process.env.GEMINI_API_KEY) {
            this.gemini = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        if (process.env.OPENAI_API_KEY) {
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new sdk_1.default({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }
    }
    async generateCode(request) {
        const { prompt, language = 'javascript', framework = 'none', projectType = 'web' } = request;
        // Create a comprehensive prompt for code generation
        const systemPrompt = `You are an expert software developer. Generate high-quality, production-ready code based on the user's requirements.

Requirements:
- Language: ${language}
- Framework: ${framework}
- Project Type: ${projectType}
- User Request: ${prompt}

Please generate complete, functional code that:
1. Follows best practices and conventions
2. Includes proper error handling
3. Has clear comments explaining key functionality
4. Is ready to run without modifications
5. Uses modern syntax and patterns

Return only the code without explanations or markdown formatting.`;
        try {
            // Try Gemini first (most reliable for code generation)
            if (this.gemini) {
                return await this.generateWithGemini(systemPrompt);
            }
            // Fallback to OpenAI
            if (this.openai) {
                return await this.generateWithOpenAI(systemPrompt);
            }
            // Fallback to Anthropic
            if (this.anthropic) {
                return await this.generateWithAnthropic(systemPrompt);
            }
            // Final fallback - generate template code
            return this.generateFallbackCode(request);
        }
        catch (error) {
            console.error('AI code generation failed:', error);
            return this.generateFallbackCode(request);
        }
    }
    async generateWithGemini(prompt) {
        if (!this.gemini)
            throw new Error('Gemini not initialized');
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const code = response.text();
        return {
            code: this.cleanCode(code),
            language: 'javascript',
            framework: 'none'
        };
    }
    async generateWithOpenAI(prompt) {
        if (!this.openai)
            throw new Error('OpenAI not initialized');
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7,
        });
        const code = completion.choices[0]?.message?.content || '';
        return {
            code: this.cleanCode(code),
            language: 'javascript',
            framework: 'none'
        };
    }
    async generateWithAnthropic(prompt) {
        if (!this.anthropic)
            throw new Error('Anthropic not initialized');
        const message = await this.anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
        });
        const code = message.content[0]?.type === 'text' ? message.content[0].text : '';
        return {
            code: this.cleanCode(code),
            language: 'javascript',
            framework: 'none'
        };
    }
    generateFallbackCode(request) {
        const { prompt, language = 'javascript', framework = 'none', projectType = 'web' } = request;
        let code = '';
        switch (language.toLowerCase()) {
            case 'typescript':
            case 'tsx':
                if (framework.toLowerCase() === 'react') {
                    code = `import React, { useState, useEffect } from 'react';

interface Props {
  title?: string;
}

const App: React.FC<Props> = ({ title = '${prompt}' }) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize component
    setData(['Welcome to your new app!']);
  }, []);

  const handleAction = () => {
    setLoading(true);
    // TODO: Implement functionality for: ${prompt}
    setTimeout(() => {
      setData(prev => [...prev, 'Action completed!']);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="app">
      <h1>{title}</h1>
      <div className="content">
        {data.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing...' : 'Take Action'}
      </button>
    </div>
  );
};

export default App;`;
                }
                else {
                    code = `// ${prompt}
interface Config {
  name: string;
  version: string;
}

class Application {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public start(): void {
    console.log(\`Starting \${this.config.name} v\${this.config.version}\`);
    this.initialize();
  }

  private initialize(): void {
    // TODO: Implement initialization logic for: ${prompt}
    console.log('Application initialized successfully');
  }

  public processData(data: any[]): any[] {
    // TODO: Implement data processing for: ${prompt}
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }));
  }
}

export default Application;`;
                }
                break;
            case 'python':
                code = `#!/usr/bin/env python3
"""
${prompt}
"""

import asyncio
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Application:
    def __init__(self, name: str = "${prompt}"):
        self.name = name
        self.data: List[Dict[str, Any]] = []
        
    async def initialize(self) -> None:
        """Initialize the application"""
        logger.info(f"Initializing {self.name}")
        # TODO: Implement initialization logic for: ${prompt}
        
    async def process_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process input data"""
        # TODO: Implement data processing for: ${prompt}
        processed_data = []
        for item in data:
            processed_item = {
                **item,
                'processed': True,
                'timestamp': asyncio.get_event_loop().time()
            }
            processed_data.append(processed_item)
        return processed_data
        
    async def run(self) -> None:
        """Main application loop"""
        await self.initialize()
        logger.info(f"{self.name} is running")
        # TODO: Implement main logic for: ${prompt}

if __name__ == "__main__":
    app = Application()
    asyncio.run(app.run())`;
                break;
            default: // JavaScript
                if (framework.toLowerCase() === 'react') {
                    code = `import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize component
    setData(['Welcome to your new app!']);
  }, []);

  const handleAction = () => {
    setLoading(true);
    // TODO: Implement functionality for: ${prompt}
    setTimeout(() => {
      setData(prev => [...prev, 'Action completed!']);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="app">
      <h1>${prompt}</h1>
      <div className="content">
        {data.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Processing...' : 'Take Action'}
      </button>
    </div>
  );
}

export default App;`;
                }
                else if (framework.toLowerCase() === 'node' || projectType.toLowerCase() === 'api') {
                    code = `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '${prompt}',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/data', (req, res) => {
  // TODO: Implement data endpoint for: ${prompt}
  res.json({
    data: ['Sample data item 1', 'Sample data item 2'],
    count: 2
  });
});

app.post('/api/process', (req, res) => {
  const { data } = req.body;
  
  // TODO: Implement processing logic for: ${prompt}
  const processedData = data ? data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date().toISOString()
  })) : [];
  
  res.json({ 
    success: true,
    processedData,
    message: 'Data processed successfully'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`Application: ${prompt}\`);
});`;
                }
                else {
                    code = `// ${prompt}

class Application {
  constructor(name = '${prompt}') {
    this.name = name;
    this.data = [];
    this.initialized = false;
  }

  initialize() {
    console.log(\`Initializing \${this.name}\`);
    // TODO: Implement initialization logic for: ${prompt}
    this.initialized = true;
    return this;
  }

  processData(inputData) {
    if (!this.initialized) {
      throw new Error('Application not initialized');
    }
    
    // TODO: Implement data processing for: ${prompt}
    return inputData.map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }));
  }

  async run() {
    this.initialize();
    console.log(\`\${this.name} is running\`);
    
    // TODO: Implement main application logic for: ${prompt}
    const sampleData = [
      { id: 1, value: 'Sample data 1' },
      { id: 2, value: 'Sample data 2' }
    ];
    
    const processed = this.processData(sampleData);
    console.log('Processed data:', processed);
    
    return processed;
  }
}

// Usage
const app = new Application();
app.run().then(result => {
  console.log('Application completed:', result);
}).catch(error => {
  console.error('Application error:', error);
});

export default Application;`;
                }
        }
        return {
            code,
            language,
            framework
        };
    }
    cleanCode(code) {
        // Remove markdown code blocks if present
        return code
            .replace(/^```[\w]*\n/, '')
            .replace(/\n```$/, '')
            .trim();
    }
}
exports.default = new AIService();
//# sourceMappingURL=aiService.js.map