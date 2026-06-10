const helmet = require("helmet");

const scriptSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com",
  "blob:",
];

const styleSrcUrls = ["https://cdn.jsdelivr.net", "https://cdn.maptiler.com"];

const connectSrcUrls = ["https://api.maptiler.com", "https://cdn.maptiler.com"];

const fontSrcUrls = ["https://cdn.jsdelivr.net"];

const imgSrcUrls = [
  "https://res.cloudinary.com",
  "https://images.unsplash.com",
  "https://api.maptiler.com",
  "https://cdn.maptiler.com",
];

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      "style-src": ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      "img-src": ["'self'", "data:", "blob:", ...imgSrcUrls],
      "font-src": ["'self'", "data:", ...fontSrcUrls],
      "connect-src": ["'self'", ...connectSrcUrls],
      "media-src": ["'self'", "data:", "blob:"],
      "worker-src": ["'self'", "blob:"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = helmetConfig;
