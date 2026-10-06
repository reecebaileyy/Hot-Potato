import { Html, Head, Main, NextScript } from 'next/document'

// Applies the stored theme before first paint so dark mode doesn't flash.
const themeScript = `
try {
  if (JSON.parse(localStorage.getItem('darkMode') || 'false') === true) {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#f5f5f7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
