const MODE_PROD = process.env.NODE_ENV === "production";
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-import': {},
    ...(MODE_PROD ? { cssnano: {} } : {}),
  },
};
