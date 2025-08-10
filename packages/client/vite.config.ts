import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // The vite-plugin-monaco-editor needs to be configured.
    // The `(monacoEditorPlugin as any).default` syntax is a common
    // workaround for CJS/ESM module interop issues with this plugin.
    (monacoEditorPlugin as any).default({
      languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],
    }),
  ],
  resolve: {
    alias: {
      // This alias is common for shadcn/ui setups
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
