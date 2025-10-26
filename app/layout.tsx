import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DevSafetyProvider } from '@/components/DevSafetyProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SPELINX - Play Games & Earn Rewards',
  description: 'The ultimate gaming platform with premium features and rewards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DevSafetyProvider>
          {children}
        </DevSafetyProvider>
        <Toaster position="top-right" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Fetch user's current theme from session
                fetch('/api/auth/session')
                  .then(res => res.json())
                  .then(data => {
                    if (data.user && data.user.theme) {
                      // Assuming theme is the theme name or ID, fetch full theme data if needed
                      // For now, assume themeFile is available or set basic variables
                      // To fully implement, need to fetch theme details
                      // But since we have user.theme, we can set basic variables or fetch from /api/themes
                      fetch(\`/api/themes\`)
                        .then(res => res.json())
                        .then(themesData => {
                          const theme = themesData.find(t => t.name === data.user.theme || t._id === data.user.theme);
                          if (theme) {
                            const applyThemeVariables = (obj: any) => {
                              for (const [key, value] of Object.entries(obj)) {
                                if (typeof value === 'object' && value !== null) {
                                  if (key === 'colors' || key === 'fonts') {
                                    applyThemeVariables(value);
                                  } else {
                                    applyThemeVariables(value);
                                  }
                                } else {
                                  document.documentElement.style.setProperty(\`--\${key}\`, value);
                                }
                              }
                            };
                            applyThemeVariables(theme.themeFile);
                          }
                        })
                        .catch(err => console.error('Error loading themes:', err));
                    }
                  })
                  .catch(err => console.error('Error loading session:', err));

                // Apply smooth transitions for theme changes
                document.documentElement.style.setProperty('transition', 'all 250ms ease-in-out');

                // Simple theme loading from localStorage
                const activeThemeId = localStorage.getItem('activeTheme');
                if (activeThemeId) {
                  const cachedThemeData = localStorage.getItem('theme_' + activeThemeId);
                  if (cachedThemeData) {
                    try {
                      const themeObj = JSON.parse(cachedThemeData);
                      // Apply theme variables
                      if (themeObj && typeof themeObj === 'object') {
                        Object.entries(themeObj).forEach(([key, value]) => {
                          if (typeof value === 'object' && value !== null) {
                            // Handle nested objects like colors and fonts
                            if (key === 'colors' || key === 'fonts') {
                              Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                                document.documentElement.style.setProperty('--' + nestedKey, String(nestedValue));
                              });
                            }
                          } else {
                            document.documentElement.style.setProperty('--' + key, String(value));
                          }
                        });
                      }
                    } catch (e) {
                      console.error('Error parsing cached theme:', e);
                    }
                  }
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
