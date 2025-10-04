import { MongoClient } from 'mongodb';
import { BSON } from 'bson';
import 'dotenv/config';

const uri = process.env.DB_URL as string | undefined;

async function run() {
  if (!uri) {
    console.error('Переменная окружения DB_URL не задана');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const dbName =
      client.options.dbName || uri?.split?.('/')?.pop?.()?.split?.('?')?.[0];
    if (!dbName) return '';
    const db = client.db(dbName);

    const collections = await db.collections();
    if (!collections.length) {
      console.log('В базе нет коллекций');
      return;
    }

    const clusterLimit = 512 * 1024 * 1024; // 512 MB
    let totalStorage = 0;

    for (const col of collections) {
      const name = col.collectionName;

      const sample = await col.find().limit(1000).toArray();
      if (!sample.length) {
        console.log(`${name}: пустая коллекция`);
        continue;
      }

      const totalBytes = sample.reduce(
        (sum, doc) => sum + BSON.serialize(doc).byteLength,
        0,
      );
      const avgSize = totalBytes / sample.length;
      const approxDocs = Math.floor(clusterLimit / avgSize);

      // ---- исправленная часть ----
      const stats = await db.command({ collStats: name, scale: 1 });
      const storageUsed =
        (stats.storageSize || 0) + (stats.totalIndexSize || 0);
      totalStorage += storageUsed;
      // ----------------------------

      console.log(`\nКоллекция: ${name}`);
      console.log(
        `  Средний размер документа: ${(avgSize / 1024).toFixed(2)} KB`,
      );
      console.log(
        `  Примерно документов в 512 MB: ${approxDocs.toLocaleString()}`,
      );
      console.log(
        `  Реальный объём (данные + индексы): ${(storageUsed / 1024 / 1024).toFixed(2)} MB`,
      );
    }

    console.log(
      `\nСуммарный реальный объём всех коллекций: ${(totalStorage / 1024 / 1024).toFixed(2)} MB`,
    );
  } finally {
    await client.close();
  }
}

run().catch(console.error);
