import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: ['src/*.ts'],
  plugins: [esbuildPlugin({
    ts: true
  })],
};
