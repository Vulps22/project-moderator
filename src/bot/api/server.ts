import express, { Express } from 'express';
import { existsSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { bearerAuth } from './middleware/auth';
import { ApiRoute } from './types/ApiRoute';
import { Logger } from '../utils';

async function loadRoutesFromDirectory(app: Express, dirPath: string, basePath: string): Promise<void> {
  const items = readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = join(dirPath, item.name);

    if (item.isDirectory() && item.name !== 'tests') {
      await loadRoutesFromDirectory(app, itemPath, basePath);
    } else if (item.isFile() && item.name.endsWith('.js')) {
      const routeModule = await import(itemPath) as { default: ApiRoute };
      const route = routeModule.default;

      // Convert file path to URL: routes/admin/stats.js -> /admin/stats
      const urlPath = '/' + relative(basePath, itemPath)
        .replace(/\\/g, '/')
        .replace(/\.js$/, '');

      if (route.get)    app.get(urlPath, (req, res) => void route.get!(req, res));
      if (route.post)   app.post(urlPath, (req, res) => void route.post!(req, res));
      if (route.put)    app.put(urlPath, (req, res) => void route.put!(req, res));
      if (route.patch)  app.patch(urlPath, (req, res) => void route.patch!(req, res));
      if (route.delete) app.delete(urlPath, (req, res) => void route.delete!(req, res));

      Logger.debug(`Registered route: ${urlPath}`);
    }
  }
}

export async function createServer(): Promise<void> {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const app = express();

  app.use(express.json());
  app.use(bearerAuth);

  // Scan sibling routes/ directory — lives at src/routes/ (../routes relative to src/bot/)
  const routesPath = join(__dirname, '..', '..', 'routes');
  if (existsSync(routesPath)) {
    await loadRoutesFromDirectory(app, routesPath, routesPath);
  }

  app.listen(port, () => {
    Logger.debug(`API server listening on port ${port}`);
  });
}
