/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow embedding in HubSpot iframe
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *.hubspot.com *.hubspotpagebuilder.com",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
