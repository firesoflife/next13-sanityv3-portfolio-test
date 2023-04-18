import Link from 'next/link'
import '../globals.css'
import { Merriweather_Sans } from 'next/font/google'
import { getPages } from '@/sanity/sanity-utils'

/////////////////////////////////////////
/////////// FONT DEFINITIONS////////////
///////////////////////////////////////
const merriweather = Merriweather_Sans({
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['300', '400', '600']
})

export const metadata = {
  title: 'Thinking in Circles - A Critical Blog',
  description: 'Not to be confused with circular thinking, Thinking in Circles seeks the voice of reason on issues such as philosophy, technology, politics, policy, and more, through ancient wisdom and contemporary critical thinking. ',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  // get all pages
  const pages = await getPages();

  return (
    <html lang="en">
      <body className={`${merriweather.className} bg-yellow-50 max-w-3xl mx-auto py-10`}>

        <header className='flex items-center justify-between'>
          <Link
            href='/'
            className='bg-gradient-to-r from-yellow-800 to-green-600 bg-clip-text text-transparent'
          >
            Thinking in Circles

          </Link >

          <div className='flex items-center gap-3 text-base text-gray-500'>
            {pages.map((page) => (
              <Link
                key={page._id}
                href={`/${page.slug}`}
                className='hover:underline'
              >
                {page.title}
              </Link>
            ))}
          </div>

        </header>

        <main className='py-20'>
          {children}
        </main>
      </body>
    </html>
  )
} 
