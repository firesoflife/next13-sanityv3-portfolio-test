# Setup

1. Spin Up a Next and a Sanity Project inside a parent directory - keep the two in their own directories

## In the Next13 Project 

1. In the next project instass some packages
  - `npm i sanity next-sanity`
2. At the root level of the project create a sanity config file - `sanity.config.ts` 

### In the `sanity.config.ts` file

1. import `defineCongfig` 

```
import { defineConfig } from 'sanity';
```

2. create the variable `config` and export it, passing the following details

```
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

const config = defineConfig({

  projectId: 'lljix40d',
  dataset: 'production',
  title: 'Thinking In Circles',
  apiVersion: '2023-04-08',
  basePath: '/admin',

  plugins: [desktool()]
})

export default config
```

Add in the projectId you got from the Sanity projct, the dataset, give it a title of your choosing and to use the latest api version, add in todays date. 

Next, in the event that you want to add content editors etc to be able to contribute to the site, name a basepath where one can navigate to get to the Sanity Studio desktop for editing. 

Import the desktool which is the toplevel view in the sanity admin and add it as a plugin. 

Now we need to connect the Sanity admin to the Next project. Navigate to the App folder in the Next project and create a new file that will serve as a catchall for anything typed after .../admin in the browser bar - `admin/[[...index]]page.tsx` 

In the `admin/[[...index]]page.tsx` file we will add the following component that we get from the `next-sanity` package: 

```
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function AdminPage() {
  return <NextStudio config={config} />
}

```

Our sanity studio uses client side rendering and Next 13 moves as much JS as possible to the server and so we will often find that we need to instruct next when to use client side rendering. The top line instructs Next to `use client`

Now, when booting up the Next server, you can navigate to the `localhost:3000/admin` route and you should get your Sanity studio page loaded - you'll have to login if you are not already authenticated in Sanity. 

### Create a schema

In the root of the Next project, create a new folder called `sanity`. Inside this folder, create another folder called `schemas` and in here create a file for projects or blogs etc. We'll go with projects for now, so in the `schemas` folder create a file called `project-schema.ts`


Then we need to bring in the schema from Sanity to Next. In the `sanity.congig.js` file in the Next project, add `schema` to the config object and tell it to look for a new file where we can organize our schemas so this config file doesn't start looking hairy in the event that we start adding a lot of schemas. The file will now look like this: 

```
// sanity.config.ts

import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk'
import schemas from './sanity/schemas'

const config = defineConfig({

  projectId: 'lljix40d',
  dataset: 'production',
  title: 'Thinking In Circles',
  apiVersion: '2023-04-08',
  basePath: '/admin',

  plugins: [deskTool()],

  schema: { types: schemas}
})

export default config
```

Ok, so far if everythign we've done will get us a big ugly error. We need to make an index for our schemas that get's pulled in here. Make a new file in `sanity/schemas` called `index.ts` In that file, enter the following: 

```
import project from '.project-schema';

const schemas = [project]

export default schemas;

```

In this file we define our schemas object as an array of out different schemas ... currently just the `project` schema. More will live here soon. 


## Utility Folder for Functions

In an effort to keep our files and folders as tidy as possible, we will create a file in our `sanity` folder in which to hold all our functions used to grab data from Sanity. In the `schemas` folder, create the file `sanity-utils.ts` 

The utils file will require some of the credentials we need fro the Sanity studio: `projectId`, `dataset` and `apiVersion`. Create the function using the `createClient` helper from the `next-sanity`package and pass it the data. Then crreat a fetch for your data using `client.fetch` and a Groq query to grab and organize our data as follows: 

```
import { createClient, groq } from 'next-sanity';


export async function getProjects() {
  const client = createClient({
    projectId: 'lljix40d',
    dataset: 'production',
    apiVersion: '2023-04-08',
  });

  return client.fetch(
    groq`*[_type == "project"]{

      _id,
      _createdAt,
      name, 
      "slug": slug.current,
      "image": image.asset->url,
      url, 
      content

    }`
  )
}
```

