/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['humorstech.com'],
  },

  // Phase 1 route migration: old top-level routes were moved under /trainer/*.
  // 308 (permanent) redirects keep existing bookmarks, in-flight links, and
  // any external references working. The wildcard rules cover deep paths
  // (e.g., /client/123 -> /trainer/client/123). The bare-path rules cover
  // the directory roots themselves.
  //
  // /partners/* is gone entirely — redirects to /trainer/dashboard so anyone
  // with a stale partner link lands somewhere useful.
  async redirects() {
    const movedRoutes = [
      'dashboard',
      'client',
      'diet-plan',
      'planhistory',
      'plansummary',
      'profile',
      'settings',
      'testlog-info',
      'messages',
      'updatepassword',
      'earnings',
    ];

    const moved = movedRoutes.flatMap((route) => [
      { source: `/${route}`,        destination: `/trainer/${route}`,        permanent: true },
      { source: `/${route}/:path*`, destination: `/trainer/${route}/:path*`, permanent: true },
    ]);

    return [
      ...moved,
      // Partners track removed in Phase 1.
      { source: '/partners',        destination: '/trainer/dashboard', permanent: true },
      { source: '/partners/:path*', destination: '/trainer/dashboard', permanent: true },
    ];
  },
};

export default nextConfig;
