/** @type {import('next').NextConfig}  */

// const ApiUrl = process.env.NEXT_PUBLIC_API_URL;
// const cspHeader = `
//     default-src 'self';
//     script-src 'self' 'unsafe-eval' 'unsafe-inline';
//     style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
//     img-src 'self' blob: data:;
//     font-src 'self' data: https://fonts.gstatic.com https://rsms.me;
//     connect-src 'self' ${ApiUrl};
//     object-src 'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-ancestors 'none';
//     block-all-mixed-content;
//     upgrade-insecure-requests;
// `;

const nextConfig = {
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/stake',
      //   permanent: true,
      // },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      // {
      //   source: '/(.*)',
      //   headers: [
      //     {
      //       key: 'Content-Security-Policy',
      //       value: cspHeader.replace(/\n/g, ''),
      //     },
      //   ],
      // },
    ];
  },
  webpack(config, options) {
    config.module.rules.push({
      test: /\.mp3$/,
      use: {
        loader: 'file-loader',
      },
    });

    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ['@svgr/webpack'],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
};

module.exports = nextConfig;
