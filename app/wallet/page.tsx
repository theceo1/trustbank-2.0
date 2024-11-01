// Create this new file
export default function WalletRedirect() {
    return {
      redirect: {
        destination: '/profile/wallet',
        permanent: true,
      },
    }
  }