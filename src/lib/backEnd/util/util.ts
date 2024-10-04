import * as fs from 'fs';
import { join } from 'path';

export async function readJsonFile(filePath: string): Promise<any> {
  const fullPath = join(process.cwd(), 'public', filePath);
  try {
    const data = await fs.promises.readFile(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file: ${error}`);
    return null;
  }
}
