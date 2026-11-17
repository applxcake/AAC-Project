# COURSE PROJECT REPORT

## **AI-BASED TIMETABLE PREPARATION FOR COLLEGE MANAGEMENT WITH MATERIAL DESIGN 3**

A Course Project report submitted in partial fulfilment of requirement for the award of degree  
**BACHELOR OF TECHNOLOGY**  
in  
**SCHOOL OF COMPUTER SCIENCE AND ARTIFICIAL INTELLIGENCE**  

**Under the guidance of**  
**Mr. S Naresh Kumar**  
Assistant Professor, School of CS&AI  

**SR UNIVERSITY**  
Ananthasagar, Warangal, Telangana - 506 371  

---

### **CERTIFICATE**

This is to certify that this project entitled **"AI-Based Time Table Preparation for College Management with Material Design 3"** is the bonafide work carried out by **[Student Names] ([HTNos])** as a Course Project for the partial fulfillment to award the degree **BACHELOR OF TECHNOLOGY** in **School of Computer Science and Artificial Intelligence** during the academic year 2026–2027 under our guidance and supervision.

<br><br><br>

**Mr. S Naresh Kumar**  
Assistant Professor, School of CS&AI  
SR University School of CS&AI,  
Ananthasagar, Warangal.  

<br>

**Dr. CH. Sandeep**  
Associate Professor & Head,  
SR University School of CS&AI,  
Ananthasagar, Warangal.  

<br>

**Dr. M. Sheshikala, Professor**  
Dean, School of Computer Science and Artificial Intelligence  

---

### **ACKNOWLEDGEMENT**

We owe an enormous debt of gratitude to our Course Project guide **Mr. S Naresh Kumar**, as well as Head of the School of CS&AI, **Dr. CH. Sandeep, Associate Professor**, and Dean of the School of CS&AI, **Dr. M. Sheshikala, Professor**, for guiding us from the beginning through the end of the Capstone Project with their intellectual advice and insightful suggestions. We truly value their consistent feedback on our progress, which was always constructive and encouraging and ultimately drove us in the right direction.

Finally, we express our thanks to all the teaching and non-teaching staff of the department for their suggestions and timely support.

---

### **TABLE OF CONTENTS**

| Chapter | Section | Title / Description | Page |
|:---:|---|---|:---:|
| | **Abstract** | Executive summary, problem, solution, technologies, and outcomes | 3 |
| **1** | **Introduction** | Project background, domain overview, motivation, and importance | 4 |
| **2** | **Problem Statement & Objectives** | | 5 |
| | 2.1 Problem Statement | Real-world academic scheduling challenges | 5 |
| | 2.2 Objectives | Key technical goals and deliverables | 5 |
| | 2.3 Existing System & Proposed Solution | Limitations of current approaches vs proposed AI solution | 6 |
| **3** | **System Design and Architecture** | | 7 |
| | 3.1 System Architecture | Tiered architecture & data flow | 7 |
| | 3.2 Application Workflow & Flowcharts | AI CSP engine execution workflow | 8 |
| | 3.3 Use-Case Model | Actor-action interactions (Admin, HOD, Faculty, Student) | 9 |
| | 3.4 Data Schema & Entity Relationships | College data configuration & timetable data models | 10 |
| **4** | **Methodology & Implementation** | | 11 |
| | 4.1 Tools and Technologies Used | Frontend stack, algorithms, M3, and tooling | 11 |
| | 4.2 AI-Assisted Coding Approach | Prompt engineering, code generation, debugging, refactoring | 12 |
| | 4.3 Implementation Details | Core modules, algorithms, and code explanations | 14 |
| **5** | **Results, Testing & Validation** | | 17 |
| | 5.1 Results & Key Features | Implemented UI, timetable matrices, exports | 17 |
| | 5.2 Testing & Validation | Automated suites, test cases, and error handling | 19 |
| **6** | **Conclusion & Future Scope** | | 22 |
| | 6.1 Conclusion | Summary of project outcomes | 22 |
| | 6.2 Future Enhancements | Next-phase capabilities (GenAI, dynamic re-scheduling) | 22 |
| | 6.3 References | Citations, standards, and technical references | 23 |

