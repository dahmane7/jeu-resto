import serverless from 'serverless-http';
import { app } from '../../backend/dist/index.js';

export const handler = serverless(app, {
  binary: false,
});
