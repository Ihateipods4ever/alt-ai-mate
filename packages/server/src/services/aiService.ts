import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY is not set. AI-powered features will be disabled.');
}

// Phase 1: Deconstruct the prompt and create a plan
async function createPlan(prompt: string): Promise<any> {
  const planningPrompt = `
You are an expert software architect. A user wants to build a React application.
Analyze their request and break it down into a detailed, actionable plan.

User's request: "${prompt}"

Your output MUST be a JSON object with the following structure:
{
  "appName": "A short, descriptive name for the app in camelCase.",
  "description": "A one-sentence description of the application.",
  "features": [
    "A list of key features and functionalities."
  ],
  "fileStructure": {
    "src/App.tsx": "The main application component. It should import and render other components.",
    "src/index.css": "CSS file for basic styling.",
    "package.json": "The project's package.json file.",
    "src/components/ExampleComponent.tsx": "Description of an example component."
  }
}

- **fileStructure**: List all the files that need to be created. Keys are file paths, and values are descriptions of what each file should contain.
- Be thorough and think step-by-step. The plan should be comprehensive enough for another AI to generate the code.
`;

  if (!openai) {
    throw new Error('OpenAI is not configured');
  }
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: planningPrompt },
      { role: 'user', content: `Create a plan for this app: ${prompt}` }
    ],
    response_format: { type: "json_object" },
  });

  const responseJsonString = completion.choices[0].message.content;
  if (!responseJsonString) {
    throw new Error("Failed to get a valid plan from the AI.");
  }
  return JSON.parse(responseJsonString);
}

// Phase 2: Generate code for a single file based on the plan
async function generateFile(filePath: string, plan: any, generatedFiles: Record<string, string>): Promise<string> {
  const fileDescription = plan.fileStructure[filePath];
  
  const generationPrompt = `
You are an expert React developer. Your task is to write the code for a single file based on the provided plan and context.

**Overall App Plan:**
- **App Name:** ${plan.appName}
- **Description:** ${plan.description}
- **Features:**
${plan.features.map((f: string) => `  - ${f}`).join('\n')}

**File to Generate:**
- **Path:** \`${filePath}\`
- **Description:** ${fileDescription}

**Project Context (already generated files):**
${Object.entries(generatedFiles).map(([path, code]) => `
\`${path}\`:
\`\`\`
${code}
\`\`\`
`).join('\n') || 'No files generated yet.'}

**Instructions:**
- Write the complete, production-quality code for the file: \`${filePath}\`.
- The code must be fully functional, clean, and well-commented.
- Adhere to modern best practices for React and TypeScript.
- Do not include any markdown formatting (e.g., \`\`\`typescript) in your response.
- Your response should be ONLY the raw code for the file.
`;

  if (!openai) {
    throw new Error('OpenAI is not configured');
  }
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'system', content: generationPrompt },
      { role: 'user', content: `Generate the code for ${filePath}` }
    ],
  });

  const code = completion.choices[0].message.content;
  if (!code) {
    throw new Error(`Failed to generate code for ${filePath}`);
  }
  return code;
}

// Fallback function to generate a basic template when OpenAI is not available
function generateFallbackApplication(prompt: string): Record<string, string> {
  const appName = prompt.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'myapp';
  
  return {
    'src/App.tsx': `import React, { useState } from 'react';
import './index.css';

function App() {
  const [message, setMessage] = useState('Hello World!');

  return (
    <div className="app">
      <header className="app-header">
        <h1>${appName.charAt(0).toUpperCase() + appName.slice(1)}</h1>
        <p>Generated from prompt: "${prompt}"</p>
        <p>{message}</p>
        <button onClick={() => setMessage('Button clicked!')}>
          Click me!
        </button>
      </header>
    </div>
  );
}

export default App;`,

    'src/index.css': `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  text-align: center;
}

.app-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

button {
  background-color: #61dafb;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #21a9c7;
}`,

    'package.json': `{
  "name": "${appName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^16.7.13",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.4.2",
    "web-vitals": "^2.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,

    'README.md': `# ${appName.charAt(0).toUpperCase() + appName.slice(1)}

Generated from prompt: "${prompt}"

## Note
This is a basic template generated because OpenAI API is not configured.
To get AI-powered code generation, please configure your OPENAI_API_KEY in the backend.

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm run build\` - Builds the app for production
- \`npm test\` - Launches the test runner
`
  };
}

// Main function to generate the entire application
export async function generateApplication(prompt: string): Promise<Record<string, string>> {
  if (!openai) {
    console.warn('OpenAI not configured, using fallback generator');
    return generateFallbackApplication(prompt);
  }
  console.log('Phase 1: Creating a plan...');
  const plan = await createPlan(prompt);
  console.log('Plan created:', plan);

  const generatedFiles: Record<string, string> = {};
  const filePaths = Object.keys(plan.fileStructure);

  console.log('Phase 2: Generating files...');
  for (const filePath of filePaths) {
    console.log(`- Generating ${filePath}...`);
    const code = await generateFile(filePath, plan, generatedFiles);
    generatedFiles[filePath] = code;
    console.log(`- Finished ${filePath}.`);
  }

  console.log('Application generation complete!');
  return generatedFiles;
}
