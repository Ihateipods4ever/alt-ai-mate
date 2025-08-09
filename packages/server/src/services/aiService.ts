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

// Main function to generate the entire application
export async function generateApplication(prompt: string): Promise<Record<string, string>> {
  if (!openai) {
    return Promise.resolve({ 'error.txt': 'AI features are disabled. Please set your OPENAI_API_KEY.' });
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
