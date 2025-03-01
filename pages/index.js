module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/usdc',
        permanent: true,
      },
    ];
  },
};
