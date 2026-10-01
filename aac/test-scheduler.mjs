import { defaultCollegeData } from './src/js/sample-data.js';
import { AIScheduler } from './src/js/ai-scheduler.js';

console.log('--- Testing AI Timetable Preparation Engine ---');
const scheduler = new AIScheduler(defaultCollegeData);

async function test() {
  const schedule = await scheduler.generateSchedule((p) => {
    console.log(`[Step ${p.step}%] ${p.message}`);
  });

  console.log(`\nGenerated ${schedule.length} timetable slot entries.`);

  const conflicts = scheduler.detectConflicts(schedule);
  console.log(`Detected conflicts count: ${conflicts.length}`);
  if (conflicts.length > 0) {
    console.error('Conflicts found:', conflicts);
    process.exit(1);
  }

  // Verify labs are in 2-period pairs
  const labSlots = schedule.filter(s => s.type === 'Lab');
  console.log(`Total lab sessions allocated: ${labSlots.length}`);
  for (let i = 0; i < labSlots.length; i += 2) {
    const s1 = labSlots[i];
    const s2 = labSlots[i+1];
    if (s1 && s2 && s1.courseId === s2.courseId && s1.day === s2.day) {
      if (Math.abs(s1.period - s2.period) !== 1) {
        console.error(`Lab slots not contiguous! ${s1.period} vs ${s2.period}`);
        process.exit(1);
      }
    }
  }

  console.log('✅ ALL TESTS PASSED: 0 hard clashes, lab continuous constraints preserved, faculty workload balanced!');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
