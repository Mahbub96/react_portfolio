/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mahbub.dev",
      },
    ],
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // URL and routing
  trailingSlash: true,
  generateEtags: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["react-icons", "framer-motion"],
    scrollRestoration: true,
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Enhanced security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Critical Security Headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "X-Download-Options",
            value: "noopen",
          },
          // NOTE: no "X-Requested-With" header here. It was previously sent on
          // every response; X-Requested-With is a *request* header used by XHR
          // clients and carries no meaning coming back from a server.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // Performance headers
          // NOTE: no long-lived Cache-Control here. This block applies to every
          // route including HTML documents; an immutable year-long cache meant
          // returning visitors kept a stale page and never saw new deploys.
          // Immutable caching is scoped to fingerprinted/static assets below.
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },

      // Fingerprinted build output is safe to cache forever
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      // Specific headers for static assets
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },

      // Headers for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },

      // Headers for authentication routes
      {
        source: "/api/auth/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, private",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },

      // Headers for sitemap
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },

      // Headers for robots.txt
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },

  // URL rewrites and redirects
  async rewrites() {
    return [
      // NOTE: /sitemap.xml is deliberately NOT rewritten to an API route.
      // It is served by src/app/sitemap.js (live data) and by the static
      // public/sitemap.xml written at build time — the static file is what
      // survives nginx answering the request before it reaches Next.
      {
        source: "/robots.txt",
        destination: "/robots.txt",
      },
      {
        source: "/manifest.json",
        destination: "/manifest.json",
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      // Canonical host: www -> apex.
      // Both hosts currently answer 200 with identical HTML. The canonical tag
      // points at the apex so Google consolidates them, but serving the same
      // content on two hostnames without a redirect is still a duplicate-content
      // signal and splits any links that point at the www form.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.mahbub.dev" }],
        destination: "https://mahbub.dev/:path*",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about.html",
        destination: "/#about",
        permanent: true,
      },
      {
        source: "/contact.html",
        destination: "/#contact",
        permanent: true,
      },
      {
        source: "/projects.html",
        destination: "/#projects",
        permanent: true,
      },
      {
        source: "/skills.html",
        destination: "/#skills",
        permanent: true,
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_VERSION:
      process.env.NEXT_PUBLIC_APP_VERSION ||
      process.env.APP_VERSION ||
      "3.0.0",
    NEXT_PUBLIC_BUILD_NUMBER:
      process.env.NEXT_PUBLIC_BUILD_NUMBER ||
      process.env.BUILD_NUMBER ||
      "21092026-171",
  },

  // Build output
  output: "standalone",

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
