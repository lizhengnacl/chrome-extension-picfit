import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/entry.tsx',
    },
  },
  output: {
    copy: [
      { from: './src/public', to: './' },
    ],
    filenameHash: false,
    assetPrefix: './',
    sourceMap: {
      js: 'source-map',
      css: true,
    },
  },
  html: {
    title: '图适配 (PicFit)',
    template: './src/index.html',
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
  },
});
      