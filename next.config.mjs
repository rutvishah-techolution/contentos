/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Brain (Obsidian vault) lives alongside the app; keep it out of the build.
  outputFileTracingExcludes: {
    "*": ["./brain/**", "./gcp-service-account.json"],
  },
};

export default nextConfig;
