/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@reviewflow/ui",
    "@reviewflow/config",
    "@reviewflow/types",
    "@reviewflow/utils",
    "@reviewflow/database",
    "@reviewflow/logger",
    "@reviewflow/errors",
    "@reviewflow/supabase",
    "@reviewflow/auth",
    "@reviewflow/validation",
  ],
};

export default nextConfig;
