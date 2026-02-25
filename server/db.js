import { MongoClient } from "mongodb";

const client = new MongoClient(
  "DB_URL",
);

export async function connectDB() {
  await client.connect();
  const db = client.db();
  console.log("Database connected");
  return db;
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("Database connection closed");
  process.exit(0);
});
