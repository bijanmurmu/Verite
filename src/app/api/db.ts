import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'verite_db.json');

export async function getHashes(): Promise<string[]> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function addHash(hash: string): Promise<void> {
  const hashes = await getHashes();
  if (!hashes.includes(hash)) {
    hashes.push(hash);
    await fs.writeFile(DB_PATH, JSON.stringify(hashes, null, 2));
  }
}
