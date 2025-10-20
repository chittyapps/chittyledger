import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const chittyServiceOverlay = (): Plugin => ({
  name: "chitty-service-runtime-overlay",
});

const chittyServiceCartographer = (): Plugin => ({
  name: "chitty-service-cartographer",
  configureServer(server) {
    server.httpServer?.once("listening", () => {
      const address = server.httpServer?.address();
      if (typeof address === "object" && address) {
        console.info(
          `[chitty-service] development server listening on port ${address.port}`,
        );
      }
    });
  },
});

const chittyAuthBridge = (): Plugin => ({
  name: "chitty-auth-bridge",
  configureServer(server) {
    server.httpServer?.once("listening", () => {
      const address = server.httpServer?.address();
      if (typeof address === "object" && address) {
        console.info(
          `[chittyauth] connect your local session via http://localhost:${address.port}/chittyos/chittyauth`,
        );
      }
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    chittyServiceOverlay(),
    chittyAuthBridge(),
    ...(process.env.NODE_ENV !== "production"
      ? [chittyServiceCartographer()]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
