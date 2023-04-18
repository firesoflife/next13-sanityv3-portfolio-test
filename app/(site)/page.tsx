import { getProjects } from '@/sanity/sanity-utils'
import localFont from 'next/font/local'
import Image from 'next/image'
import Link from 'next/link'

const visbyThin = localFont({ src: './assets/fonts/visbycf-thin-webfont.woff2' })

const visbyMed = localFont({ src: './assets/fonts/visbycf-medium-webfont.woff2' })

export default async function Home() {

  const projects = await getProjects();

  return (
    <div  >
      <h1 className={`${visbyThin.className} text-6xl font-extrabold`}>Thinking in&nbsp;
        <span className='bg-gradient-to-r from-yellow-800 to-green-600 bg-clip-text text-transparent'>
          Circles
        </span>
      </h1>

      <p className='mt-3 text-xl font-thin text-gray-600 leading-7'>
        Not to be confused with circular thinking, Thinking in Circles seeks the voice of reason on issues such as philosophy, technology, politics, policy, and more, through ancient wisdom and contemporary critical thinking.
      </p>

      <h2 className={`${visbyMed.className} mt-16 font-bold text-gray-700 text-3xl`} >Read on ...</h2>

      <div className="mt-5 grid lg:grid-cols-3 md:grid-cols-2 gap-8">

        {projects.map(project => (
          <Link
            href={`/projects/${project.slug}`}
            key={project._id}
            className='border-2 border-gray-500 rounded-lg p-1 hover:scale-105 transition' >

            {project.image && (

              <Image
                src={project.image}
                alt={project.name}
                width={750}
                height={300}
                className="object-cover rounded-lg border border-gray-500"
              />
            )}

            <div className='mt-2 font-bold text-green-900'>
              {project.name}
            </div>
          </Link>
        ))}
      </div>

    </ div>
  )
}

