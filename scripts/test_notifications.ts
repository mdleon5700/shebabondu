import { PersonalizedRecommender } from '../src/lib/matching/recommender';
import { serverDB } from '../src/lib/db';

const candId = 'SYNTH-USR-DHAKA-009';
const sent1 = PersonalizedRecommender.notifyCandidateOnTopMatches(candId);
console.log('First dispatch sent count:', sent1);

const notifs = serverDB.getCandidateNotifications(candId);
console.log('Candidate total notifications:', notifs.length);
if (notifs.length > 0) {
  console.log('Latest notification title:', notifs[notifs.length - 1].title);
}

// Test deduplication
const sent2 = PersonalizedRecommender.notifyCandidateOnTopMatches(candId);
console.log('Second dispatch sent count (deduplication check):', sent2);
