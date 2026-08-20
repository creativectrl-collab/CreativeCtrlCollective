import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Helper to parse .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found at project root.');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
// Use VITE_SUPABASE_ANON_KEY, but fallback/override if service role key is provided in env
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in .env.local.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'public-media';

const mediaFolders = [
  { local: 'public/media/events', remote: 'events' },
  { local: 'public/media/scenes', remote: 'scenes' },
  { local: 'public/media/team', remote: 'team' },
];

function getContentType(ext) {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function uploadFile(localPath, remotePath) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath);
  const contentType = getContentType(ext);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(remotePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Failed to upload ${localPath} to ${remotePath}:`, error.message);
    return null;
  }

  // Generate public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(remotePath);

  return urlData.publicUrl;
}

async function main() {
  console.log(`Starting media upload to bucket "${BUCKET_NAME}"...`);
  const mappings = {};

  for (const folder of mediaFolders) {
    const localDir = path.resolve(process.cwd(), folder.local);
    if (!fs.existsSync(localDir)) {
      console.warn(`Local directory not found: ${folder.local}, skipping.`);
      continue;
    }

    const files = fs.readdirSync(localDir);
    for (const file of files) {
      const localPath = path.join(localDir, file);
      if (fs.statSync(localPath).isDirectory()) continue;

      const remotePath = `${folder.remote}/${file}`;
      console.log(`Uploading ${folder.local}/${file} -> ${remotePath}...`);
      const publicUrl = await uploadFile(localPath, remotePath);
      if (publicUrl) {
        console.log(`Successfully uploaded: ${publicUrl}`);
        // Create lookup key like "/media/events/latest.png"
        const key = `/${folder.local.replace('public/', '')}/${file}`;
        mappings[key] = publicUrl;
      }
    }
  }

  console.log('\n--- UPLOAD COMPLETE ---');
  console.log('Use the following URL mappings:');
  console.log(JSON.stringify(mappings, null, 2));

  // Write mapping log for reference
  fs.writeFileSync(
    path.resolve(process.cwd(), 'scripts/upload-mappings.json'),
    JSON.stringify(mappings, null, 2)
  );
  console.log('\nMappings saved to scripts/upload-mappings.json');
}

main().catch(err => {
  console.error('Upload script failed:', err);
});
