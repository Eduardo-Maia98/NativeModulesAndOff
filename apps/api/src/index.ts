import Fastify from 'fastify';
import cors from '@fastify/cors';
import { migrate } from './db';
import { registerRoutes } from './routes';

const port = Number(process.env.PORT ?? 3333);

async function main() {
  migrate();

  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await registerRoutes(app);

  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
