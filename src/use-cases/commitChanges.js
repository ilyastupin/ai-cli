import { execSync } from 'child_process';
import { getLastFileList } from '../history/history.js';

/**
 * Commits the changes in the repository using the first line from the last file list as the commit message.
 */
export function commitChanges() {
  try {
    const fileList = getLastFileList();
    const firstLine = fileList.split('\n')[0] || 'Default commit message';
    execSync(`git add . && git commit -m "${firstLine}"`, { stdio: 'inherit' });
    console.log('Changes committed to the repository.');
  } catch (error) {
    console.error('Failed to commit changes:', error.message);
  }
}