Note the difference in data types above. We have two required fields that start with and underscore: `_id` and `_createdAt`, and then we pull in the rest of the data we created with our schema. There are some unique cases here as well as both "slug" and "image" require some additional info to be passed. 

### Render on our Next app Homepage

Now we'll get everything hooked up and passed to Next by moving into the default homepage for Next and passing our data there. Go to `app/page.tsx` (ensure you are in the `page.tsx` file at the top level under app) and add the following: 

Gone are the days in NextJS where we were grabbing stuff server-side and telling our app how to deal with thigns by using `getStaticPaths` and `getStaticProps` - ok that's not true, they are still present and still useful, but for grabbing our query Sanity provice us some helpers where we can simply use an aysnc function as follows. In `app/page.tsx` get rid of everything in the return and the imports used by the Next boilertplate and add the following: 

```
import { getProjects } from '@/sanity/sanity-utils'


export default async function Home() {

  const projects = await getProjects();

  return (
    <div>
      <h1>Test</h1>
      {projects.map(project => (
        <div key={project._id} >
          {project.name}
        </div>
      ))}
    </div>
  )
}
```
Remember, Next13 renders everything server-side by default - everything above is happening on the server. 

`getProjects` -> this is a sanity helper that allows us to fetch our data without requiring `getStaticProps` or `getStaticPaths`. 

We use an async function to fetch our data using the `getProjects` function we built out in our utils file. We can now map over our data in the return of our home page to see the glorious result. 

## Typescript Changes

Ok, strongly typed time. If you've been using Typescript instead of plain JS, and you've go some errors or noted that you editor is hollering at you to pay attention because you've got some default "any" types like a lazy person, then you need to do the following. 

In your root folder, create a new folder called `types` and a file for our "Project" types that are currently being complained about called ... wait for it ... `Projects.ts` 

```
// types/Project.ts

import { PortableTextBlock } from 'sanity'

export type Project = {
  _id: string;
  _createdAt: Date;
  name: string;
  slug: string;
  image: string;
  url: string;
  content: PortableTextBlock[];
}
```

All of this is pretty standard excpet the exception of the rich text editor for our "content" block which has the type `PortableTextBlock[]` and is an array. 

Since we are pulling our `getProjects()` function in our utils `sanity/sanity-utils.js` file and so that we don't need to assign type in every file we pull in projects, we will define the type here. The added import and Project type are as follows: 

```
import { Project } from '@/types';  // Added from types file
import { createClient, groq } from 'next-sanity'; 

// added : Promise<Project[]>
export async function getProjects(): Promise<Project[]> {
  const client = createClient({
    projectId: 'lljix40d',
    dataset: 'production',
    apiVersion: '2023-04-08',
  });

  return client.fetch(
    groq`*[_type == "project"]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`
  )
}
```

## Tailwind Styles and Custom Fonts

When I spun up my Next project I elected to use the Tailwind package option that is built into the init process, so Tailwind was ready to go out of the box. However, I want to choose some fonts, including at least one from a local collection not available by any public CDN like GoogleFonts. 

The first step will be to bring in the `next/font` package. However, if you are using the latest version of Next13 installation is no longer required and we are able to use `next/font/google` and `next/font/local` out of the box. 

Let's bring in a Google Font first, and then we can look at brining in a local font. 

### Google Font 

There are a few approaches we can take here as in some cases a desired font may only be needed in a single area of our site so we can import it into that file alone. In the case of our Google font, we are assigning it to a default font globally. In this case, we will import it into the `app/layout.tsx` file. At the top of the file we will import `next/font/google` and define the font parameters in a variable. Let's add in the Merriweather Sans font for the body of our content. 

