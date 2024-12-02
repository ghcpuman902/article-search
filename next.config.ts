// Define allowed RSS feed domains for images
const RSS_DOMAINS = [
  'scitechdaily.com',
  'phys.org',
  'universetoday.com',
  'space.com',
  'sciencealert.com',
  'skyandtelescope.org',
  'spacenews.com',
  'sciam.com',
  'ras.ac.uk',
  'sci.news',
  'newscientist.com',
  'theconversation.com',
  // Japanese domains
  'sorae.info',
  'nao.ac.jp',
  'astroarts.co.jp',
  'subarutelescope.org',
  'alma-telescope.jp',
  'jaxa.jp',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'components', 'lib']
  },
  experimental: {
    ppr: 'incremental',
    dynamicIO: true,
    turbo: {
      // Add your turbo config options here
    },
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      // Add patterns for RSS feed image domains
      ...RSS_DOMAINS.map(domain => ({
        protocol: 'https',
        hostname: `*.${domain}`, // Include subdomains
        port: '',
        pathname: '/**',
      })),
    ],
  },
};

// Import the Vercel Toolbar plugin
const withVercelToolbar = require('@vercel/toolbar/plugins/next')();

// Export the configuration using the Vercel Toolbar plugin
module.exports = withVercelToolbar(nextConfig);
