import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export const syncRepository = async (repoUrl: string, targetPath: string) => {
  const git: SimpleGit = simpleGit();

  try {
    if (!fs.existsSync(targetPath)) {
      console.log(`Cloning repository to ${targetPath}...`);
      await git.clone(repoUrl, targetPath);
    } else {
      console.log(`Pulling latest changes in ${targetPath}...`);
      const repo = simpleGit(targetPath);
      await repo.pull();
    }
    return { success: true };
  } catch (error) {
    console.error("Git sync error:", error);
    return { success: false, error: (error as Error).message };
  }
};
