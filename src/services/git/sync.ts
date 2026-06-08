import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export const syncRepository = async (repoUrl: string, targetPath: string, branch: string = 'main') => {
  const git: SimpleGit = simpleGit();

  try {
    // S'assurer que le dossier parent existe
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      console.log(`Cloning repository ${repoUrl} to ${targetPath}...`);
      await git.clone(repoUrl, targetPath, ['--branch', branch, '--depth', '1']);
    } else {
      // Vérifier si c'est déjà un dépôt git
      if (fs.existsSync(path.join(targetPath, '.git'))) {
        console.log(`Pulling latest changes in ${targetPath} (branch: ${branch})...`);
        const repo = simpleGit(targetPath);
        await repo.pull('origin', branch);
      } else {
        // Le dossier existe mais n'est pas un repo git
        console.warn(`Target path ${targetPath} exists but is not a git repository. Re-cloning...`);
        fs.rmSync(targetPath, { recursive: true, force: true });
        fs.mkdirSync(targetPath, { recursive: true });
        await git.clone(repoUrl, targetPath, ['--branch', branch, '--depth', '1']);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Git sync error:", error);
    return { success: false, error: (error as Error).message };
  }
};