```
// app/layout.tsx
import './globals.css'
import { Merriweather_Sans } from 'next/font/google'

/////////////////////////////////////////
/////////// FONT DEFINITIONS////////////
///////////////////////////////////////
const merriweather = Merriweather_Sans({
  style: ['normal', 'italic'],
  subsets: ['latin'],
  weight: ['300', '500', '700']
})

export const metadata = {
  title: 'Thinking in Circles - A Critical Blog',
  description: 'Not to be confused with circular thinking...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={merriweather.className}>{children}</body>
    </html>
  )
}

```

Under the imports, I've added a section to define our font(s) and store them in a variable. Note also the `return` where our `<body>` tag exists, we bring in the class using `className={merriweather.className}`

Ok. Fun. Now I want my headings and and a few other things to use a nice font I once purchased - it's awsome and I like it but it only exists as files on my machine so I'll import them using the `next/font/local` package. 

Firt, if you have some, find your font files. In the app directory create an `assets` folder and in there a `fonts` folder. Copy your font files into this folder. 

In `app/page.tsx` where our `<h1>` heading lives, we will add our  `localFont` import and store our chosen font in a variable. The updated `page.tsx` file will look like this: 

```
import { getProjects } from '@/sanity/sanity-utils'
import localFont from 'next/font/local'

const visbyThin = localFont({ src: './assets/fonts/visbycf-thin-webfont.woff2' })

export default async function Home() {

  const projects = await getProjects();

  return (
    <div className='max-w-5xl mx-auto py-20' >
      <h1 className={`${visbyThin.className} text-6xl font-extrabold`}>Thinking in Circles</h1>
      {projects.map(project => (
        <div key={project._id} >
          {project.name}
        </div>
      ))}
    </ div>
  )
}
```


## Images 

Ok, I'm really not working too hard on the styles here - that's not true, I have styles but I'm not wasting words on them for this write-up. You can do it! I have added a few here and there via tailwind to the snippets in this guide so add them as you like. Images are weird and NextJS complains about the `src` if you don't treat them in a specific way regarding the CDN. To avoid the weirdness, add the `images` section to the Next project that tell it how the CDN should be used. In `next.config.js` below the expirmental app object, add the image details as seen here: 

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
```

This can be fond in the updated Next docs, where there is a bit more detail. 


With the potential for weirdness abated, we can hop into the `page.tsx` file again and add in some more details for our project / blog card including Images, as follows. We'll import Image from `next/image` and write out our code as follows: 

```
import { getProjects } from '@/sanity/sanity-utils'
import localFont from 'next/font/local'
import Image from 'next/image'

const visbyThin = localFont({ src: './assets/fonts/visbycf-thin-webfont.woff2' })

const visbyMed = localFont({ src: './assets/fonts/visbycf-medium-webfont.woff2' })

export default async function Home() {

  const projects = await getProjects();

  return (
    <div className='max-w-5xl mx-auto py-20' >
      <h1 className={`${visbyThin.className} text-6xl font-extrabold`}>Thinking in&nbsp;
        <span className='bg-gradient-to-r from-yellow-800 to-green-600 bg-clip-text text-transparent'>
          Circles
        </span>
      </h1>

      <p className='mt-3 text-xl font-thin text-gray-600 leading-7'>
        Not to be confused with circular thinking, Thinking in Circles seeks the voice of reason on issues such as philosophy, technology, politics, policy, and more, through ancient wisdom and contemporary critical thinking.
      </p>

      <h2 className={`${visbyMed.className} mt-16 font-bold text-gray-700 text-3xl`} >Read on ...</h2>



      {projects.map(project => (
        <div key={project._id} className='border border-gray-500 rounded-lg' >

          {project.image && (
            <Image
              src={project.image}
              alt={project.alt}
              width={250}
              height={100}
              className="object-cover rounded-lg border border-gray-500"
            />
          )}

          <div className='font-bold text-green-900'>
            {project.name}
          </div>
        </div>
      ))}
    </ div>
  )
}
```

## Build our the individual project / blog layout

Create you routes, folders and indexes in one fell swoop by navigating to the `app` directory and then clicking the 'create new file' button and enter the name as following; 

```
projects/[project]/page.tsx
```

- `projects` - the `projects` portion creates a containing directory in our folder structure. This can be called whatever you like and doesn't affect the route or rendering of what is contained within it.
- `[project]` - The `[project]` segment is equal to the dynamic page and path - it's denoted by the square brackets. This can also be called whatever you like, but should obviously be representative of what you are putting in it. 
- `page.tsx` - the page that will be rendered at this route 

### Params and our dynamic route

Inside the `projects/[project]/page.tsx` file we are going to create our function and pass in params. It used to be the case that we'd need to use the `getStaticProps` and `getStaticPaths` functions to work our magic in this file, but in Next13 we pass the function `params` from our route and then define our variables with params. 

```
export default function Project({ params }) {

  const slug = params.project

  const project = await getProject(slug)

  return (
    <div>Project</div>
  )
}
```

The `project` portion of the `params.project` definition comes from the name of our route, which in our case is `[project]`

A few errors to fix up with our Typescript. We need to define the types for our Props and let Typescript know what's what. 

```
type Props = {
  params: { project: string };
};

