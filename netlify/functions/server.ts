import serverless from 'serverless-http';
import { app } from '../../backend/dist/index.js';

const serverlessHandler = serverless(app, { binary: false });

/** Netlify redirige /api/* vers /.netlify/functions/server/api/:splat ; on enlève le préfixe pour Express */
export const handler = (event: unknown, context: unknown) => {
  const e = event as { path?: string; [k: string]: unknown };
  const path = e.path?.startsWith('/.netlify/functions/server')
    ? (e.path.replace(/^\/\.netlify\/functions\/server/, '') || '/')
    : e.path;
  return serverlessHandler({ ...e, path }, context);
};
