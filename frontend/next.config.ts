import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://*.firebaseapp.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://assets.fitbit.com",
              "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://api.fitbit.com https://*.firebaseapp.com https://www.google.com/recaptcha/",
              "frame-src 'self' https://*.firebaseapp.com https://www.google.com/recaptcha/ https://app.netlify.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
