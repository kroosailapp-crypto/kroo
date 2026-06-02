export const metadata = {
  title: 'Race Timer',
  description: 'Sail racing start timer with compass and speed.',
  manifest: '/race-timer-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Race Timer',
  },
  icons: {
    apple: '/icons/icon-180.png',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RaceTimerLayout({ children }) {
  return children;
}
