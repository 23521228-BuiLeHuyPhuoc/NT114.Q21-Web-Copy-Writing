import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, '..');
const sourceDir = join(frontendDir, 'node_modules', 'tinymce');
const targetDir = join(frontendDir, 'public', 'tinymce');
const publicDir = join(frontendDir, 'public');

function assertInside(child, parent) {
  const relativePath = relative(parent, child);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Refusing to modify path outside ${parent}: ${child}`);
  }
}

async function copyDirectory(source, target) {
  await mkdir(target, { recursive: true });

  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await copyFile(sourcePath, targetPath);
    }
  }
}

try {
  assertInside(targetDir, publicDir);
  await mkdir(publicDir, { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await copyDirectory(sourceDir, targetDir);
  console.log('TinyMCE assets copied to public/tinymce');
} catch (error) {
  console.error('Unable to copy TinyMCE assets. Run yarn install in frontend first.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