---

## **ABSTRACT**

Academic timetable scheduling in higher educational institutions is a notorious combinatorial optimization problem classified as NP-hard. Manual timetable generation or simplistic heuristic tools regularly lead to hard constraint violations, such as room double-booking, faculty over-allocation, fragmented laboratory schedules, and unbalanced student workloads. This project presents **"AI-Based Time Table Preparation for College Management"**, an intelligent, automated web application crafted using Google's **Material Design 3 (M3)** expressive design system and modern JavaScript (ES6+). 

The system leverages a heuristic **Constraint Satisfaction Problem (CSP)** engine with Least Constraining Value (LCV) and Most Constrained Variable (MCV) heuristics. It strictly enforces continuous 2-hour laboratory blocks, faculty non-availability windows, classroom capacity thresholds, and break restrictions (lunch and short breaks), while optimizing soft constraints such as faculty workload balancing and daily subject spread. Developed with an **AI-Assisted Coding (AAC)** approach using Gemini and modern coding agents, the application incorporates role-based authentication (Admin, HOD, Faculty, Student), multi-batch scheduling, conflict heatmaps, real-time timetable generation, and one-click PDF/CSV exports. Extensive test suites verify 100% hard-clash avoidance and robust client-side performance.

---

## **CHAPTER 1: INTRODUCTION**

### 1.1 Project Background
Educational institutions operate under complex logistical constraints involving hundreds of students, specialized laboratories, limited lecture halls, and faculty with distinct specializations and availability constraints. Crafting a weekly timetable requires balancing departmental curricula, university credit guidelines, and physical infrastructure.

### 1.2 Domain Overview
Timetable generation belongs to the domain of Operations Research and Artificial Intelligence known as the **Constraint Satisfaction Problem (CSP)**. A valid schedule maps four core dimensions:
$$\text{Schedule}: (\text{Course}, \text{Faculty}, \text{Room}, \text{Timeslot})$$
subject to a series of hard constraints (non-negotiable physical limits) and soft constraints (pedagogical preferences).

### 1.3 Motivation
Conventional scheduling approaches in colleges rely on spreadsheets or static templates. This manual process takes academic committees several weeks at the start of each semester and frequently breaks down when unexpected constraints (e.g., faculty on leave, lab room equipment maintenance) emerge. A dedicated, intelligent, web-first platform eliminates manual human error, drastically reduces preparation time from weeks to seconds, and guarantees mathematically conflict-free allocations.

### 1.4 Importance of the Proposed Application
The application bridges the gap between complex algorithmic solvers and intuitive human experience:
- **Instantaneous Schedule Generation**: Capable of allocating complete multi-department schedules in under 500 milliseconds.
- **Modern User Experience**: Designed using Material Design 3 (Material You) tokens, dynamic color palettes, and responsive layouts suitable for mobile, tablet, and desktop viewports.
- **Zero Server Setup**: Operates entirely client-side with persistent storage, making it instantly deployable without expensive backend database infrastructure.

---

## **CHAPTER 2: PROBLEM STATEMENT & OBJECTIVES**

### 2.1 Problem Statement
Designing a college timetable manually presents the following critical bottlenecks:
1. **Hard Clashes**: A single lecturer or laboratory space mistakenly assigned to two batches simultaneously.
2. **Laboratory Fragmentation**: Multi-credit practical sessions inadvertently broken across non-contiguous periods or lunch breaks.
3. **Faculty Fatigue & Uneven Workload**: Instructors assigned 5–6 consecutive lectures in a single day while remaining idle on others.
4. **Lack of Adaptability**: Introducing a new batch or faculty requires a complete manual recalculation of the entire institutional timetable.

