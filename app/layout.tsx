import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Who is Who Educhain - Africa\'s Trusted Blockchain for Academic Verification',
    template: '%s | Who is Who Educhain'
  },
  description: 'Verify student credentials in seconds. Combat fraud. Build trust. Join Africa\'s leading universities in securing academic integrity with blockchain technology.',
  keywords: ['academic verification', 'blockchain', 'credentials', 'education', 'Africa', 'university', 'fraud prevention', 'student records'],
  authors: [{ name: 'Who is Who Educhain' }],
  creator: 'Who is Who Educhain',
  publisher: 'Who is Who Educhain',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://whoswhoafricanstudents.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whoswhoafricanstudents.com/',
    title: 'Who is Who Educhain - Africa\'s Trusted Blockchain for Academic Verification',
    description: 'Verify student credentials in seconds. Combat fraud. Build trust. Join Africa\'s leading universities in securing academic integrity with blockchain technology.',
    siteName: 'Who is Who Educhain',
    images: [
      {
        url: 'https://whoswhoafricanstudents.com/images/hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Who is Who Educhain - Academic verification platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Who is Who Educhain - Africa\'s Trusted Blockchain for Academic Verification',
    description: 'Verify student credentials in seconds. Combat fraud. Build trust. Join Africa\'s leading universities in securing academic integrity.',
    creator: '@WhoisWhoEduchain',
    site: '@WhoisWhoEduchain',
    images: ['https://whoswhoafricanstudents.com/images/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code-here',
    yandex: 'your-yandex-verification-code-here',
  },
  category: 'education',
  other: {
    'theme-color': '#1e3a8a',
    'msapplication-TileColor': '#1e3a8a',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Who is Who Educhain",
    "description": "Africa's trusted blockchain platform for academic credential verification",
    "url": "https://whoswhoafricanstudents.com",
    "logo": "https://whoswhoafricanstudents.com/images/logo.png",
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "Accra, Ghana"
    },
    "areaServed": {
      "@type": "Place",
      "name": "Africa"
    },
    "sameAs": [
      "https://twitter.com/WhoisWhoEduchain",
      "https://linkedin.com/company/whoiswhoeduchain",
      "https://facebook.com/WhoisWhoEduchain"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+233-123-456-789",
      "contactType": "customer service",
      "email": "info@whoiswhoeduchain.com"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Innovation Way",
      "addressLocality": "Accra",
      "addressCountry": "Ghana"
    },
    "serviceType": "Academic Credential Verification",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Academic Verification Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Blockchain Credential Verification",
            "description": "Secure verification of academic credentials using blockchain technology"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "University Integration",
            "description": "Platform integration for universities to upload and manage credentials"
          }
        }
      ]
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
