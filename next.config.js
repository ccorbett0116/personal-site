/** @type {import('next').NextConfig} */
module.exports = {
  swcMinify: true,  // Uses Rust-based SWC for faster minification
    compiler: {
      styledComponents: true,  // If using CSS-in-JS
  },
}