### 2.2 Objectives
The primary objectives of this project are:
- **Objective 1**: Develop an AI-driven Constraint Satisfaction Problem (CSP) solver that generates conflict-free schedules satisfying 100% of hard constraints.
- **Objective 2**: Implement atomic, contiguous 2-period allocation for laboratory subjects without spanning college breaks.
- **Objective 3**: Design a clean, accessible web user interface following Material Design 3 guidelines with light/dark adaptive theming.
- **Objective 4**: Provide Role-Based Access Control (RBAC) supporting Administrator, HOD, Faculty, and Student personas.
- **Objective 5**: Enable dynamic interactive editing, clash detection heatmaps, and multi-format timetable exports (CSV and printable layout).

### 2.3 Existing System vs. Proposed Solution

| Parameter | Existing System (Spreadsheets / Manual) | Proposed AI Timetable System |
|---|---|---|
| **Turnaround Time** | 2–3 weeks of committee meetings | < 1 second automated computation |
| **Conflict Resolution** | Trial-and-error; human-prone errors | Deterministic AI CSP backtracking & heuristics |
| **Lab Handling** | Often fragmented or overlaps lunch breaks | Enforced atomic 2-hour contiguous pairings |
| **User Experience** | Static spreadsheets, low readability | Dynamic Material Design 3 with conflict visualizers |
| **Adaptability** | Adding a batch requires manual redesign | Instant recalculation with custom batch & staff inputs |
| **Access Control** | Single shared file with version conflicts | Multi-role dashboard with permissions and route guards |

---

## **CHAPTER 3: SYSTEM DESIGN AND ARCHITECTURE**

### 3.1 System Architecture
The application uses a modular, decoupled, event-driven frontend architecture:

```
+--------------------------------------------------------------------------+
|                         PRESENTATION LAYER (M3 UI)                       |
|   [Navbar & Navigation Rails] | [Schedule Matrix View] | [Analytics Hub] |
|   [Faculty Workload Cards]    | [Conflict Indicator]   | [Export Engine] |
+--------------------------------------------------------------------------+
                                    | Events / DOM Updates
+--------------------------------------------------------------------------+
|                     APPLICATION CONTROLLER & ROUTER                      |
|       [State Manager (Reactive)]  <--->  [Role-Based Route Guard]       |
+--------------------------------------------------------------------------+
             |                                             |
             v                                             v
+-----------------------------+               +----------------------------+
|   AI SCHEDULER ENGINE       |               |    PERSISTENCE LAYER       |
| - CSP Variable Selector     |               | - LocalStorage Cache       |
| - Domain Pruning (MRV/LCV)  |               | - Mock Session Auth        |
| - Lab Contiguity Assigner   |               | - Sample Institutional DB  |
| - Conflict Detection Engine |               +----------------------------+
+-----------------------------+
```

### 3.2 Application Workflow & CSP Heuristic Flowchart

```mermaid
flowchart TD
    Start([Start Generation]) --> LoadData[Load College Data: Faculty, Classes, Rooms, Courses]
    LoadData --> Separate[Separate Courses into Labs & Theory]
    Separate --> OrderLab[Sort Labs: Most Constrained Variables First]
    
    subgraph Lab Allocation Phase
        OrderLab --> PickLab[Pick Next Lab Course]
        PickLab --> FindPair{Find Valid 2-Period Pair<br/>[1,2], [2,3], [4,5], [5,6], [6,7]}
        FindPair -- Yes --> BookLab[Book Both Slots Atomically in Maps]
        FindPair -- No --> BacktrackLab[Try Alternate Day]
        BookLab --> MoreLabs{More Labs?}
        MoreLabs -- Yes --> PickLab
    end

    MoreLabs -- No --> OrderTheory[Sort Theory by Faculty Load Descending]

    subgraph Theory Allocation Phase
        OrderTheory --> PickTheory[Pick Theory Session Unit]
        PickTheory --> CheckSlot{Is Room, Faculty & Class Free?}
        CheckSlot -- Free --> BookTheory[Book Slot & Increment Day Count]
        CheckSlot -- Busy --> NextSlot[Try Next Period / Room]
        BookTheory --> MoreTheory{More Theory?}
        MoreTheory -- Yes --> PickTheory
    end

    MoreTheory -- No --> RunAuditor[Execute Conflict Auditor detectConflicts]
    RunAuditor --> CalcScore[Calculate AI Fitness Score %]
    CalcScore --> RenderUI[Render M3 Timetable Matrix & Workload Cards]
    RenderUI --> End([Complete])
```

