import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": contentSecurityPolicy,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js is the intentional core of this single-screen experience.
    chunkSizeWarningLimit: 800,
    minify: "oxc",
    sourcemap: false,
  },
  preview: {
    headers: securityHeaders,
  },
  server: {
    proxy: {
      '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
