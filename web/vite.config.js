import { defineConfig } from 'vite';

export default defineConfig({
  // The app is served from Android's /assets/www/ directory via WebViewAssetLoader.
  // Relative asset URLs are required; absolute /assets/... URLs point outside that directory.
  base: './',
  build: {
    assetsDir: 'assets',
    sourcemap: false
  }
});
