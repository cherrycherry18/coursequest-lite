import fs from 'node:fs';
import path from 'node:path';
import fetch from 'node-fetch';

async function main() {
  const filePath = path.join(process.cwd(), 'sample-courses.csv');
  const content = fs.readFileSync(filePath);
  const form = new (global as any).FormData();
  form.append('file', new Blob([content]), 'sample-courses.csv');
  const res = await fetch('http://localhost:4000/api/ingest', { method: 'POST', headers: { 'x-ingest-token': process.env.INGEST_TOKEN ?? 'dev_ingest_token' }, body: form as any });
  console.log(await res.json());
}

main();