export default function Project({ params }: Props) {

  const slug = params.project

  const project = await getProject(slug)

  return (
    <div>Project</div>
  )
}
```

We now need to add in `getProject` function for to grab the single project. We have one in our `sanity/sanity-utils.ts` file for retrieving all projects, let's now make one for grabbing just the single project. 

```
export async function getProject(slug: string): Promise<Project> {
  const client = createClient({
    projectId: 'lljix40d',
    dataset: 'production',
    apiVersion: '2023-04-08',
  });

  return client.fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`,
    { slug }
  )
}
```

What's different about this function from the `getProjects` function? Glad you asked. We need to isolate the specific project we want to render dynamically and so our groq will look a bit different here. 

- note that for the type we are calling for both "project" and `slug.current`. 
- We make the `slug.current` == to the specific slug we are after with `$slug` value and then, to avoid having an array of projects, we add in the `[0]`
- After our `groq` query, we pass in the slug to our query by adding in the `{slug: slug}` or, to cut down on unnecessary code, just `{slug}`


Alright, with the new groq query, we're ready to fetch and render data for a singular project. All we need to do now is import the function from our utils to our `projects/[project]/page.tsx` file. 

```
import { getProject } from '@/sanity/sanity-utils'

// .... other code //

 return (
    <div>This Project is {project.name}</div>
  )
```

Hop back into your browser, refresh, click on one of your test projects and BLAMO, you should see the project name rendered to your page and we are ready to pretty this page up a bit. 

### Refactor the utils file 

Hop into the `sanity/sanity-utils.ts` file and we are going reduce the code for our `createClient` helper from next-sanity. 

In the sanity folder create a folder called `config` and a file inside that folder called `client-config.ts`. Inside this file we create an object that holds our project data, just as we currently have in our utility functions. 

```
const config = {
  projectId: 'lljix40d',
  dataset: 'production',
  apiVersion: '2023-04-08',
}

export default config
```

Now, we can clean up the `sanity/sanity-utils.ts` file, importing our `clientConfig` from the file we just created, and passing it to `createClient`: 

```
import { Project } from '@/types';
import { createClient, groq } from 'next-sanity';
import clientConfig from './config/client-config';

export async function getProjects(): Promise<Project[]> {

  return createClient(clientConfig).fetch(
    groq`*[_type == "project"]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`
  )
}

export async function getProject(slug: string): Promise<Project> {
 

  return createClient(clientConfig).fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
      _id,
      _createdAt,
      name,
      "slug": slug.current,
      "image": image.asset->url,
      url,
      content
    }`,
    { slug }
  )
}
```

Note that we've removed the `const client = createClient` variable with the object data holding our project info, and simply passed the `clientConfig` data into the `createClient` function instead. If you ever change your project data, now you'll only need to do this in one place - the `sanity/config/client-config.ts` file. Nice. 

### Content and Images for our Individual Projects

Ok, time to play with content and images. In our `page.tsx`. Again, I'm not going to spend too much time on styling here because ... I don't wanna. Look up the Tailwind cheat sheet and go at it.

The `app/projects/[project]/page.tsx` that I've copied below includes some header info and styles. Add this in, tweak it to your liking and then we will build out the other sections.

```
import { getProject } from '@/sanity/sanity-utils'

