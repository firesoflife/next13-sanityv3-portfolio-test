import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk'
import schemas from './sanity/schemas';

const config = defineConfig({

  projectId: 'lljix40d',
  dataset: 'production',
  title: 'Thinking In Circles',
  apiVersion: '2023-04-08',
  basePath: '/admin',


  plugins: [deskTool()],

  schema: { types: schemas }
})

export default config