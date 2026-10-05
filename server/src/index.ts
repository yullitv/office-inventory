import { createApp } from './app.js';
import { env } from './config/env.js';
import { createDatabase } from './db/connection.js';

createDatabase(env.DB_PATH);

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Server listening on http://localhost:${env.PORT}`);
});
