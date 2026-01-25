import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Simple SVG paths for icons
const ICONS = {
    twitter: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
    ),
    linkedin: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    ),
    instagram: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    ),
    tiktok: (color: string) => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
    )
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  const platform = searchParams.get('platform') || 'twitter';
  const mode = searchParams.get('mode') || 'light';
  const fontSize = searchParams.get('fontSize') || 'large';
  const logo = searchParams.get('logo');
  const windowChrome = searchParams.get('windowChrome') === 'true';
  const cardStyle = searchParams.get('cardStyle') || 'solid';

  if (!text) {
    return new Response('Missing text', { status: 400 });
  }

  // Canvas Dimensions
  let width = 1200;
  let height = 675; // 16:9 default (Twitter)
  
  // Background Styles
  let background = 'linear-gradient(to bottom right, #60a5fa, #2563eb)'; // Default blue

  if (platform === 'linkedin') {
    width = 1080;
    height = 1350; // 4:5
    background = 'linear-gradient(to bottom right, #1d4ed8, #1e3a8a)';
  } else if (platform === 'instagram') {
    width = 1080;
    height = 1080; // 1:1
    background = 'linear-gradient(to bottom right, #facc15, #ef4444, #a855f7)';
  } else if (platform === 'tiktok') {
    width = 1080;
    height = 1920; // 9:16
    background = 'black';
  } else if (platform === 'twitter') {
      background = 'linear-gradient(to bottom right, #60a5fa, #22d3ee)';
  }

  // Card Styles
  const isDark = mode === 'dark';
  let cardBg = isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  let textColor = isDark ? 'white' : '#111827';
  let borderColor = isDark ? '#374151' : '#e5e7eb';
  let shadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

  if (cardStyle === 'glass') {
      cardBg = isDark ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  } else if (cardStyle === 'flat') {
      cardBg = isDark ? '#111827' : '#ffffff';
      shadow = 'none';
  }

  // Font Size - Reduced
  let fontSizePx = 40; // Default large reduced from 50
  if (fontSize === 'medium') fontSizePx = 28; // Reduced from 32
  if (fontSize === 'huge') fontSizePx = 60; // Reduced from 72

  // Icon
  // @ts-ignore
  const PlatformIcon = ICONS[platform] || ICONS.twitter;
  const iconColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: background,
          backgroundColor: background.includes('gradient') ? undefined : background,
          padding: 80, // Outer padding
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: cardBg,
            borderRadius: 24,
            boxShadow: shadow,
            border: cardStyle !== 'flat' ? `1px solid ${borderColor}` : undefined,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Window Chrome */}
          {windowChrome && (
              <div style={{
                  height: 80, // Increased height for bigger icon
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: 32,
                  paddingRight: 32,
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
              }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                  </div>
                  
                  {/* Social Icon - Increased size via SVG width/height above */}
                  <div style={{ display: 'flex' }}>
                      {PlatformIcon(iconColor)}
                  </div>
              </div>
          )}

          {/* Content */}
          <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 60,
              flex: 1,
          }}>
               <div style={{
                   fontSize: fontSizePx,
                   color: textColor,
                   lineHeight: 1.5,
                   whiteSpace: 'pre-wrap',
                   fontWeight: 500,
                   flex: 1,
               }}>
                   {text}
               </div>

               {/* User Logo - Bottom Right */}
               {logo && (
                   <div style={{
                       display: 'flex',
                       justifyContent: 'flex-end',
                       marginTop: 40,
                   }}>
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img 
                           src={logo} 
                           width="60" 
                           height="60" 
                           style={{ 
                               objectFit: 'cover', 
                               borderRadius: '50%',
                               border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                           }} 
                           alt="" 
                        />
                   </div>
               )}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}