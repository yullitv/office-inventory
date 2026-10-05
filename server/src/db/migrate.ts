import type { Db } from './connection.js';
import { migrations } from './migrations.js';
import { transaction } from './transaction.js';

export function runMigrations(db: Db) {
  const { user_version: currentVersion } = db.prepare('PRAGMA user_version').get() as {
    user_version: number;
  };
  const pending = migrations.slice(currentVersion);

  transaction(db, () => {
    pending.forEach((sql, index) => {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${currentVersion + index + 1}`);
    });
  });
}
