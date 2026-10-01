// Reactive State Management & Storage for College Timetable App
import { defaultCollegeData } from './sample-data.js';

const STORAGE_KEY_DATA = 'aac_college_master_data_v2';
const STORAGE_KEY_SCHEDULE = 'aac_college_timetable_v2';
const STORAGE_KEY_THEME = 'aac_college_theme_v1';
const STORAGE_KEY_USER = 'aac_auth_user_v1';
const STORAGE_KEY_USERS = 'aac_auth_users_v1';

const safeStorage = {
  getItem(key) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (_) {}
    return null;
  },
  setItem(key, val) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch (_) {}
  },
  removeItem(key) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch (_) {}
  }
};

const DEFAULT_DEMO_USERS = [
  {
    id: 'USR-101',
    name: 'Dr. Aris Thorne',
    email: 'admin@xyz.edu',
    password: 'admin',
    role: 'HOD & Professor',
    department: 'Computer Science & Engineering'
  },
  {
    id: 'USR-102',
    name: 'Dr. Priya Sharma',
    email: 'priya@xyz.edu',
    password: 'priya',
    role: 'Associate Professor',
    department: 'Computer Science & Engineering'
  },
  {
    id: 'USR-103',
    name: 'Academic Affairs Dean',
    email: 'dean@xyz.edu',
    password: 'dean',
    role: 'Academic Dean',
    department: 'Office of Academic Affairs'
  }
];

class AppState {
  constructor() {
    this.data = this.loadData();
    this.schedule = this.loadSchedule();
    this.theme = safeStorage.getItem(STORAGE_KEY_THEME) || 'light';
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.currentPage = this.currentUser ? 'dashboard' : 'home'; // 'home' | 'about' | 'register' | 'login' | 'dashboard'
    this.activeTab = 'timetable'; // 'timetable' | 'assignments' | 'fullscreen' | 'ai' | 'data' | 'conflicts'
    this.dataManagementTab = 'classes'; // 'classes' | 'faculty' | 'courses' | 'rooms'
    this.viewMode = 'class'; // 'class' | 'faculty' | 'room'
    this.selectedFilterId = this.data.classes[0]?.id || '';
    this.selectedDayFilter = 'ALL'; // 'ALL' | 'Monday' | 'Tuesday' | ...
    this.selectedCourseFilter = 'ALL'; // 'ALL' | courseCode
    this.previewSelectedDay = 'Monday';
    this.previewSelectedCourse = 'ALL';
    this.selectedSwapSlot = null;
    this.conflicts = [];
    this.listeners = [];
  }

