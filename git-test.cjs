const { execSync } = require('child_process');
try {
  const result = execSync('git status', { encoding: 'utf8' });
  console.log(result);
} catch (e) {
  console.log("No git");
}
