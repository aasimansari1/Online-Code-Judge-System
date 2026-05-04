const { write, read } = require('../data/storage');
const { PROBLEMS } = require('../data/seed');

const existing = read('problems', []);
if (existing.length > 0) {
  console.log(`Problems already seeded (${existing.length} entries). Use --force to overwrite.`);
  if (!process.argv.includes('--force')) process.exit(0);
}

write('problems', PROBLEMS);
write('submissions', read('submissions', []));
console.log(`Seeded ${PROBLEMS.length} problems.`);
