import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 5173, strictPort: true },
  build: {
    target: "es2019",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules\/(react|react-dom|scheduler)\//,
              priority: 30,
            },
            {
              name: "material-vendor",
              test: /node_modules\/(@mui|@emotion)\//,
              priority: 20,
            },
            {
              name: "form-vendor",
              test: /node_modules\/(zod|react-hook-form|@hookform)\//,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