type Props = {
  params: { project: string }
}

export default async function Project({ params }: Props) {

  const slug = params.project

  const project = await getProject(slug)

  return (

    <div className="max-w-3xl mx-auto py-20">

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

      <div>
        {project.content}
      </div>


      {/* Image */}

    </div>

  )
}
```

Ok, now we are gong to add in our project content by fetching in `project.conent`, but when we do, we will get an error that indicates Next doesn't like something about a 'portable block' - ahh, right... our content in our schema has a type of 'array' and the array is a bunch of 'blocks'. We will need a new package to help us deal with this. 

```
npm i @portabletext/react
```

With this package installed, we can now add the import at the top:

```
import { PortableText } from '@portabletext/react'
```

Then we'll change the content section to use this import as follows: 

```
{/*  .... other code ... */}

{/*  content    */}

<div className='text-lg text-gray-700 mt-5'>
  <PortableText value={project.content} />
<div> 


{/*  Image  */}

<Image 
  src={project.image}
  alt={project.name}
  width={1920}
  height={1080}
  className='mt-10 border-2 border-gray-700 object-cover rounded-xl'
 />
```

Ok, we've added our fancy text blocks and a banner image. Good stuff. Bed time. 


## Navigation

We need visitors to our site to be able to get from one page to the next, so lets rough out a Navigation bar. To start, we'll make use of the primary `layout.tsx` file inside the `app` folder. We will, however, run into an issue where whatever we do here can wreak havoc on our Sanity dashboard as it is inside our Next project. Follow along and make some changes to your layout similar to this: 

```
{/*    app/Layout     */}
import Link from 'next/link'
import './globals.css'
import { Merriweather_Sans } from 'next/font/google'

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
  description: 'Not to be confused with circular thinking....',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${merriweather.className} bg-yellow-50 max-w-3xl mx-auto py-10`}>

        <header>
          <Link
            href='/'
            className='bg-gradient-to-r from-yellow-800 to-green-600 bg-clip-text text-transparent'
          >
            Thinking in Circles

          </Link >
        </header>

        <main className='py-20'>
          {children}
        </main>
      </body>
    </html>
  )
} 
```

Ok, now navigate around. Looks good right? Right. Now navigate to the admin for Sanity - `localhost:3000/admin`. Ughh... gross. How will anyone ever be able to use this? Next13's global layout file applies to alllllll our files and folders. 

## Next13 Folder Structure & Organization 

Currently we don't have much separation of scope in our Next app's folder structure. Next13 gives us a way to define routes and separation via the folder tree. Now, I don't know about you, but I am not a huge fan of React Routers methods and have always appreciated the NextJS routing methodology, but Next13 goes to the next (hehehe) level. Let's separate our Sanity studio from our Next content while keeping the studio properly embedded inside the Next app. 

In the `app` directory create 2 new folders: 

- `(studio)`
- `(site)`

Ok, by putting these folders into parenthesis, we have created a kind of scope where each of these sections or our app can have their own `layout.tsx` for example, and one won't affect the other. 

Good. Now, grab your global layout file - the one in the `app` folder root and, if using VS Code or other supporting IDE, drag it into your `(site)` folder. In my case, VS Code asks me about some refactoring it can do which is basically just changing the paths of the imports. If you don't have this automated, you may need to go over your imports and ensure all the paths are correct. 

Ok, now when we navigate to our site in the browser, we get a big ol' complaint from Next saying it was expecting to see a layout etc. That's right. We need to move our app files around for some organization and once all the folders and their files are in either `(site)` or `(studio)`, and the import paths have been corrected where necessary, we should have things organized. 

Inside `(site)`

