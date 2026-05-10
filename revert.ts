import { execSync } from 'child_process';
try {
  const log = execSync('git log --oneline -n 10').toString();
  console.log("Git log:");
  console.log(log);
} catch (e) {
  console.error(e);
}
