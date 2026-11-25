import fs from "node:fs";
import path from "node:path";

const file = path.resolve(process.env.DATABASE_PATH ?? "./data/lumen.db");
for (const f of [file, `${file}-wal`, `${file}-shm`]) {
  if (fs.existsSync(f)) {
    fs.rmSync(f);
    console.log("removed", f);
  }
}
console.log("Database reset. It will be recreated on next start.");
