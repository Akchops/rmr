import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            // three is only needed for the PPF scene, which loads lazily, so it
            // is split out. In the SSR build both are external and cannot be
            // chunked at all.
            manualChunks: { three: ['three'], gsap: ['gsap'] },
          },
    },
  },
}));
