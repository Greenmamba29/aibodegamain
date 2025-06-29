import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import lingoCompiler from 'lingo.dev/compiler';

const viteConfig = {
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
};

export default defineConfig(() =>
  lingoCompiler.vite({
    sourceRoot: "src",
    targetLocales: ["es", "fr", "de"],
    models: {
      "*:*": "groq:mistral-saba-24b",
    },
  })(viteConfig),
);