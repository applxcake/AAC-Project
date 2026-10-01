// Sample College Master Data for AI Timetable Preparation

export const defaultCollegeData = {
  institution: {
    name: "XYZ University",
    shortName: "XYZ University",
    department: "Department of Computer Science & Engineering",
    academicYear: "2026 - 2027",
    semesterType: "Odd Semester"
  },

  scheduleConfig: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    periods: [
      { id: 1, name: "Period 1", startTime: "09:00", endTime: "09:55", isBreak: false },
      { id: 2, name: "Period 2", startTime: "09:55", endTime: "10:50", isBreak: false },
      { id: 3, name: "Period 3", startTime: "10:55", endTime: "11:50", isBreak: false },
      { id: "lunch", name: "Lunch Break", startTime: "11:50", endTime: "12:40", isBreak: true },
      { id: 4, name: "Period 4", startTime: "12:40", endTime: "01:35", isBreak: false },
      { id: 5, name: "Period 5", startTime: "01:35", endTime: "02:30", isBreak: false },
      { id: 6, name: "Period 6", startTime: "02:35", endTime: "03:30", isBreak: false },
      { id: 7, name: "Period 7", startTime: "03:30", endTime: "04:25", isBreak: false }
    ]
  },

  classes: [
    { id: "CSE-3A", name: "CSE 3rd Sem (Section A)", strength: 60, baseRoom: "LH-101" },
    { id: "CSE-3B", name: "CSE 3rd Sem (Section B)", strength: 60, baseRoom: "LH-102" },
    { id: "AIML-5", name: "AI & Machine Learning (5th Sem)", strength: 55, baseRoom: "LH-201" },
    { id: "DS-5", name: "Data Science (5th Sem)", strength: 50, baseRoom: "LH-202" }
  ],

  faculty: [
    { id: "FAC-101", name: "Dr. Aris Thorne", designation: "Professor & HOD", maxWeeklyHours: 14, department: "CSE", unavailableSlots: ["Monday-1"] },
    { id: "FAC-102", name: "Dr. Priya Sharma", designation: "Associate Professor", maxWeeklyHours: 16, department: "CSE", unavailableSlots: ["Friday-7"] },
    { id: "FAC-103", name: "Prof. Vikram Rao", designation: "Assistant Professor", maxWeeklyHours: 18, department: "CSE", unavailableSlots: [] },
    { id: "FAC-104", name: "Prof. Anita Desai", designation: "Assistant Professor", maxWeeklyHours: 18, department: "CSE", unavailableSlots: [] },
    { id: "FAC-105", name: "Dr. Rajesh Kumar", designation: "Professor", maxWeeklyHours: 14, department: "AIML", unavailableSlots: [] },
    { id: "FAC-106", name: "Prof. Sneha Patel", designation: "Assistant Professor", maxWeeklyHours: 16, department: "Math", unavailableSlots: [] },
    { id: "FAC-107", name: "Prof. Karthik Menon", designation: "Assistant Professor", maxWeeklyHours: 18, department: "ECE/Hardware", unavailableSlots: [] },
    { id: "FAC-108", name: "Prof. Meera Nair", designation: "Assistant Professor", maxWeeklyHours: 16, department: "CSE", unavailableSlots: [] }
  ],

  rooms: [
    { id: "LH-101", name: "Lecture Hall 101", type: "Lecture", capacity: 70 },
    { id: "LH-102", name: "Lecture Hall 102", type: "Lecture", capacity: 70 },
    { id: "LH-201", name: "Lecture Hall 201", type: "Lecture", capacity: 65 },
    { id: "LH-202", name: "Lecture Hall 202", type: "Lecture", capacity: 65 },
    { id: "CS-LAB-1", name: "Algorithms & Systems Lab", type: "Lab", capacity: 65 },
    { id: "CS-LAB-2", name: "Software Development Lab", type: "Lab", capacity: 65 },
    { id: "AI-LAB", name: "High-Performance AI & GPU Lab", type: "Lab", capacity: 60 },
    { id: "IOT-LAB", name: "IoT & Embedded Systems Lab", type: "Lab", capacity: 60 }
  ],

  courses: [
    // CSE-3A Courses
    { id: "CS301-A", code: "CS301", title: "Data Structures & Algorithms", classId: "CSE-3A", facultyId: "FAC-101", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-101" },
    { id: "CS301L-A", code: "CS301L", title: "DSA Practical Lab", classId: "CSE-3A", facultyId: "FAC-101", type: "Lab", weeklyHours: 2, labRoomId: "CS-LAB-1", roomId: "CS-LAB-1" },
    { id: "CS302-A", code: "CS302", title: "Operating Systems", classId: "CSE-3A", facultyId: "FAC-102", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-102" },
    { id: "CS302L-A", code: "CS302L", title: "OS Kernel Lab", classId: "CSE-3A", facultyId: "FAC-102", type: "Lab", weeklyHours: 2, labRoomId: "CS-LAB-2", roomId: "CS-LAB-2" },
    { id: "CS303-A", code: "CS303", title: "Discrete Mathematics", classId: "CSE-3A", facultyId: "FAC-106", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-201" },
    { id: "CS304-A", code: "CS304", title: "Computer Architecture", classId: "CSE-3A", facultyId: "FAC-107", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-202" },
    { id: "HS301-A", code: "HS301", title: "Technical Communication", classId: "CSE-3A", facultyId: "FAC-104", type: "Theory", weeklyHours: 2, labRoomId: null, roomId: "LH-101" },

    // CSE-3B Courses
    { id: "CS301-B", code: "CS301", title: "Data Structures & Algorithms", classId: "CSE-3B", facultyId: "FAC-103", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-102" },
    { id: "CS301L-B", code: "CS301L", title: "DSA Practical Lab", classId: "CSE-3B", facultyId: "FAC-103", type: "Lab", weeklyHours: 2, labRoomId: "CS-LAB-1", roomId: "CS-LAB-1" },
    { id: "CS302-B", code: "CS302", title: "Operating Systems", classId: "CSE-3B", facultyId: "FAC-102", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-201" },
    { id: "CS302L-B", code: "CS302L", title: "OS Kernel Lab", classId: "CSE-3B", facultyId: "FAC-102", type: "Lab", weeklyHours: 2, labRoomId: "CS-LAB-2", roomId: "CS-LAB-2" },
    { id: "CS303-B", code: "CS303", title: "Discrete Mathematics", classId: "CSE-3B", facultyId: "FAC-106", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-202" },
    { id: "CS304-B", code: "CS304", title: "Computer Architecture", classId: "CSE-3B", facultyId: "FAC-107", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-101" },
    { id: "HS301-B", code: "HS301", title: "Technical Communication", classId: "CSE-3B", facultyId: "FAC-104", type: "Theory", weeklyHours: 2, labRoomId: null, roomId: "LH-201" },

    // AIML-5 Courses
    { id: "AI501", code: "AI501", title: "Machine Learning Foundations", classId: "AIML-5", facultyId: "FAC-105", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-201" },
    { id: "AI501L", code: "AI501L", title: "ML Engineering Lab", classId: "AIML-5", facultyId: "FAC-105", type: "Lab", weeklyHours: 2, labRoomId: "AI-LAB", roomId: "AI-LAB" },
    { id: "AI502", code: "AI502", title: "Deep Neural Networks", classId: "AIML-5", facultyId: "FAC-101", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-202" },
    { id: "AI502L", code: "AI502L", title: "Deep Learning Cluster Lab", classId: "AIML-5", facultyId: "FAC-101", type: "Lab", weeklyHours: 2, labRoomId: "AI-LAB", roomId: "AI-LAB" },
    { id: "AI503", code: "AI503", title: "Cloud Computing & MLOps", classId: "AIML-5", facultyId: "FAC-108", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-101" },
    { id: "AI504", code: "AI504", title: "IoT & Sensor Intelligence", classId: "AIML-5", facultyId: "FAC-107", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-102" },

    // DS-5 Courses
    { id: "DS501", code: "DS501", title: "Big Data Processing (Spark)", classId: "DS-5", facultyId: "FAC-103", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-202" },
    { id: "DS501L", code: "DS501L", title: "Distributed Data Lab", classId: "DS-5", facultyId: "FAC-103", type: "Lab", weeklyHours: 2, labRoomId: "CS-LAB-1", roomId: "CS-LAB-1" },
    { id: "DS502", code: "DS502", title: "Statistical Modeling", classId: "DS-5", facultyId: "FAC-106", type: "Theory", weeklyHours: 4, labRoomId: null, roomId: "LH-101" },
    { id: "DS503", code: "DS503", title: "Data Visualization & Web Apps", classId: "DS-5", facultyId: "FAC-104", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-102" },
    { id: "DS504", code: "DS504", title: "DevOps & Cloud Systems", classId: "DS-5", facultyId: "FAC-108", type: "Theory", weeklyHours: 3, labRoomId: null, roomId: "LH-201" }
  ]
};
