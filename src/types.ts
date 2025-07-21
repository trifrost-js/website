import {type TriFrostRouter, type TriFrostContext} from '@trifrost/core';

export type Env = {
  ASSETS: Fetcher;
  GITHUB_API_TOKEN: string;
  TRIFROST_API_TOKEN: string;
  UPTRACE_DSN: string;
  ALGOLIA_DOCSEARCH_APPID: string;
  ALGOLIA_DOCSEARCH_APIKEY: string;
  DB_CONNECTION_STRING: string;
  RATELIMITER_KV: KVNamespace;
  MainDurable: DurableObjectNamespace;
  TRIFROST_BUCKET: R2Bucket;
  TRIFROST_INGESTOR_KEY: string;
  TRIFROST_INGESTOR_CLIENT: string;
};

export type Context<State extends Record<string, unknown> = {}> = TriFrostContext<Env, State>;

export type Router<State extends Record<string, unknown> = {}> = TriFrostRouter<Env, State>;
