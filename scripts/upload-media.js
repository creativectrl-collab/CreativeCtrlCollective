import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
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

function findCwebp() {
  const defaultPath = '/usr/local/bin/cwebp';
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }
  try {
    const check = spawnSync('which', ['cwebp'], { encoding: 'utf-8' });
    if (check.status === 0 && check.stdout.trim()) {
      return check.stdout.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

function getImageDimensions(cwebpPath, filePath) {
  const result = spawnSync(cwebpPath, [filePath, '-o', '/dev/null'], {
    encoding: 'utf-8',
  });
  const output = (result.stderr || '') + (result.stdout || '');
  const match = output.match(/Dimension:\s+(\d+)\s+x\s+(\d+)/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  throw new Error(`Could not determine dimensions for ${filePath}: ${output}`);
}

function convertToWebp(cwebpPath, inputPath, maxEdge, quality) {
  const { width, height } = getImageDimensions(cwebpPath, inputPath);
  const tmpOut = path.join(
    os.tmpdir(),
    `cwebp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`
  );

  const args = ['-q', String(quality)];

  if (width > maxEdge || height > maxEdge) {
    if (width >= height) {
      args.push('-resize', String(maxEdge), '0');
    } else {
      args.push('-resize', '0', String(maxEdge));
    }
  }

  args.push(inputPath, '-o', tmpOut);

  const res = spawnSync(cwebpPath, args, { encoding: 'utf-8' });
  if (res.status !== 0) {
    if (fs.existsSync(tmpOut)) {
      try { fs.unlinkSync(tmpOut); } catch {}
    }
    throw new Error(`cwebp failed for ${inputPath}: ${res.stderr || res.stdout}`);
  }

  const buffer = fs.readFileSync(tmpOut);
  try { fs.unlinkSync(tmpOut); } catch {}
  return buffer;
}

async function uploadBuffer(buffer, remotePath, contentType) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(remotePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error(`Failed to upload to ${remotePath}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(remotePath);

  return urlData.publicUrl;
}

async function main() {
  console.log(`Starting media upload to bucket "${BUCKET_NAME}"...`);
  const cwebpPath = findCwebp();
  const mappings = {};

  const rasterExts = new Set(['.png', '.jpg', '.jpeg', '.webp']);

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

      const ext = path.extname(file).toLowerCase();
      const stem = path.parse(file).name;

      if (rasterExts.has(ext)) {
        if (!cwebpPath) {
          throw new Error(`cwebp is missing (/usr/local/bin/cwebp not found). Cannot process raster file: ${localPath}`);
        }

        console.log(`Generating WebP variants for ${folder.local}/${file}...`);

        // 1. Master variant (max edge 2048, quality 85)
        const masterBuffer = convertToWebp(cwebpPath, localPath, 2048, 85);
        const remoteMasterPath = `${folder.remote}/${stem}.webp`;
        console.log(`Uploading ${remoteMasterPath}...`);
        const masterPublicUrl = await uploadBuffer(masterBuffer, remoteMasterPath, 'image/webp');

        // 2. Thumb variant (max edge 480, quality 75)
        const thumbBuffer = convertToWebp(cwebpPath, localPath, 480, 75);
        const remoteThumbPath = `${folder.remote}/${stem}-thumb.webp`;
        console.log(`Uploading ${remoteThumbPath}...`);
        const thumbPublicUrl = await uploadBuffer(thumbBuffer, remoteThumbPath, 'image/webp');

        if (masterPublicUrl && thumbPublicUrl) {
          console.log(`Successfully uploaded:`);
          console.log(`  Master: ${masterPublicUrl}`);
          console.log(`  Thumb:  ${thumbPublicUrl}`);
          const key = `/${folder.local.replace('public/', '')}/${file}`;
          mappings[key] = masterPublicUrl;
        }
      } else if (ext === '.svg') {
        // SVG is not a raster photo: upload it unchanged without generating WebP thumbnails
        const remotePath = `${folder.remote}/${file}`;
        console.log(`Uploading SVG ${folder.local}/${file} -> ${remotePath}...`);
        const fileBuffer = fs.readFileSync(localPath);
        const publicUrl = await uploadBuffer(fileBuffer, remotePath, 'image/svg+xml');
        if (publicUrl) {
          console.log(`Successfully uploaded SVG: ${publicUrl}`);
          const key = `/${folder.local.replace('public/', '')}/${file}`;
          mappings[key] = publicUrl;
        }
      } else {
        console.warn(`Skipping unrecognized file type: ${localPath}`);
      }
    }
  }

  console.log('\n--- UPLOAD COMPLETE ---');
  console.log('Use the following URL mappings:');
  console.log(JSON.stringify(mappings, null, 2));
}

main().catch(err => {
  console.error('Upload script failed:', err);
  process.exit(1);
});
