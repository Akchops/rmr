import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild, mode }) => {
  // `--mode singlefile` produces one JS chunk with no dynamic imports, for the
  // self-contained preview build (tools/build-preview.mjs). Code splitting is
  // the right default everywhere else.
  const singlefile = mode === 'singlefile';

  return {
    plugins: [react()],
    build: {
      target: 'es2020',
      assetsInlineLimit: 2048,
      outDir: singlefile ? 'dist-preview' : 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: isSsrBuild
          ? {}
          : singlefile
            ? { inlineDynamicImports: true }
            : {
                // three is only needed for the PPF scene, which loads lazily,
                // so it is split out. In the SSR build both are external and
                // cannot be chunked at all.
                manualChunks: { three: ['three'], gsap: ['gsap'] },
              },
      },
    },
  };
});