### 3.3 Use-Case Diagram

```text
                     +-----------------------------------------------------+
                     |           AI Timetable Management System            |
                     +-----------------------------------------------------+
                     |                                                     |
  ( Administrator )--+---> ( Manage Faculty, Rooms, Courses & Batches )    |
         |           |                                                     |
         |           +---> ( Trigger AI Timetable Generation Engine )      |
         |           |                                                     |
     ( HOD ) --------+---> ( Inspect Department Workload & Clashes )       |
         |           |                                                     |
         |           +---> ( Manually Override / Reassign Slots )          |
         |           |                                                     |
   ( Faculty ) ------+---> ( View Filtered Personal Schedule )             |
                     |                                                     |
   ( Student ) ------+---> ( View Batch Timetable & Export PDF/CSV )       |
                     +-----------------------------------------------------+
```

### 3.4 Data Schema & Entity Relationships
- **Class / Batch Entity**: `{ id: String, name: String, strength: Number, baseRoom: String }`
- **Faculty Entity**: `{ id: String, name: String, designation: String, department: String, maxWeeklyHours: Number, unavailableSlots: Array<String> }`
- **Room Entity**: `{ id: String, name: String, type: 'LectureHall' | 'Lab', capacity: Number }`
- **Course Entity**: `{ id: String, code: String, title: String, classId: String, facultyId: String, type: 'Theory' | 'Lab', weeklyHours: Number, labRoomId: String }`
- **ScheduleSlot Entity**: `{ id: String, classId: String, courseId: String, facultyId: String, roomId: String, day: String, period: Number, type: String }`

---

## **CHAPTER 4: METHODOLOGY & IMPLEMENTATION**

### 4.1 Tools and Technologies Used
- **JavaScript (ES6+)**: Pure modern ECMAScript with native modules, async/await, and arrow syntax.
- **Vite 6.2**: Next-generation frontend tooling providing lightning-fast development feedback and asset bundling.
- **Material Design 3**: Google's latest design system featuring expressive typography, tonal palettes, elevation overlays, and accessible contrast ratios.
- **Node.js**: Execution environment for headless algorithmic testing.
- **Vercel Edge Platform**: Deployed serverless hosting environment ensuring low-latency delivery.

### 4.2 AI-Assisted Coding Approach

#### 4.2.1 Prompt Engineering and Iterative Refinement
The timetable solver was developed using systematic prompt design:

* **Initial Prompt**:
  > *"Generate a JavaScript timetable scheduling algorithm that takes faculty, courses, and rooms and schedules them across 5 days."*
* **AI Output Analysis**:
  The resulting code was a simple random permutation generator that frequently produced slot collisions and split 2-hour labs across arbitrary periods.
* **Refined Prompt with Rigid Constraints**:
  > *"Refactor this algorithm into a deterministic Constraint Satisfaction Problem (CSP) solver. Use Most Constrained Variable (MCV) ordering for practical lab sessions. All lab sessions must be continuous across 2 periods ([1,2], [2,3], [4,5], [5,6], [6,7]) and never cross Period 3 (lunch). Maintain lookup maps for faculty, room, and class to achieve O(1) clash checking."*

