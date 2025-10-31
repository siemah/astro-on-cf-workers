// drizzle.config.ts
import type { Config } from "drizzle-kit";

const { LOCAL_DB_PATH, DB_ID, D1_TOKEN, CLOUDFLARE_ACCOUNT_ID } = process.env;

// Use better-sqlite driver for local development
export default LOCAL_DB_PATH
  ? ({
      out: "./migrations",
      schema: "./src/db/schema.ts",
      dialect: "sqlite",
      dbCredentials: {
        url: LOCAL_DB_PATH,
      },
    } satisfies Config)
  : ({
      schema: "./src/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      driver: "d1-http",
      dbCredentials: {
        databaseId: DB_ID!,
        token: D1_TOKEN!,
        accountId: CLOUDFLARE_ACCOUNT_ID!,
      },
    } satisfies Config);
