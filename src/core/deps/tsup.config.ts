import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig({
  esbuildPlugins: [sassPlugin({ type: 'style' })],
  entry: {
    index: 'index.ts',
    'components/index': 'components/index.ts',
    'contexts/index': 'contexts/index.ts',
    'hooks/index': 'hooks/index.ts',
    'layouts/index': 'layouts/index.ts',
    'modals/index': 'modals/index.ts',
    'pages/index': 'pages/index.ts',
    'services/index': 'services/index.ts',
  },
  format: ['cjs', 'esm'],
  platform: 'browser',
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'devextreme',
    'devextreme-react',
    'axios',
  ],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.esm.js' : '.js',
    };
  },
});
