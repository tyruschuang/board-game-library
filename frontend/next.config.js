/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            new URL("https://picsum.photos/**")
        ]
    },
    rewrites: async () => {
        return [
            {
                source: '/src/api/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:5328/api/:path*'
                        : '/api/',
            },
        ]
    },
}

module.exports = nextConfig;
