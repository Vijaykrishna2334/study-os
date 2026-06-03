/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",   // enables lean production bundle for server deployment
  experimental: { serverActions: { bodySizeLimit: "5mb" } },

  // Skip type-checking & linting on server build to save ~1GB RAM (types verified locally)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Enable SharedArrayBuffer for multi-threaded WASM (Kokoro TTS needs this)
  // credentialless is more compatible than require-corp (works with CDN fonts/images)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy",  value: "credentialless" },
        ],
      },
    ];
  },

  // Required for kokoro-js (transformers.js ONNX/WASM runtime in browser)
  webpack: (config, { isServer }) => {
    if (isServer) {
      const serverExternals = [
        "kokoro-js",
        "onnxruntime-web",
        "onnxruntime-node",
        "@huggingface/transformers",
        // GCP TTS needs native fs/crypto — must NOT be bundled by webpack
        "@google-cloud/text-to-speech",
        "google-auth-library",
        "google-gax",
      ];
      config.externals = Array.isArray(config.externals)
        ? [...config.externals, ...serverExternals]
        : [config.externals, ...serverExternals].filter(Boolean);
    }

    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      "onnxruntime-node": false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node": false,
    };

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency/,
      /Module not found.*onnxruntime-node/,
    ];

    return config;
  },
};
export default nextConfig;


