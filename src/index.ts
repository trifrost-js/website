import {type Env} from './types';
import {App, OtelHttpExporter, JsonExporter, Security, Cors, DurableObjectCache, isDevMode, ConsoleExporter} from '@trifrost/core';
import {notFound} from './pages/notfound';
import {error} from './pages/error';
import {rootRouter} from './pages/root';
import {docsRouter} from './pages/docs';
import {examplesRouter} from './pages/examples';
import {newsRouter} from './pages/news';
import {css} from './css';
import {script} from './script';

export {TriFrostDurableObject} from '@trifrost/core';

const app = await new App<Env>({
  cache: ({env}) => new DurableObjectCache({
    store: env.MainDurable,
  }),
  tracing: {
    exporters: ({env}) => {
      if (isDevMode(env)) return new ConsoleExporter();
      return [
        new JsonExporter(),
        new OtelHttpExporter({
          logEndpoint: 'https://ingest.trifrost.dev/v1/ingest/otel',
          spanEndpoint: 'https://ingest.trifrost.dev/v1/ingest/otel',
          headers: {
            'x-ingest-key': env.TRIFROST_INGESTOR_KEY,
            'x-ingest-client': env.TRIFROST_INGESTOR_CLIENT,
          },
        }),
      ];
    },
  },
  client: {css, script},
})
  .use(
    Security({
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'nonce'", 'https://cdn.jsdelivr.net', 'https://static.cloudflareinsights.com', 'https://unpkg.com'],
        'style-src': ["'self'", "'nonce'", 'https://unpkg.com', 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
        'frame-ancestors': 'none',
        'frame-src': 'none',
        'img-src': ["'self'", 'https://github.com', 'https://github-production-user-asset-6210df.s3.amazonaws.com'],
        'media-src': ["'self'", 'https://github.com', 'https://github-production-user-asset-6210df.s3.amazonaws.com'],
        'form-action': ["'self'"],
        'connect-src': [
          "'self'",
          'https://insights.algolia.io',
          'https://n3tg8pi3iw-dsn.algolia.net',
          'https://n3tg8pi3iw.algolianet.com',
          'https://n3tg8pi3iw-1.algolianet.com',
          'https://n3tg8pi3iw-2.algolianet.com',
          'https://n3tg8pi3iw-3.algolianet.com',
          'https://n3tg8pi3iw-4.algolianet.com',
          'https://n3tg8pi3iw-5.algolianet.com',
          'https://n3tg8pi3iw-6.algolianet.com',
          'https://n3tg8pi3iw-7.algolianet.com',
          'https://n3tg8pi3iw-8.algolianet.com',
          'https://n3tg8pi3iw-9.algolianet.com',
        ],
        'font-src': ['https://fonts.gstatic.com', 'fonts.googleapis.com'],
      },
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: ['no-referrer', 'strict-origin-when-cross-origin'],
      xFrameOptions: 'DENY',
    }),
  )
  .use(Cors())
  .group('/', rootRouter)
  .group('/docs', docsRouter)
  .group('/examples', examplesRouter)
  .group('/news', newsRouter)
  .onNotFound(notFound)
  .onError(error)
  .boot();

export default app;
