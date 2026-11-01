const fs = require('fs');
const filePath = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba\\src\\lib\\db.ts';
let code = fs.readFileSync(filePath, 'utf8');

const oldBlock = `    (candidate as any).status = status;
    candidate.accountStatus = status;

    this.addCandidateNotification(id, {
      title: status === 'active' ? 'অ্যাকাউন্ট সক্রিয় হয়েছে' : 'অ্যাকাউন্ট স্থগিত করা হয়েছে',
      message: status === 'active'
        ? 'আপনার চাকরি সেবা অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।'
        : \`আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: \${reason}\`,
      type: 'system',
      link: '/dashboard'
    });



    candidate.updatedAt = new Date().toISOString();



    db.candidates[id] = candidate;



    saveDB(db);`;

const newBlock = `    (candidate as any).status = status;
    candidate.accountStatus = status;
    candidate.updatedAt = new Date().toISOString();
    db.candidates[id] = candidate;
    saveDB(db);

    this.addCandidateNotification(id, {
      title: status === 'active' ? 'অ্যাকাউন্ট সক্রিয় হয়েছে' : 'অ্যাকাউন্ট স্থগিত করা হয়েছে',
      message: status === 'active'
        ? 'আপনার চাকরি সেবা অ্যাকাউন্টটি সফলভাবে সক্রিয় করা হয়েছে।'
        : \`আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। কারণ: \${reason}\`,
      type: 'system',
      link: '/dashboard'
    });`;

let normCode = code.replace(/\r\n/g, '\n');
let normOld = oldBlock.replace(/\r\n/g, '\n');
let normNew = newBlock.replace(/\r\n/g, '\n');

if (normCode.includes(normOld)) {
  normCode = normCode.replace(normOld, normNew);
  fs.writeFileSync(filePath, normCode, 'utf8');
  console.log('[+] db.ts: updateCandidateStatus save order fixed!');
} else {
  console.error('[-] target not matched in db.ts');
}