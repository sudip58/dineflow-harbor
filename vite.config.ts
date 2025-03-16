
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Make Supabase environment variables available
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://clmsoetktmvhazctlans.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXNvZXRrdG12aGF6Y3RsYW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MTE5NTIsImV4cCI6MjA1NDA4Nzk1Mn0.4j8CLdQn9By5XawbdC4LlWhFumIQT6gqCl2lZnQwQWk'),
  },
}));
