import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "*.gstatic.com",
  },
  {
    protocol: "https",
    hostname: "**.public.blob.vercel-storage.com",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns,
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
