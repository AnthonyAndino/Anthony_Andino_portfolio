import { PORTFOLIO_DB, CORE_SKILLS } from '../src/data/portfolioData.js';

// Let's test the rigid anchor math
const hubUnitVectors = [
  [0, 0, 1],   // 1 DATA
  [1, 0, 0],   // 2 DB
  [0, 1, 0],   // 3 PROG
  [-1, 0, 0],  // 4 TOOLS
  [0, -1, 0],  // 5 SOFT
  [0, 0, -1],  // 6 LANG
];

console.log('Testing rigid anchor math...');
