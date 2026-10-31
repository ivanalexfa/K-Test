import { handleApiRequest } from '../server/apiPlugin';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  await handleApiRequest(req, res);
}