- `assets` folder - if you have local fonts etc like I do. These will need to be updated as well, but instead in the files in which they are used and the `localFont` variable `src` path. 
- `projects` - all our project files 
- `app/(site)/layout.tsx`
- `app/(site)/page.tsx`

Inside `(studio)`

- `admin` - our studio route to that embeds Sanity into our Next project
- `layout.tsx` - the studio specific layout page

## More Content - Pages 

Ok, that was fun, but our page still sucks. It's fine, but we really ought to have some content that says just a bit more than "hey look, i made this, you love me, you wanna hire me" etc. 

### Pages Schema

In the `sanity/schemas` folder, we will create a new file called `page-schema.ts` In this file, lets define a few objects for elements we'd like on our page. 

```
const page =
{
  name: 'page',
  title: 'Pages',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }]
    },
  ]
}

export default page;
```

Great, we have a schema, so now lets tell Sanity that it exists by heading into the `sanity/schemas/index.ts` file and adding it: 

```
import page from './page-schema';
import project from './project-schema';

const schemas = [project, page]

export default schemas
```

Ok, go ahead. Create a few pages. I made and "About me" vanity page that reeks more than a car license plate that says `IH8MYEX` and a contact me page that leaves everything to mystery. 

Once created, we can get start writing our Groq queries to pull in these new pages and their data. 

## Fetch Page Data with Groq

Now, in the `sanity/sanity-utils.ts` file, we need to write our query to grab the data for our single pages. Before that, however, let's define our type in the `types.ts` file:

```
{/*  ... other type definitions */}
export type Page = {
  _id: string;
  _createdAt: Date;
  title: string;
  slug: string;
  content: PortableTextBlock[];
}
```

Then we'll write our functions in the utils file: 

```
export async function getPages(): Promise<Page[]> {

  return createClient(clientConfig).fetch(
    groq`*[_type == "page"]{
      _id,
      _createdAt,
      title,
      "slug": slug.current
      // content not required as we are pulling data for our Navbar
    }`
  )

}

export async function getPage(slug: string): Promise<Page> {

  return createClient(clientConfig).fetch(
    groq`*[_type == "page" && slug.current == $slug][0]{
       _id,
      _createdAt,
      title,
      "slug": slug.current
      content 
    }`,
    { slug }
  )
  ```

Great! Now we can render our content to our front end. Hop into `app/(site)/layout.tsx` (aka our `RootLayout` component). Let's create a new variable that calls our `getPages` function - don't forget to change the component function to `async` and import the `getPages` function from the utils file.

We will then map over our page links to be shown in the Nav by creating a link with a `href` to each individual slug. Here is the file now, with styles added.

```
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
  description: 'Not to be confused with circular thinking',
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
```

Now we need to create pages / routes for our "about" and "contact" pages. In the `app/(site)/projects` folder create a new route folder withe a page: `[slug]/page.tsx`. 

## VisionTool - run quick sample queries of your data in a Groq Playground

Ok, while not always necessary if you've got relatively simple data structures with minimal content, getting a visual on how your data is returned can be mighty helpful. For this, Sanity have built the `visionTool`, a Groq playground that lets us run queries right from the Sanity Studio. 

Recall earlier when we migrated our studio to live inside the Next JS app. In the root of the Next app we created the `sanity.config.ts` file with copied content from our initial Sanity project. We will install and import the VisionTool here alongside the already existing DeskTool. 

```
// sanity.config.ts 

import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk'
import schemas from './sanity/schemas';
import { visionTool } from '@sanity/vision';

const config = defineConfig({

  projectId: 'lljix40d',
  dataset: 'production',
  title: 'Thinking In Circles',
  apiVersion: '2023-04-08',
  basePath: '/admin',


  plugins: [deskTool(), visionTool()],

  schema: { types: schemas }
})

export default config
```

Now, when you restart / start your server, you should now see beside the "Desk" section in the studio, a new "Vision" section with an eyeball icon. Beauty. This is where we can sample our data. 