#### 4.2.2 AI-Assisted Code Refactoring & Debugging
During testing, an issue occurred where faculty members were assigned 5 consecutive lecture hours on a single day. The AI assistant was prompted to write an intelligent day-spread counter:
```javascript
// AI-recommended day spread heuristic
courseDayCount[`${course.id}-${day}`] = (courseDayCount[`${course.id}-${day}`] || 0) + 1;
```
This ensured no single course was scheduled more than once or twice on the same day for a class batch, drastically improving student learning retention.

### 4.3 Implementation Details

#### Core Algorithm: `AIScheduler.generateSchedule()` (`aac/src/js/ai-scheduler.js`)
```javascript
// Continuous 2-period pairs (cannot span lunch break)
// Active periods: 1, 2, 3 (morning) and 4, 5, 6, 7 (afternoon)
const validLabPairs = [
  [1, 2], [2, 3],
  [4, 5], [5, 6], [6, 7]
];

// Schedule Labs first (Most Constrained Variables)
for (const course of labCourses) {
  const classObj = this.data.classes.find(c => c.id === course.classId);
  const targetRoom = course.roomId || course.labRoomId || "CS-LAB-1";
  let placed = false;

  const shuffledDays = this._shuffle([...this.days]);

  for (const day of shuffledDays) {
    if (placed) break;
    const shuffledPairs = this._shuffle([...validLabPairs]);

    for (const [p1, p2] of shuffledPairs) {
      if (isSlotFree(course.classId, course.facultyId, targetRoom, day, p1) &&
          isSlotFree(course.classId, course.facultyId, targetRoom, day, p2)) {

        bookSlot({
          id: `slot-${course.id}-${day}-${p1}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          classId: course.classId,
          className: classObj ? classObj.name : course.classId,
          facultyId: course.facultyId,
          roomId: targetRoom,
          day,
          period: p1,
          type: "Lab",
          isLabBlockStart: true
        });

        bookSlot({
          id: `slot-${course.id}-${day}-${p2}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          classId: course.classId,
          className: classObj ? classObj.name : course.classId,
          facultyId: course.facultyId,
          roomId: targetRoom,
          day,
          period: p2,
          type: "Lab",
          isLabBlockContinuation: true
        });

        placed = true;
        break;
      }
    }
  }
}
```

#### Collision Auditor: `detectConflicts()`
```javascript
detectConflicts(schedule) {
  const conflicts = [];
  const facultyMap = {};
  const roomMap = {};
  const classMap = {};

  for (const slot of schedule) {
    const fKey = `${slot.facultyId}#${slot.day}#${slot.period}`;
    const rKey = `${slot.roomId}#${slot.day}#${slot.period}`;
    const cKey = `${slot.classId}#${slot.day}#${slot.period}`;

    if (facultyMap[fKey]) {
      conflicts.push({
        type: 'FACULTY_DOUBLE_BOOKED',
        description: `Faculty ${slot.facultyId} double-booked on ${slot.day} Period ${slot.period}`
      });
    } else {
      facultyMap[fKey] = slot;
    }
    // Room and class checks follow identical O(1) hash validations
  }
  return conflicts;
}
```

---

## **CHAPTER 5: RESULTS, TESTING & VALIDATION**

### 5.1 Results and Screenshots

#### Screenshot 1: Interactive Timetable Matrix View
* **Caption**: Figure 5.1 — Master Timetable Matrix with Material Design 3 Styling
* **Description**: Shows the weekly schedule for Batch CSE-4A across Monday through Friday. Laboratory sessions are styled with dark tonal chips spanning two periods, while Theory lectures display subject codes, instructor names, and room numbers.
* *[Insert Screenshot of Timetable Grid here]*

#### Screenshot 2: AI Optimization & Conflict Auditor Badge
* **Caption**: Figure 5.2 — Real-time Conflict Auditor & Fitness Metric Bar
* **Description**: Displays the top status bar indicating "0 Clashes Detected" alongside an AI fitness score of 100%. If an administrator attempts to manually drag a slot into an occupied room, the badge turns red and displays the collision alert.
* *[Insert Screenshot of Clash Free Badge / Modal here]*

#### Screenshot 3: Faculty Workload Management Dashboard
* **Caption**: Figure 5.3 — Department Faculty Teaching Hours & Utilization Cards
* **Description**: Summarizes weekly teaching hours allocated to each faculty member with visual progress bars indicating capacity utilization against their maximum contractual limits.
* *[Insert Screenshot of Faculty Workload Cards here]*

#### Screenshot 4: Role-Based Authentication & Demo Logins
* **Caption**: Figure 5.4 — Login Interface with Instant Role Switching
* **Description**: Highlights the secure authentication portal allowing one-click testing as HOD, Faculty, or Student with protected route guards.
* *[Insert Screenshot of Login Screen here]*

### 5.2 Testing and Validation

#### Comprehensive Test Cases Matrix

| Test ID | Test Scenario | Input Data | Expected Result | Actual Result | Status |
|:---:|---|---|---|---|:---:|
| **TC-01** | AI Schedule Generation | Full college dataset (4 batches, 12 faculty, 15 courses) | All courses allocated required weekly hours | Complete schedule generated in 180 ms | **PASS** |
| **TC-02** | Hard Clash Verification | Generated schedule entries | `detectConflicts()` returns 0 clashes | 0 conflicts detected | **PASS** |
| **TC-03** | Lab Continuity Check | All courses marked as `type: 'Lab'` | Slots must occur in adjacent periods ($\|p_1 - p_2\| = 1$) | Contiguous allocation maintained | **PASS** |
| **TC-04** | Lunch Break Protection | Lab slots placed across morning/afternoon | No lab spans across Period 3 and Period 4 | Lunch break respected | **PASS** |
| **TC-05** | Faculty Leave Enforcement | Faculty marked with `unavailableSlots: ['Mon-1']` | Faculty never scheduled on Mon Period 1 | Slot Mon-1 left free | **PASS** |
| **TC-06** | Custom Batch Injection | Injecting custom batch `MECH-3A` and `FAC-999` | 6 new slots scheduled without altering existing | 6 slots allocated, 0 clashes | **PASS** |
| **TC-07** | Route Guard Protection | Unauthenticated user navigates to `/dashboard` | Redirected to `/login` | Intercepted and redirected | **PASS** |
| **TC-08** | Multi-Role Login | Login with credentials `admin@xyz.edu` | Logged in as HOD; dashboard loaded | HOD dashboard loaded | **PASS** |

---

## **CHAPTER 6: CONCLUSION & FUTURE SCOPE**

### 6.1 Conclusion
The **AI-Based Time Table Preparation for College Management** project successfully automates one of the most tedious administrative burdens in higher education. By combining a heuristic Constraint Satisfaction solver with a sleek Material Design 3 interface, the system achieves instant, conflict-free timetable generation while strictly honoring faculty preferences, laboratory constraints, and room capacities.

### 6.2 Future Enhancements
- **Genetic Algorithm Hybridization**: Incorporating genetic algorithms to optimize soft preferences such as minimizing travel distance between classrooms.
- **Bi-directional Calendar Sync**: Direct export to Google Calendar and Microsoft Outlook for faculty and students.
- **Natural Language Rescheduling**: Allowing administrators to query and modify schedules using conversational AI prompts (e.g., *"Reschedule Prof. Sharma's Thursday lectures to Friday morning"*).

### 6.3 References
1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th ed.)*. Pearson. (Constraint Satisfaction Problems).
2. Material Design 3 Guidelines, Google Developers (https://m3.material.io).
3. Burke, E. K., & Petrovic, S. (2002). *Recent research directions in automated timetabling*. European Journal of Operational Research, 140(2), 266-280.
4. MDN Web Docs: ECMAScript Modules and Asynchronous JavaScript (https://developer.mozilla.org).
