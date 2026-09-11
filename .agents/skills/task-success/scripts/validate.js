import { execSync } from 'child_process';

function run(command) {
  console.log(`\nExecuting: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\nCommand failed: ${command}`);
    return false;
  }
}

console.log('--- Starting Task Success Verification ---');

const testsPassed = run('npm run test -- --run');
if (!testsPassed) {
  console.error('\nFAIL: Tests failed.');
  process.exit(1);
}

const buildPassed = run('npm run build');
if (!buildPassed) {
  console.error('\nFAIL: Build failed.');
  process.exit(1);
}

console.log('\n--- SUCCESS: Tests and Build passed! ---');
process.exit(0);