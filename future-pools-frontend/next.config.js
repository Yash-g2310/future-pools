module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['i.postimg.cc'], // Add any other domains you may need for images
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
    };
    return config;
  },
};