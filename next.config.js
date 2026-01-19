/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001',
    },
    webpack: (config, { isServer }) => {
        // Enable WASM support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // WASM file output configuration
        if (!isServer) {
            config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
        }

        return config;
    },
}

module.exports = nextConfig
