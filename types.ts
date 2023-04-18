import { PortableTextBlock } from 'sanity'

export type Project = {
  _id: string;
  _createdAt: Date;
  name: string;
  alt: string,
  slug: string;
  image: string;
  url: string;
  content: PortableTextBlock[];
}

export type Page = {
  _id: string;
  _createdAt: Date;
  title: string;
  slug: string;
  content: PortableTextBlock[];
}


