import { getDb } from "./client";

async function main() {
  await getDb();
  console.log("Database ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
