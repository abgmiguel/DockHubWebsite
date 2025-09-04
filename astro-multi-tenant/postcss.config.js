const site = process.env.SITE || 'codersinflow.com';

module.exports = {
  plugins: {
    tailwindcss: {
      config: `./src/sites/${site}/tailwind.config.cjs`
    },
    autoprefixer: {},
  },
}