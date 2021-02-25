import glob from 'globby';
import isCI from 'is-ci';
import { baseDir } from 'scripts';
import type { Configuration } from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const babelConfig = require(baseDir('packages', 'storybook-react', '.babelrc.js'));

const stories = glob.sync(baseDir('packages/*/__stories__/*.stories.(tsx)'), {
  ignore: ['**/node_modules'],
});

const mode = isCI ? 'production' : 'development';

async function webpackFinal(config: Configuration): Promise<Configuration> {
  config.mode = mode;
  // config?.plugins?.push(new DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify(mode) } }));

  config.module?.rules?.push({
    test: /\.tsx?$/,
    use: [{ loader: require.resolve('babel-loader'), options: babelConfig }],
    exclude: [/node_modules/],
  });

  const plugins = config.plugins ?? [];
  const resolve = config.resolve ?? {};
  resolve.extensions = resolve.extensions ?? [];

  resolve.extensions.push('.ts', '.tsx');

  const alias = resolve.alias ?? {};
  config.resolve = resolve;
  config.plugins = plugins;

  // Use emotion as an alias for linaria.
  alias['@linaria/core'] = '@emotion/css';
  resolve.alias = alias;

  return config;
}

export const main = {
  stories,
  // addons,
  // presets,
  webpackFinal,
};
