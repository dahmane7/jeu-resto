import serverless from 'serverless-http';
import { app } from '../../backend/dist/index.js';

const serverlessHandler = serverless(app, { binary: false });

export const handler = async (event: unknown, context: unknown) => {
  const e = event as { path?: string; [k: string]: unknown };
  const path = e.path?.startsWith('/.netlify/functions/server')
    ? (e.path.replace(/^\/\.netlify\/functions\/server/, '') || '/')
    : e.path;
  const eventWithPath = { ...e, path };
  try {
    return await serverlessHandler(eventWithPath, context);
  } catch (err) {
    console.error('Function error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
