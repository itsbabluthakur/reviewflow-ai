import type { NextConfig } from "next";
import { loadEnv } from "@reviewflow/config";

// Fail fast on misconfigured environment variables, before the app starts
// serving requests.
loadEnv();

const nextConfig: NextConfig = {
  transpilePackages: [
    "@reviewflow/ui",
    "@reviewflow/config",
    "@reviewflow/types",
    "@reviewflow/utils",
  ],
};

export default nextConfig;
