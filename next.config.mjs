/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [ // domains is deprecated
            {
              protocol: "https",
              hostname: "drive.google.com", 
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
            },
        ],
    },
    output: 'standalone',
    async headers() {
        return [
            {
                // matching all API routes
                source: "/shops/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ]
    },
    env: {
        BACKEND_URL: process.env.BACKEND_URL
    }
};

export default nextConfig;
