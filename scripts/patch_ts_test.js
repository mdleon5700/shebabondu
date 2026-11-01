const fs = require('fs');
const file = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba\\scripts\\test_full_system_integration.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('function assert(condition, message)', 'function assert(condition: any, message: string)');
code = code.replace('allJobs.filter(j => candidateSavedJobs.includes(j.id))', 'allJobs.filter((j: any) => candidateSavedJobs.includes(j.id))');
code = code.replace('adminViewSavedJobs.some(j => j.id === testJob.id)', 'adminViewSavedJobs.some((j: any) => j.id === testJob.id)');

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed types in test_full_system_integration.ts');