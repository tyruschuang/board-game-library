/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:5328/api/:path*'
                        : '/src/api/',
            },
        ]
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
            { protocol: 'https', hostname: 'cf.geekdo-images.com', pathname: '/**' },
            { protocol: 'https', hostname: 'images.boardgamegeek.com', pathname: '/**' },
            { protocol: 'https', hostname: 'boardgamegeek.com', pathname: '/**' },
            { protocol: 'http', hostname: 'cf.geekdo-images.com', pathname: '/**' },
            { protocol: 'http', hostname: 'images.boardgamegeek.com', pathname: '/**' },
            { protocol: 'http', hostname: 'boardgamegeek.com', pathname: '/**' },
        ]
    }
}

module.exports = nextConfig;
