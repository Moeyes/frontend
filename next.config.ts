import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const CLOUDINARY_HOST = 'res.cloudinary.com';

const securityHeaders = [
  // Prevent the page being embedded in an iframe on any other origin (clickjacking)
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Stop browsers guessing MIME types (MIME-sniffing)
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Only send the origin in Referer header, never the full URL
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Disable access to browser features not used by this app
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  // Force HTTPS for 2 years, include subdomains, eligible for preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    // Deployed as Report-Only first so violations are logged before enforcement.
    // Switch to Content-Security-Policy once violations have been reviewed in production.
    value: [
      "default-src 'self'",
      // Next.js inlines some bootstrap scripts; 'unsafe-inline' can be tightened
      // once nonces are wired through the app.
      "script-src 'self' 'unsafe-inline'",
      // Tailwind CSS + next-intl may inject inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Battambang font from Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Profile photos and ID documents served from Cloudinary
      `img-src 'self' data: https://${CLOUDINARY_HOST}`,
      // Backend API proxy + Cloudinary presign upload endpoint
      `connect-src 'self' https://api.cloudinary.com`,
      // No iframes at all
      "frame-ancestors 'none'",
      // Only allow form submissions to this origin
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                // Apply to every response
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },

    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/:path*`,
            },
        ];
    },
};

export default withNextIntl(nextConfig);
