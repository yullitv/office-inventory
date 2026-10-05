import { createApp } from './app.js';
import { env } from './config/env.js';
import { createDatabase } from './db/connection.js';

const db = createDatabase(env.DB_PATH);
const app = createApp(db);

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
