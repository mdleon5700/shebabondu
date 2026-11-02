/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "placehold.co"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/terms', destination: '/terms-and-conditions', permanent: true },
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/help', destination: '/faq', permanent: true },
      { source: '/support', destination: '/contact-us', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: false },
      { source: '/circulars', destination: '/jobs', permanent: true },
      { source: '/circular', destination: '/jobs', permanent: true },
      { source: '/circulars/:id', destination: '/jobs/:id', permanent: true },
      { source: '/alljobs', destination: '/jobs', permanent: true },
      { source: '/teletalk', destination: '/jobs', permanent: true },
      { source: '/bcs', destination: '/categories/bcs', permanent: true },
      { source: '/govt', destination: '/government-jobs', permanent: true },
      { source: '/bank', destination: '/bank-jobs', permanent: true },
      { source: '/ngo', destination: '/ngo-jobs', permanent: true },
      { source: '/teacher', destination: '/teacher-jobs', permanent: true },
      { source: '/jobs/category/:slug', destination: '/categories/:slug', permanent: true },
      { source: '/category/:slug', destination: '/categories/:slug', permanent: true },
      { source: '/daily-jobs/today', destination: '/daily-jobs', permanent: false },
      { source: '/daily-jobs/yesterday', destination: '/daily-jobs', permanent: false },
    ];
  },
};

export default nextConfig;
