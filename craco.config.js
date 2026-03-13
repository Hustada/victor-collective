const path = require('path');
const webpack = require('webpack');

module.exports = {
  jest: {
    configure: (jestConfig) => {
      // react-router-dom v7 has a broken "main" field (points to nonexistent dist/main.js).
      // Map both packages to their actual CJS entry files via filesystem paths.
      const rrDomDir = path.dirname(require.resolve('react-router-dom/package.json'));
      const rrDir = path.dirname(require.resolve('react-router/package.json'));
      jestConfig.moduleNameMapper = {
        ...jestConfig.moduleNameMapper,
        '^react-router-dom$': path.join(rrDomDir, 'dist', 'index.js'),
        '^react-router$': path.join(rrDir, 'dist', 'development', 'index.js'),
        '^react-router/dom$': path.join(rrDir, 'dist', 'development', 'dom-export.js'),
        '\\.(css|less|scss|sass)$': '<rootDir>/jest/styleMock.js',
      };
      // react-router-dom v7 and react-router use ESM — need to transform them
      jestConfig.transformIgnorePatterns = [
        '/node_modules/(?!(react-router|react-router-dom)/)',
      ];
      // Transform .md files to plain strings in tests
      jestConfig.transform = {
        ...jestConfig.transform,
        '\\.md$': '<rootDir>/jest/mdTransform.js',
      };
      return jestConfig;
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer/'),
      };

      // Provide Buffer polyfill
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Add markdown loader
      webpackConfig.module.rules.push({
        test: /\.md$/,
        type: 'asset/source'
      });

      return webpackConfig;
    },
  },
};
