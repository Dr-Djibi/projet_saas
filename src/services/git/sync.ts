import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export const syncRepository = async (repoUrl: string, targetPath: string, branch: string = 'main') => {
  const git: SimpleGit = simpleGit();

  try {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
      console.log(`Cloning repository ${repoUrl} to ${targetPath}...`);
      await git.clone(repoUrl, targetPath, ['--branch', branch, '--depth', '1']);
    } else {
      console.log(`Pulling latest changes in ${targetPath} (branch: ${branch})...`);
      const repo = simpleGit(targetPath);
      await repo.pull('origin', branch);
    }
    return { success: true };
  } catch (error) {
    console.error("Git sync error:", error);
    return { success: false, error: (error as Error).message };
  }
};
