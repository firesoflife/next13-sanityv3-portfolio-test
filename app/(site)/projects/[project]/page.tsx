import { getProject } from '@/sanity/sanity-utils'
import { PortableText } from '@portabletext/react'
import Image from 'next/image'

type Props = {
  params: { project: string }
}

export default async function Project({ params }: Props) {

  const slug = params.project

  const project = await getProject(slug)

  return (

    <div>

      <header className='flex justify-between items-center'>
        <h1 className='text-4xl drop-shadow-xl bg-gradient-to-r from-yellow-800 to-green-600 bg-clip-text text-transparent'>
          {project.name}
        </h1>

        <a
          href={project.url}
          title="View Project"
          target='_blank'
          rel='noopener noreferrer'
          className='bg-gray-100 rounded-lg text-gray-500 py-3 px-4 whitespace-nowrap hover:text-green-500 transition cursor-pointer'
        >
          Read This Piece
        </a>
      </header>

      {/* Content */}

      <div className='text-lg text-gray-700 mt-5'>
        <PortableText value={project.content} />
      </div>


      {/* Image */}

      <Image
        src={project.image}
        alt={project.name}
        width={1920}
        height={1080}
        className='mt-10 border-2 border-gray-700 object-cover rounded-xl'
      />

    </div>

  )
}
