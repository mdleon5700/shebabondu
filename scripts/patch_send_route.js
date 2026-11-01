const fs = require('fs');
const filePath = 'C:\\Users\\Leon Rahman\\Documents\\chakri-sheba\\src\\app\\api\\admin\\notifications\\send\\route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const target = `    // Single Recipient Transactional Notice
    const targetCandidateId = candidateId || (recipientPhone ? ('USR-' + recipientPhone) : 'UNKNOWN');
    serverDB.enqueueNotificationDelivery({
      id: deliveryId,
      candidateId: targetCandidateId,
      jobId: 'DIRECT-ADMIN',
      jobTitle: 'অ্যাডমিন নোটিশ',
      organization: 'চাকরি সেবা',
      type: 'system',
      channel: deliveryChannel,
      title: title || 'চাকরি সেবা বার্তা',
      message: message.trim(),
      link: '/dashboard',
      status: 'DELIVERED',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
          read: false,
      dedupeKey: 'NOTIF-' + deliveryId
    });

    if (candidateId) {
      serverDB.addCandidateNotification(candidateId, {
        title: title || 'অ্যাডমিন জরুরি বিজ্ঞপ্তি',
        message: message.trim(),
        type: 'system',
        link: '/dashboard'
      });
    }`;

const replacement = `    // Single Recipient Transactional Notice
    let actualCandidateId = candidateId;
    if (!actualCandidateId && recipientPhone) {
      const foundCandidate = serverDB.getCandidateByPhone(recipientPhone);
      if (foundCandidate) {
        actualCandidateId = foundCandidate.id;
      }
    }
    const finalCandidateId = actualCandidateId || (recipientPhone ? ('USR-' + recipientPhone) : 'UNKNOWN');

    serverDB.enqueueNotificationDelivery({
      id: deliveryId,
      candidateId: finalCandidateId,
      jobId: 'DIRECT-ADMIN',
      jobTitle: 'অ্যাডমিন নোটিশ',
      organization: 'চাকরি সেবা',
      type: 'system',
      channel: deliveryChannel,
      title: title || 'চাকরি সেবা বার্তা',
      message: message.trim(),
      link: '/dashboard',
      status: 'DELIVERED',
      attemptCount: 1,
      createdAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      read: false,
      dedupeKey: 'NOTIF-' + deliveryId
    });

    if (finalCandidateId && finalCandidateId !== 'UNKNOWN') {
      serverDB.addCandidateNotification(finalCandidateId, {
        title: title || 'অ্যাডমিন জরুরি বিজ্ঞপ্তি',
        message: message.trim(),
        type: 'system',
        link: '/dashboard'
      });
    }`;

let normCode = code.replace(/\r\n/g, '\n');
let normTarget = target.replace(/\r\n/g, '\n');
let normRep = replacement.replace(/\r\n/g, '\n');

if (normCode.includes(normTarget)) {
  normCode = normCode.replace(normTarget, normRep);
  fs.writeFileSync(filePath, normCode, 'utf8');
  console.log('[+] admin/notifications/send/route.ts successfully patched!');
} else {
  console.error('[-] target not found in send/route.ts');
}