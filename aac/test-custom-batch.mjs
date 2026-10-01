import { defaultCollegeData } from './src/js/sample-data.js';
import { AIScheduler } from './src/js/ai-scheduler.js';

console.log('--- Testing Custom Batch and Staff Assignment In AI Scheduler ---');

// Clone data
const customData = JSON.parse(JSON.stringify(defaultCollegeData));

// Add new custom batch
customData.classes.push({
  id: 'MECH-3A',
  name: 'Mechanical Engineering (3rd Sem)',
  strength: 55,
  baseRoom: 'LH-101'
});

// Add new custom faculty
customData.faculty.push({
  id: 'FAC-999',
  name: 'Prof. Arvind Swamy',
  designation: 'Assistant Professor',
  department: 'MECH',
  maxWeeklyHours: 16,
  unavailableSlots: []
});

// Add new custom courses
customData.courses.push({
  id: 'ME301',
  code: 'ME301',
  title: 'Thermodynamics & Heat Transfer',
  classId: 'MECH-3A',
  facultyId: 'FAC-999',
  type: 'Theory',
  weeklyHours: 4,
  labRoomId: null
});

customData.courses.push({
  id: 'ME301L',
  code: 'ME301L',
  title: 'Thermal Fluid Systems Lab',
  classId: 'MECH-3A',
  facultyId: 'FAC-999',
  type: 'Lab',
  weeklyHours: 2,
  labRoomId: 'CS-LAB-2'
});

const scheduler = new AIScheduler(customData);
const schedule = await scheduler.generateSchedule();

console.log(`Generated schedule entries with custom batch: ${schedule.length}`);
const mechSlots = schedule.filter(s => s.classId === 'MECH-3A');
console.log(`MECH-3A allocated slots: ${mechSlots.length}`);

const conflicts = scheduler.detectConflicts(schedule);
console.log(`Clashes detected: ${conflicts.length}`);

if (conflicts.length === 0 && mechSlots.length === 6) {
  console.log('✅ Custom Batch & Staff Allocation Verified Successfully!');
} else {
  console.error('❌ Validation failed');
  process.exit(1);
}
