import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Prisma 7.10 אין לו שדה directUrl ב-config (רק url/shadowDatabaseUrl —
  // ראו node_modules/@prisma/config/dist/index.d.ts). ה-CLI (migrate/generate)
  // מתחבר תמיד עם DIRECT_URL; זמן ריצה (src/db/client.ts) מתחבר עם DATABASE_URL
  // (ה-pooler) דרך ה-adapter. ה-pooler לא תומך ב-advisory locks שמיגרציות דורשות.
  datasource: {
    url: env('DIRECT_URL'),
  },
})