  loadUsers() {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved users', e);
    }
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_DEMO_USERS));
    return [...DEFAULT_DEMO_USERS];
  }

  loadCurrentUser() {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved auth user', e);
    }
    return null;
  }

  setCurrentPage(page) {
    if (page === 'dashboard' && !this.currentUser) {
      this.currentPage = 'login';
      this.notify('PAGE_CHANGED', 'login');
      return false;
    }
    this.currentPage = page;
    this.notify('PAGE_CHANGED', page);
    return true;
  }

  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = this.users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      return { success: false, message: 'Invalid email or password. Use demo quick-login or register.' };
    }
    this.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    this.currentPage = 'dashboard';
    this.notify('AUTH_STATE_CHANGED', this.currentUser);
    this.notify('PAGE_CHANGED', 'dashboard');
    return { success: true, user: this.currentUser };
  }

  register({ name, email, role, department, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }
    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: cleanEmail,
      role: role || 'Faculty Member',
      department: department || 'Engineering',
      password: password
    };
    this.users.push(newUser);
    safeStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
    this.currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department
    };
    safeStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    this.currentPage = 'dashboard';
    this.notify('AUTH_STATE_CHANGED', this.currentUser);
    this.notify('PAGE_CHANGED', 'dashboard');
    return { success: true, user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    safeStorage.removeItem(STORAGE_KEY_USER);
    this.currentPage = 'home';
    this.notify('AUTH_STATE_CHANGED', null);
    this.notify('PAGE_CHANGED', 'home');
  }

  setDayFilter(day) {
    this.selectedDayFilter = day;
    this.notify('FILTER_CHANGED');
  }

  setCourseFilter(courseCode) {
    this.selectedCourseFilter = courseCode;
    this.notify('FILTER_CHANGED');
  }

  setPreviewDay(day) {
    this.previewSelectedDay = day;
    this.notify('PREVIEW_DAY_CHANGED');
  }

  setPreviewCourse(courseCode) {
    this.previewSelectedCourse = courseCode;
    this.notify('PREVIEW_COURSE_CHANGED');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      listener(event, payload, this);
    }
  }

  loadData() {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_DATA) || safeStorage.getItem('aac_college_master_data_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.institution) {
          parsed.institution.name = defaultCollegeData.institution.name;
          parsed.institution.shortName = defaultCollegeData.institution.shortName;
        }
        // Ensure courses have roomId if missing in older cache
        if (parsed.courses && Array.isArray(parsed.courses)) {
          parsed.courses.forEach(c => {
            if (!c.roomId) {
              const defaultMatch = defaultCollegeData.courses.find(dc => dc.id === c.id || dc.code === c.code);
              c.roomId = defaultMatch ? defaultMatch.roomId : (c.labRoomId || 'LH-101');
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved data, using default', e);
    }
    return JSON.parse(JSON.stringify(defaultCollegeData));
  }

  saveData() {
    safeStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(this.data));
    this.notify('DATA_UPDATED');
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(defaultCollegeData));
    this.schedule = [];
    this.selectedFilterId = this.data.classes[0]?.id || '';
    this.saveData();
    this.saveSchedule();
    this.notify('DATA_RESET');
  }

  loadSchedule() {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved schedule', e);
    }
    return [];
  }

  setSchedule(schedule, conflicts = []) {
    this.schedule = schedule;
    this.conflicts = conflicts;
    this.saveSchedule();
    this.notify('SCHEDULE_UPDATED');
  }

  saveSchedule() {
    safeStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(this.schedule));
  }

  setTheme(theme) {
    this.theme = theme;
    safeStorage.setItem(STORAGE_KEY_THEME, theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    this.notify('THEME_CHANGED', theme);
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  setViewMode(mode, filterId = null) {
    this.viewMode = mode;
    if (filterId) {
      this.selectedFilterId = filterId;
    } else {
      if (mode === 'class') this.selectedFilterId = this.data.classes[0]?.id || '';
      if (mode === 'faculty') this.selectedFilterId = this.data.faculty[0]?.id || '';
      if (mode === 'room') this.selectedFilterId = this.data.rooms[0]?.id || '';
    }
    this.notify('VIEW_CHANGED');
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    this.notify('NAV_CHANGED', tab);
  }

  setDataManagementTab(tab) {
    this.dataManagementTab = tab;
    this.notify('DATA_TAB_CHANGED', tab);
  }

  selectSwapSlot(slot) {
    if (!this.selectedSwapSlot) {
      this.selectedSwapSlot = slot;
      this.notify('SLOT_SELECTED', slot);
    } else if (this.selectedSwapSlot.id === slot.id) {
      this.selectedSwapSlot = null;
      this.notify('SLOT_DESELECTED');
    } else {
      // Swap day & period between selectedSwapSlot and target slot
      const s1 = this.schedule.find(s => s.id === this.selectedSwapSlot.id);
      const s2 = this.schedule.find(s => s.id === slot.id);

      if (s1 && s2) {
        const tempDay = s1.day;
        const tempPeriod = s1.period;
        s1.day = s2.day;
        s1.period = s2.period;
        s2.day = tempDay;
        s2.period = tempPeriod;

        this.selectedSwapSlot = null;
        this.saveSchedule();
        this.notify('SLOT_SWAPPED', { s1, s2 });
      }
    }
  }

  moveSlotToEmpty(slotId, targetDay, targetPeriod) {
    const s = this.schedule.find(item => item.id === slotId);
    if (s) {
      s.day = targetDay;
      s.period = targetPeriod;
      this.selectedSwapSlot = null;
      this.saveSchedule();
      this.notify('SLOT_MOVED', s);
    }
  }

  addCourseAssignment(course) {
    this.data.courses.push(course);
    this.saveData();
    this.notify('COURSES_UPDATED');
  }

  removeCourseAssignment(courseId) {
    this.data.courses = this.data.courses.filter(c => c.id !== courseId);
    this.saveData();
    this.notify('COURSES_UPDATED');
  }

  addNewBatch(batch) {
    if (!this.data.classes.some(c => c.id === batch.id)) {
      this.data.classes.push(batch);
      this.saveData();
      this.notify('BATCHES_UPDATED');
    }
  }

  addNewFaculty(faculty) {
    if (!this.data.faculty.some(f => f.id === faculty.id)) {
      this.data.faculty.push(faculty);
      this.saveData();
      this.notify('FACULTY_UPDATED');
    }
  }

  addNewRoom(room) {
    if (!this.data.rooms.some(r => r.id === room.id)) {
      this.data.rooms.push(room);
      this.saveData();
      this.notify('ROOMS_UPDATED');
    }
  }

  removeRoom(roomId) {
    this.data.rooms = this.data.rooms.filter(r => r.id !== roomId);
    this.saveData();
    this.notify('ROOMS_UPDATED');
  }

  updateSlotRoom(slotId, newRoomId) {
    const slot = this.schedule.find(s => s.id === slotId);
    if (slot) {
      slot.roomId = newRoomId;
      this.saveSchedule();
      this.notify('SCHEDULE_UPDATED');
    }
  }

  // Export State as JSON
  exportJSON() {
    const exportBlob = new Blob([
      JSON.stringify({ data: this.data, schedule: this.schedule, version: '1.0' }, null, 2)
    ], { type: 'application/json' });
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `college_timetable_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export Schedule as CSV for College Administration
  exportCSV() {
    if (!this.schedule || this.schedule.length === 0) return false;

    const headers = ['Day', 'Period', 'Class Section', 'Course Code', 'Course Title', 'Type', 'Faculty', 'Room'];
    const rows = this.schedule.map(s => {
      const fObj = this.data.faculty.find(f => f.id === s.facultyId);
      return [
        `"${s.day}"`,
        `"${s.period}"`,
        `"${s.classId}"`,
        `"${s.courseCode}"`,
        `"${s.courseTitle.replace(/"/g, '""')}"`,
        `"${s.type}"`,
        `"${fObj ? fObj.name : s.facultyId}"`,
        `"${s.roomId}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_timetable_${this.selectedFilterId || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}

export const appState = new AppState();
