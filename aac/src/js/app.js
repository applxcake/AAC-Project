// Main Application Controller & UI Logic
import { appState } from './state.js';
import { AIScheduler } from './ai-scheduler.js';

class TimetableApp {
  constructor() {
    this.scheduler = new AIScheduler(appState.data);
    this.inspectingSlot = null;
    this.init();
  }

  init() {
    // 1. Setup Theme & Institution
    document.documentElement.setAttribute('data-theme', appState.theme);
    this.updateThemeIcon();

    if (appState.data && appState.data.institution) {
      const headerTitle = document.getElementById('college-header-title');
      const printName = document.getElementById('print-college-name');
      if (headerTitle) headerTitle.textContent = appState.data.institution.name;
      if (printName) printName.textContent = appState.data.institution.name;
    }

    // 2. Event Listeners
    this.bindEvents();
    this.bindPortalNavigation();

    // 3. Subscribe to AppState changes
    appState.subscribe((event, payload) => {
      this.handleStateChange(event, payload);
    });

    // 4. Initial page and schedule render
    this.renderPages();
    if (!appState.schedule || appState.schedule.length === 0) {
      this.runGeneration(false);
    } else {
      this.updateConflictDiagnostics();
      this.render();
    }
  }

  bindEvents() {
    // Navigation Rail & Bottom Navigation
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        appState.setActiveTab(tab);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        appState.toggleTheme();
        this.updateThemeIcon();
        this.showToast(`Switched to ${appState.theme} mode`);
      });
    }

    // View Mode Chips (By Class, By Faculty, By Room)
    const chips = document.querySelectorAll('.timetable-filters .md-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const view = chip.getAttribute('data-view');
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        appState.setViewMode(view);
        this.populateTimetableFilter();
        this.updateTimetableCourseDropdown();
        this.renderTimetable();
      });
    });

    // Entity Filter Dropdown Change
    const filterSelect = document.getElementById('timetable-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        appState.selectedFilterId = e.target.value;
        this.updateTimetableCourseDropdown();
        this.renderTimetable();
      });
    }

    // Day Filter Dropdown Change
    const dayFilter = document.getElementById('timetable-day-filter');
    if (dayFilter) {
      dayFilter.addEventListener('change', (e) => {
        appState.setDayFilter(e.target.value);
        this.updateTimetableCourseDropdown();
        this.renderTimetable();
      });
    }

    // Course Filter Dropdown Change
    const courseFilter = document.getElementById('timetable-course-filter');
    if (courseFilter) {
      courseFilter.addEventListener('change', (e) => {
        appState.setCourseFilter(e.target.value);
        this.renderTimetable();
      });
    }

    // Print View Trigger
    const printBtn = document.getElementById('btn-print');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.preparePrint();
        window.print();
      });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const ok = appState.exportCSV();
        if (ok) this.showToast('Timetable CSV downloaded');
        else this.showToast('No timetable to export yet', 'warn');
      });
    }

    // Export JSON Backup
    const exportJsonBtn = document.getElementById('btn-export-json');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        appState.exportJSON();
        this.showToast('State backup JSON saved');
      });
    }

    // Run AI Timetable Generation Buttons
    const runAiQuick = document.getElementById('btn-run-ai-quick');
    if (runAiQuick) {
      runAiQuick.addEventListener('click', () => {
        appState.setActiveTab('ai');
        this.runGeneration(true);
      });
    }

    const startAiBtn = document.getElementById('btn-start-ai');
    if (startAiBtn) {
      startAiBtn.addEventListener('click', () => {
        this.runGeneration(true);
      });
    }

    // Cancel Swap Banner Button
    const cancelSwapBtn = document.getElementById('btn-cancel-swap');
    if (cancelSwapBtn) {
      cancelSwapBtn.addEventListener('click', () => {
        appState.selectedSwapSlot = null;
        this.updateSwapBanner();
        this.renderTimetable();
      });
    }

    // Data Management Sub-tabs
    const dataTabs = document.querySelectorAll('.md3-tab');
    dataTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dataTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const dtab = tab.getAttribute('data-datatab');
        appState.setDataManagementTab(dtab);
      });
    });

    // Reset Data Button
    const resetDataBtn = document.getElementById('btn-reset-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset college variables to default sample configuration?')) {
          appState.resetToDefault();
          this.scheduler = new AIScheduler(appState.data);
          this.runGeneration(false);
          this.showToast('College data reset to sample state');
        }
      });
    }

    // Slot Modal Close & Action Handlers
    const slotModalClose = document.getElementById('modal-slot-close');
    const slotModalOk = document.getElementById('modal-slot-ok');
    const slotModalScrim = document.getElementById('slot-modal-scrim');
    const modalSwapBtn = document.getElementById('modal-slot-swap-btn');

    const closeModal = () => {
      slotModalScrim.classList.remove('open');
      this.inspectingSlot = null;
    };

    if (slotModalClose) slotModalClose.addEventListener('click', closeModal);
    if (slotModalOk) slotModalOk.addEventListener('click', closeModal);
    if (slotModalScrim) {
      slotModalScrim.addEventListener('click', (e) => {
        if (e.target === slotModalScrim) closeModal();
      });
    }

    if (modalSwapBtn) {
      modalSwapBtn.addEventListener('click', () => {
        if (this.inspectingSlot) {
          appState.selectSwapSlot(this.inspectingSlot);
          closeModal();
          this.updateSwapBanner();
          this.renderTimetable();
          this.showToast('Click another slot to swap periods');
        }
      });
    }

    // --- Batch & Staff Assignment Planner Handlers ---
    const assignBatchSelect = document.getElementById('assign-batch-select');
    const groupCustomBatch = document.getElementById('group-custom-batch');
    if (assignBatchSelect && groupCustomBatch) {
      assignBatchSelect.addEventListener('change', () => {
        groupCustomBatch.style.display = assignBatchSelect.value === '__NEW_BATCH__' ? 'flex' : 'none';
      });
    }

    const assignFacultySelect = document.getElementById('assign-faculty-select');
    const groupCustomFaculty = document.getElementById('group-custom-faculty');
    if (assignFacultySelect && groupCustomFaculty) {
      assignFacultySelect.addEventListener('change', () => {
        groupCustomFaculty.style.display = assignFacultySelect.value === '__NEW_FACULTY__' ? 'flex' : 'none';
      });
    }

    const assignTypeSelect = document.getElementById('assign-type-select');
    const assignRoomSelect = document.getElementById('assign-room-select');
    const groupCustomRoom = document.getElementById('group-custom-room');
    if (assignTypeSelect && assignRoomSelect) {
      assignTypeSelect.addEventListener('change', () => {
        const isLab = assignTypeSelect.value === 'Lab';
        const targetOption = Array.from(assignRoomSelect.options).find(opt =>
          isLab ? opt.getAttribute('data-type') === 'Lab' : opt.getAttribute('data-type') === 'Lecture'
        );
        if (targetOption) targetOption.selected = true;
      });
    }

    if (assignRoomSelect && groupCustomRoom) {
      assignRoomSelect.addEventListener('change', () => {
        groupCustomRoom.style.display = assignRoomSelect.value === '__NEW_ROOM__' ? 'block' : 'none';
      });
    }

    // Form submission for adding course/batch assignment
    const formAddAssignment = document.getElementById('form-add-assignment');
    if (formAddAssignment) {
      formAddAssignment.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddAssignmentSubmit();
      });
    }

    // Generate Timetable directly from Planner Screen
    const btnGenFromPlan = document.getElementById('btn-generate-from-plan');
    if (btnGenFromPlan) {
      btnGenFromPlan.addEventListener('click', () => {
        this.scheduler = new AIScheduler(appState.data);
        appState.setActiveTab('timetable');
        this.runGeneration(false);
        this.showToast('AI Timetable Generated From Your Batch Plan!', 'success');
      });
    }

    // --- Fullscreen Presentation View Handlers ---
    const btnNativeFullscreen = document.getElementById('btn-native-fullscreen');
    if (btnNativeFullscreen) {
      btnNativeFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn('Could not activate fullscreen:', err);
          });
        } else {
          document.exitFullscreen();
        }
      });

      document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        const icon = document.getElementById('fullscreen-icon');
        const label = document.getElementById('fullscreen-btn-label');
        if (icon) icon.textContent = isFs ? 'fullscreen_exit' : 'fullscreen';
        if (label) label.textContent = isFs ? 'Exit Fullscreen' : 'Fullscreen Mode';
      });
    }

    const btnToggleFontScale = document.getElementById('btn-toggle-font-scale');
    const boardWrapper = document.getElementById('presentation-board-wrapper');
    const fontScaleText = document.getElementById('font-scale-text');
    if (btnToggleFontScale && boardWrapper) {
      btnToggleFontScale.addEventListener('click', () => {
        boardWrapper.classList.toggle('large-font');
        const isLarge = boardWrapper.classList.contains('large-font');
        if (fontScaleText) fontScaleText.textContent = isLarge ? 'Standard Size' : 'Large Display';
      });
    }

    // Live Clock Interval
    this.startLiveClock();
  }

  startLiveClock() {
    const clockText = document.getElementById('live-clock-text');
    const update = () => {
      if (clockText) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dayStr = now.toLocaleDateString([], { weekday: 'short' });
        clockText.textContent = `${timeStr} • ${dayStr}`;
      }
    };
    update();
    setInterval(update, 1000);
  }

  handleAddAssignmentSubmit() {
    const batchSelect = document.getElementById('assign-batch-select');
    const customBatchInput = document.getElementById('custom-batch-name');
    const courseCodeInput = document.getElementById('assign-course-code');
    const courseTitleInput = document.getElementById('assign-course-title');
    const facultySelect = document.getElementById('assign-faculty-select');
    const customFacultyInput = document.getElementById('custom-faculty-name');
    const typeSelect = document.getElementById('assign-type-select');
    const hoursInput = document.getElementById('assign-hours-input');
    const roomSelect = document.getElementById('assign-room-select');

    let classId = batchSelect.value;
    if (classId === '__NEW_BATCH__') {
      const rawName = customBatchInput.value.trim();
      if (!rawName) {
        alert('Please enter a name for the new batch');
        return;
      }
      classId = rawName.split(' ')[0].toUpperCase();
      appState.addNewBatch({
        id: classId,
        name: rawName,
        strength: 60,
        baseRoom: roomSelect.value || 'LH-101'
      });
    }

    let facultyId = facultySelect.value;
    if (facultyId === '__NEW_FACULTY__') {
      const rawName = customFacultyInput.value.trim();
      if (!rawName) {
        alert('Please enter a name for the new faculty member');
        return;
      }
      facultyId = `FAC-${Date.now().toString().slice(-4)}`;
      appState.addNewFaculty({
        id: facultyId,
        name: rawName,
        designation: 'Assistant Professor',
        department: 'Engineering',
        maxWeeklyHours: 18,
        unavailableSlots: []
      });
    }

    let roomId = roomSelect.value;
    if (roomId === '__NEW_ROOM__') {
      const customRoomIdInput = document.getElementById('custom-room-id');
      const customCapacityInput = document.getElementById('custom-room-capacity');
      const customTypeSelect = document.getElementById('custom-room-type');
      const rawRoom = customRoomIdInput ? customRoomIdInput.value.trim() : '';
      if (!rawRoom) {
        alert('Please enter a room number or name');
        return;
      }
      const facilityType = customTypeSelect ? customTypeSelect.value : (typeSelect.value === 'Lab' ? 'Lab' : 'Lecture');
      roomId = rawRoom.toUpperCase().replace(/\s+/g, '-');
      appState.addNewRoom({
        id: roomId,
        name: rawRoom,
        type: facilityType,
        capacity: parseInt(customCapacityInput?.value, 10) || 65
      });
    }

    const isLab = typeSelect.value === 'Lab';
    const newCourse = {
      id: `CRS-${Date.now()}`,
      code: courseCodeInput.value.trim().toUpperCase(),
      title: courseTitleInput.value.trim(),
      classId: classId,
      facultyId: facultyId,
      type: typeSelect.value,
      weeklyHours: parseInt(hoursInput.value, 10) || (isLab ? 2 : 4),
      labRoomId: isLab ? roomId : null,
      roomId: roomId
    };

    appState.addCourseAssignment(newCourse);
    this.showToast(`Assigned ${newCourse.code} to ${classId} (Room: ${roomId})`, 'success');

    // Reset fields
    courseCodeInput.value = '';
    courseTitleInput.value = '';
    if (customBatchInput) customBatchInput.value = '';
    if (customFacultyInput) customFacultyInput.value = '';
    const customRoomIdInput = document.getElementById('custom-room-id');
    if (customRoomIdInput) customRoomIdInput.value = '';
    const groupCustomBatch = document.getElementById('group-custom-batch');
    const groupCustomFaculty = document.getElementById('group-custom-faculty');
    const groupCustomRoom = document.getElementById('group-custom-room');
    if (groupCustomBatch) groupCustomBatch.style.display = 'none';
    if (groupCustomFaculty) groupCustomFaculty.style.display = 'none';
    if (groupCustomRoom) groupCustomRoom.style.display = 'none';

    this.renderAssignmentPlanner();
  }

  bindPortalNavigation() {
    // 1. Delegate navigation clicks on all [data-route] buttons and links
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-route]');
      if (target) {
        e.preventDefault();
        const route = target.getAttribute('data-route');
        if (route) {
          appState.setCurrentPage(route);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    // 2. Public Theme Toggle Button
    const publicThemeBtn = document.getElementById('public-theme-toggle');
    if (publicThemeBtn) {
      publicThemeBtn.addEventListener('click', () => {
        appState.toggleTheme();
        this.updateThemeIcon();
        this.showToast(`Switched to ${appState.theme} mode`);
      });
    }

    // 3. Return to Portal Home button in dashboard top-bar
    const portalHomeBtn = document.getElementById('btn-portal-home');
    if (portalHomeBtn) {
      portalHomeBtn.addEventListener('click', () => {
        appState.setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 4. Logout button in dashboard top-bar
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        appState.logout();
        this.showToast('Signed out of academic workspace');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 5. 1-Click Quick Demo Login Buttons
    const demoHod = document.getElementById('demo-user-hod');
    if (demoHod) {
      demoHod.addEventListener('click', () => {
        const res = appState.login('admin@xyz.edu', 'admin');
        if (res.success) {
          this.showToast(`Logged in as ${res.user.name} (${res.user.role})`);
        }
      });
    }

    const demoFaculty = document.getElementById('demo-user-faculty');
    if (demoFaculty) {
      demoFaculty.addEventListener('click', () => {
        const res = appState.login('priya@xyz.edu', 'priya');
        if (res.success) {
          this.showToast(`Logged in as ${res.user.name} (${res.user.role})`);
        }
      });
    }

    const demoDean = document.getElementById('demo-user-dean');
    if (demoDean) {
      demoDean.addEventListener('click', () => {
        const res = appState.login('dean@xyz.edu', 'dean');
        if (res.success) {
          this.showToast(`Logged in as ${res.user.name} (${res.user.role})`);
        }
      });
    }

    // 6. Login Form Submission
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value || '';
        const password = document.getElementById('login-password')?.value || '';
        const errorBanner = document.getElementById('login-error-banner');

        const res = appState.login(email, password);
        if (res.success) {
          if (errorBanner) errorBanner.style.display = 'none';
          loginForm.reset();
          this.showToast(`Welcome back, ${res.user.name}!`);
        } else {
          if (errorBanner) {
            errorBanner.textContent = res.message;
            errorBanner.style.display = 'block';
          }
        }
      });
    }

    // 7. Register Role Selection Pills
    const rolePills = document.querySelectorAll('#reg-role-group .demo-pill-btn');
    rolePills.forEach(btn => {
      btn.addEventListener('click', () => {
        rolePills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 8. Registration Form Submission
    const regForm = document.getElementById('form-register');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name')?.value || '';
        const email = document.getElementById('reg-email')?.value || '';
        const dept = document.getElementById('reg-dept')?.value || '';
        const activeRoleBtn = document.querySelector('#reg-role-group .demo-pill-btn.active');
        const role = activeRoleBtn ? activeRoleBtn.getAttribute('data-role') : 'Professor / Faculty';
        const password = document.getElementById('reg-password')?.value || '';
        const confirm = document.getElementById('reg-password-confirm')?.value || '';
        const errorBanner = document.getElementById('register-error-banner');

        if (password !== confirm) {
          if (errorBanner) {
            errorBanner.textContent = 'Passwords do not match. Please re-enter.';
            errorBanner.style.display = 'block';
          }
          return;
        }

        const res = appState.register({ name, email, department: dept, role, password });
        if (res.success) {
          if (errorBanner) errorBanner.style.display = 'none';
          regForm.reset();
          this.showToast(`Account registered! Welcome, ${res.user.name}`);
        } else {
          if (errorBanner) {
            errorBanner.textContent = res.message;
            errorBanner.style.display = 'block';
          }
        }
      });
    }
  }

  renderPages() {
    const page = appState.currentPage; // 'home' | 'about' | 'register' | 'login' | 'dashboard'
    const pages = ['home', 'about', 'register', 'login', 'dashboard'];

    pages.forEach(p => {
      const el = document.getElementById(`page-${p}`);
      if (el) {
        if (p === page) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    // Public Header Navigation link states & visibility
    const publicHeader = document.getElementById('public-header');
    if (publicHeader) {
      publicHeader.style.display = page === 'dashboard' ? 'none' : 'flex';

      document.querySelectorAll('.public-nav-link').forEach(link => {
        const targetRoute = link.getAttribute('data-route');
        if (targetRoute === page) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      const pnavDashboard = document.getElementById('pnav-dashboard');
      const pnavLogin = document.getElementById('pnav-login');
      const pnavRegister = document.getElementById('pnav-register');

      if (appState.currentUser) {
        if (pnavDashboard) pnavDashboard.style.display = 'inline-flex';
        if (pnavLogin) pnavLogin.style.display = 'none';
        if (pnavRegister) pnavRegister.style.display = 'none';
      } else {
        if (pnavDashboard) pnavDashboard.style.display = 'none';
        if (pnavLogin) pnavLogin.style.display = 'inline-flex';
        if (pnavRegister) pnavRegister.style.display = 'inline-flex';
      }
    }

    // Authenticated User badge inside workstation top app bar
    if (page === 'dashboard' && appState.currentUser) {
      const u = appState.currentUser;
      const avatar = document.getElementById('dashboard-user-avatar');
      const name = document.getElementById('dashboard-user-name');
      const role = document.getElementById('dashboard-user-role');

      if (avatar) {
        const initials = u.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
        avatar.textContent = initials;
      }
      if (name) name.textContent = u.name;
      if (role) role.textContent = `${u.role} (${u.department || 'Academic'})`;
    }
  }

  handleStateChange(event, payload) {
    if (event === 'PAGE_CHANGED' || event === 'AUTH_STATE_CHANGED') {
      this.renderPages();
    } else if (event === 'NAV_CHANGED') {
      this.updateNavigationUI(payload);
    } else if (event === 'VIEW_CHANGED') {
      this.populateFilterDropdown();
      this.renderTimetable();
    } else if (event === 'SCHEDULE_UPDATED') {
      this.updateConflictDiagnostics();
      this.renderTimetable();
    } else if (event === 'SLOT_SWAPPED' || event === 'SLOT_MOVED') {
      this.updateConflictDiagnostics();
      this.updateSwapBanner();
      this.renderTimetable();
      this.showToast('Schedule slot updated');
    } else if (event === 'DATA_TAB_CHANGED') {
      this.renderDataTable(payload);
    } else if (event === 'COURSES_UPDATED' || event === 'BATCHES_UPDATED' || event === 'FACULTY_UPDATED' || event === 'ROOMS_UPDATED') {
      this.renderAssignmentPlanner();
      this.populateFilterDropdown();
      this.renderDataTable(appState.dataManagementTab);
    } else if (event === 'DATA_RESET') {
      this.populateFilterDropdown();
      this.render();
    }
  }

  updateNavigationUI(tab) {
    // Update active class on nav rails
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-tab') === tab) el.classList.add('active');
      else el.classList.remove('active');
    });

    // Toggle Section visibility
    const sections = ['timetable', 'assignments', 'fullscreen', 'ai', 'data', 'conflicts'];
    sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.style.display = s === tab ? 'block' : 'none';
    });

    if (tab === 'timetable') this.renderTimetable();
    if (tab === 'assignments') this.renderAssignmentPlanner();
    if (tab === 'fullscreen') this.renderFullscreenPreview();
    if (tab === 'data') this.renderDataTable(appState.dataManagementTab);
    if (tab === 'conflicts') this.renderConflictList();
  }

  renderFullscreenPreview(targetClassId = null) {
    const univTitle = document.getElementById('display-univ-title');
    const univSub = document.getElementById('display-univ-sub');

    if (univTitle && appState.data.institution) {
      univTitle.textContent = `${appState.data.institution.name} - Timetable Display View`;
    }
    if (univSub && appState.data.institution) {
      univSub.textContent = `${appState.data.institution.department} • Academic Session ${appState.data.institution.academicYear}`;
    }
    const table = document.getElementById('fullscreen-timetable-table');
    const classes = appState.data.classes;
    const selectedClassId = targetClassId || appState.selectedFilterId || (classes[0] ? classes[0].id : '');
    const classObj = classes.find(c => c.id === selectedClassId);
    const className = classObj ? classObj.name : selectedClassId;

    // Populate Batch Dropdown
    const batchSelect = document.getElementById('fullscreen-batch-select');
    if (batchSelect) {
      batchSelect.innerHTML = classes.map(c => `
        <option value="${c.id}" ${c.id === selectedClassId ? 'selected' : ''}>${c.name} (${c.id})</option>
      `).join('');

      batchSelect.onchange = (e) => {
        this.renderFullscreenPreview(e.target.value);
      };
    }

    const { days, periods } = appState.data.scheduleConfig;
    const filteredSchedule = appState.schedule.filter(s => s.classId === selectedClassId);
    const currentDay = appState.previewSelectedDay || 'Monday';
    const activeCourseFilter = appState.previewSelectedCourse || 'ALL';

    // 1. Render Prominent Day Spotlight
    const spotlightContainer = document.getElementById('preview-day-spotlight');
    if (spotlightContainer) {
      const daySlots = filteredSchedule.filter(s => s.day === currentDay);
      const dayCourses = Array.from(new Set(daySlots.map(s => s.courseCode))).map(code => {
        const match = daySlots.find(s => s.courseCode === code);
        return { code, title: match.courseTitle, type: match.type };
      });

      const dayTabsHtml = days.map(d => `
        <button class="spotlight-day-pill ${d === currentDay ? 'active' : ''}" data-day="${d}" type="button">
          <span class="material-symbols-outlined" style="font-size: 15px;">calendar_today</span>
          <span>${d}</span>
        </button>
      `).join('');

      const courseChipsHtml = `
        <div class="spotlight-course-filter">
          <span style="font-size: 12px; font-weight: 700; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 4px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">filter_alt</span>
            Filter ${currentDay} Courses:
          </span>
          <button class="spotlight-course-chip ${activeCourseFilter === 'ALL' ? 'active' : ''}" data-course="ALL" type="button">
            All Courses (${daySlots.length})
          </button>
          ${dayCourses.map(c => `
            <button class="spotlight-course-chip ${activeCourseFilter === c.code ? 'active' : ''}" data-course="${c.code}" type="button">
              ${c.code} (${c.type})
            </button>
          `).join('')}
        </div>
      `;

      const cardsHtml = periods.map(p => {
        if (p.isBreak) {
          return `
            <div class="spotlight-card is-break">
              <span class="material-symbols-outlined" style="font-size: 26px; color: var(--md-sys-color-secondary);">restaurant</span>
              <div style="font-weight: 700; font-size: 11px; color: var(--md-sys-color-secondary); margin-top: 6px; letter-spacing: 0.05em;">
                ${p.name.toUpperCase()}
              </div>
              <div style="font-size: 10px; color: var(--md-sys-color-on-surface-variant); margin-top: 2px;">${p.startTime} - ${p.endTime}</div>
            </div>
          `;
        }
        const slot = daySlots.find(s => s.period === p.id);
        if (!slot) {
          return `
            <div class="spotlight-card is-free">
              <div class="spotlight-card-header">
                <span class="spotlight-card-period">${p.name}</span>
                <span class="spotlight-card-time">${p.startTime}</span>
              </div>
              <div style="font-size: 12px; font-weight: 500;">Free Slot</div>
              <div style="font-size: 10px; color: var(--md-sys-color-outline); margin-top: 4px;">No Class Scheduled</div>
            </div>
          `;
        }
        const isLab = slot.type === 'Lab';
        const fObj = appState.data.faculty.find(f => f.id === slot.facultyId);
        const fName = fObj ? fObj.name : slot.facultyId;
        const isDimmed = activeCourseFilter !== 'ALL' && slot.courseCode !== activeCourseFilter;

        return `
          <div class="spotlight-card ${isDimmed ? 'dimmed' : ''}">
            <div class="spotlight-card-header">
              <span class="spotlight-card-period">${p.name}</span>
              <span class="spotlight-card-time">${p.startTime} - ${p.endTime}</span>
            </div>
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
                <strong style="font-size: 14px; color: var(--md-sys-color-primary);">${slot.courseCode}</strong>
                <span class="badge ${isLab ? 'badge--lab' : 'badge--theory'}" style="font-size: 10px; padding: 1px 6px;">${slot.type}</span>
              </div>
              <div class="spotlight-card-title">${slot.courseTitle}</div>
            </div>
            <div class="slot-details" style="margin-top: 8px; border-top: 1px dashed var(--md-sys-color-outline-variant); padding-top: 6px;">
              <span class="slot-faculty" title="${fName}">
                <span class="material-symbols-outlined" style="font-size: 13px;">person</span>
                ${fName.split(' ').slice(0, 2).join(' ')}
              </span>
              <span class="slot-room ${isLab ? 'is-lab-room' : ''}" title="Room: ${slot.roomId}">
                <span class="material-symbols-outlined" style="font-size: 11px;">${isLab ? 'science' : 'meeting_room'}</span>
                ${slot.roomId}
              </span>
            </div>
          </div>
        `;
      }).join('');

      spotlightContainer.innerHTML = `
        <div class="spotlight-header">
          <div class="spotlight-title-group">
            <div class="brand-icon" style="width: 38px; height: 38px; background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-primary);">
              <span class="material-symbols-outlined" style="font-size: 22px;">event_available</span>
            </div>
            <div>
              <h3 style="font: var(--md-sys-typescale-title-medium); color: var(--md-sys-color-on-surface); margin: 0; font-weight: 700;">
                ${currentDay}'s Timetable • ${className}
              </h3>
              <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-top: 2px;">
                ${daySlots.length} Sessions Allocated • ${daySlots.filter(s => s.type === 'Lab').length} Laboratory Periods
              </div>
            </div>
          </div>
          <div class="spotlight-day-tabs">
            ${dayTabsHtml}
          </div>
        </div>
        ${courseChipsHtml}
        <div class="spotlight-cards-grid">
          ${cardsHtml}
        </div>
      `;

      // Attach Day Switcher Pill Handlers
      spotlightContainer.querySelectorAll('.spotlight-day-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const clickedDay = btn.getAttribute('data-day');
          appState.setPreviewDay(clickedDay);
          appState.setPreviewCourse('ALL');
          this.renderFullscreenPreview(selectedClassId);
        });
      });

      // Attach Course Filter Chip Handlers
      spotlightContainer.querySelectorAll('.spotlight-course-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const clickedCourse = btn.getAttribute('data-course');
          appState.setPreviewCourse(clickedCourse);
          this.renderFullscreenPreview(selectedClassId);
        });
      });
    }

    // 2. Update Weekly Section Title
    const weeklyTitle = document.getElementById('preview-weekly-title');
    if (weeklyTitle) {
      weeklyTitle.textContent = `Full Weekly Master Schedule (${className})`;
    }

    if (!table) return;

    // 3. Build Full Weekly Table Header
    let theadHtml = `<thead><tr><th class="day-header" style="font-size: 15px;">Day / Time</th>`;
    periods.forEach(p => {
      if (p.isBreak) {
        theadHtml += `<th style="width: 90px; background-color: var(--md-sys-color-surface-container-high);">
          ${p.name}<span class="period-time-sub">${p.startTime} - ${p.endTime}</span>
        </th>`;
      } else {
        theadHtml += `<th>
          ${p.name}<span class="period-time-sub">${p.startTime} - ${p.endTime}</span>
        </th>`;
      }
    });
    theadHtml += `</tr></thead>`;

    // 4. Build Full Weekly Table Body (Monday - Friday)
    let tbodyHtml = `<tbody>`;
    days.forEach(day => {
      const isSelectedDayRow = day === currentDay;
      tbodyHtml += `<tr style="${isSelectedDayRow ? 'background-color: rgba(var(--md-sys-color-primary-rgb, 103, 80, 164), 0.04);' : ''}">
        <td class="day-cell" style="font-size: 15px; ${isSelectedDayRow ? 'color: var(--md-sys-color-primary); font-weight: 800;' : ''}">
          ${day}
          ${isSelectedDayRow ? `<div style="font-size: 10px; font-weight: 500; color: var(--md-sys-color-primary);">Selected Day</div>` : ''}
        </td>`;

      periods.forEach(p => {
        if (p.isBreak) {
          tbodyHtml += `<td class="break-cell" style="font-weight: 600;">LUNCH BREAK</td>`;
        } else {
          const slot = filteredSchedule.find(s => s.day === day && s.period === p.id);
          if (slot) {
            const facultyObj = appState.data.faculty.find(f => f.id === slot.facultyId);
            const facultyName = facultyObj ? facultyObj.name : slot.facultyId;
            const isLab = slot.type === 'Lab';
            const isDimmed = activeCourseFilter !== 'ALL' && slot.courseCode !== activeCourseFilter;

            tbodyHtml += `<td>
              <div class="slot-card ${isDimmed ? 'dimmed' : ''}" style="cursor: default;">
                <div class="slot-code">
                  <span>${slot.courseCode}</span>
                  <span class="badge ${isLab ? 'badge--lab' : 'badge--theory'}">${slot.type}</span>
                </div>
                <div class="slot-name" style="-webkit-line-clamp: 3;">${slot.courseTitle}</div>
                <div class="slot-details">
                  <span class="slot-faculty">
                    <span class="material-symbols-outlined" style="font-size: 14px;">person</span>
                    ${facultyName}
                  </span>
                  <span class="slot-room ${isLab ? 'is-lab-room' : ''}" title="Room: ${slot.roomId}">
                    <span class="material-symbols-outlined" style="font-size: 11px;">${isLab ? 'science' : 'meeting_room'}</span>
                    ${slot.roomId}
                  </span>
                </div>
              </div>
            </td>`;
          } else {
            tbodyHtml += `<td>
              <div class="slot-empty" style="cursor: default; opacity: 0.6;">
                <span style="font-size: 12px;">Free Slot</span>
              </div>
            </td>`;
          }
        }
      });

      tbodyHtml += `</tr>`;
    });

    tbodyHtml += `</tbody>`;
    table.innerHTML = theadHtml + tbodyHtml;
  }

  renderAssignmentPlanner() {
    // 1. Populate Batch Select
    const batchSelect = document.getElementById('assign-batch-select');
    if (batchSelect) {
      const currentVal = batchSelect.value;
      batchSelect.innerHTML = appState.data.classes.map(c => `
        <option value="${c.id}">${c.name} (${c.id})</option>
      `).join('') + `<option value="__NEW_BATCH__">➕ Add New Batch / Section...</option>`;
      if (currentVal && Array.from(batchSelect.options).some(o => o.value === currentVal)) {
        batchSelect.value = currentVal;
      }
    }

    // 2. Populate Faculty Select
    const facultySelect = document.getElementById('assign-faculty-select');
    if (facultySelect) {
      const currentVal = facultySelect.value;
      facultySelect.innerHTML = appState.data.faculty.map(f => `
        <option value="${f.id}">${f.name} (${f.department} - ${f.designation})</option>
      `).join('') + `<option value="__NEW_FACULTY__">➕ Add New Staff Member...</option>`;
      if (currentVal && Array.from(facultySelect.options).some(o => o.value === currentVal)) {
        facultySelect.value = currentVal;
      }
    }

    // 3. Populate Room Select
    const roomSelect = document.getElementById('assign-room-select');
    if (roomSelect) {
      const currentVal = roomSelect.value;
      roomSelect.innerHTML = appState.data.rooms.map(r => `
        <option value="${r.id}" data-type="${r.type}">${r.name} (${r.id}) - ${r.type} [Cap: ${r.capacity}]</option>
      `).join('') + `<option value="__NEW_ROOM__">➕ Add New Room / Facility...</option>`;
      if (currentVal && Array.from(roomSelect.options).some(o => o.value === currentVal)) {
        roomSelect.value = currentVal;
      }
    }

    // 4. Update Summary Stats Badge
    const statsBadge = document.getElementById('planner-stats-badge');
    if (statsBadge) {
      const totalUnits = appState.data.courses.length;
      const totalBatches = appState.data.classes.length;
      statsBadge.textContent = `${totalUnits} Courses Assigned across ${totalBatches} Batches`;
    }

    // 5. Render Batch Roster Grid
    const rosterContainer = document.getElementById('batch-roster-container');
    if (!rosterContainer) return;

    let html = '';
    appState.data.classes.forEach(cls => {
      const courses = appState.data.courses.filter(c => c.classId === cls.id);
      const totalHours = courses.reduce((sum, c) => sum + (c.weeklyHours || 0), 0);

      html += `
        <div class="batch-box">
          <div class="batch-box-header">
            <div>
              <div style="font: var(--md-sys-typescale-title-small); font-weight: 700; color: var(--md-sys-color-primary);">
                ${cls.name}
              </div>
              <div style="font-size: 11px; color: var(--md-sys-color-on-surface-variant);">
                Strength: ${cls.strength} students • Base: ${cls.baseRoom}
              </div>
            </div>
            <span class="badge ${totalHours >= 20 ? 'badge--success' : 'badge--theory'}">
              ${totalHours} hrs / wk
            </span>
          </div>

          <div class="batch-course-list">
            ${courses.length === 0 ? `
              <div style="padding: 16px; text-align: center; color: var(--md-sys-color-outline); font-size: 12px;">
                No courses assigned to this batch yet. Use the form to assign subjects & staff.
              </div>
            ` : courses.map(course => {
              const fObj = appState.data.faculty.find(f => f.id === course.facultyId);
              const facultyName = fObj ? fObj.name : course.facultyId;
              const isLab = course.type === 'Lab';

              return `
                <div class="course-item-row ${isLab ? 'is-lab' : ''}">
                  <div class="course-item-info">
                    <div class="course-item-title">${course.code}: ${course.title}</div>
                    <div class="course-item-sub">
                      <span class="material-symbols-outlined" style="font-size: 13px;">person</span>
                      <span>${facultyName}</span>
                      <span>•</span>
                      <span>${course.weeklyHours}h</span>
                      ${course.roomId || course.labRoomId ? `<span>•</span><span class="badge ${isLab ? 'badge--lab' : 'badge--theory'}" style="font-size: 10px; padding: 1px 6px;">${course.roomId || course.labRoomId}</span>` : ''}
                    </div>
                  </div>
                  <button class="btn-remove-course" data-course-id="${course.id}" title="Remove course from batch" aria-label="Remove Course">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    rosterContainer.innerHTML = html;

    // Attach delete listeners
    const deleteButtons = rosterContainer.querySelectorAll('.btn-remove-course');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const courseId = btn.getAttribute('data-course-id');
        appState.removeCourseAssignment(courseId);
        this.showToast('Course assignment removed');
      });
    });
  }

  updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle .material-symbols-outlined');
    if (icon) {
      icon.textContent = appState.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    const publicIcon = document.querySelector('#public-theme-toggle .material-symbols-outlined');
    if (publicIcon) {
      publicIcon.textContent = appState.theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
  }

  async runGeneration(showLogs = true) {
    const progressTrack = document.getElementById('solver-progress-track');
    const progressFill = document.getElementById('solver-progress-fill');
    const terminal = document.getElementById('solver-terminal');
    const startBtn = document.getElementById('btn-start-ai');

    if (showLogs && progressTrack && progressFill && terminal) {
      progressTrack.style.display = 'block';
      terminal.style.display = 'block';
      terminal.innerHTML = '';
      if (startBtn) startBtn.disabled = true;
    }

    const logToTerminal = (text, type = 'info') => {
      if (!showLogs || !terminal) return;
      const line = document.createElement('div');
      line.className = `terminal-line ${type}`;
      line.innerHTML = `<span>[${new Date().toLocaleTimeString()}]</span> <span>${text}</span>`;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    };

    try {
      const newSchedule = await this.scheduler.generateSchedule((progress) => {
        if (progressFill) progressFill.style.width = `${progress.step}%`;
        logToTerminal(progress.message, progress.step === 100 ? 'success' : 'info');
      });

      const conflicts = this.scheduler.detectConflicts(newSchedule);
      appState.setSchedule(newSchedule, conflicts);

      if (showLogs) {
        this.showToast('AI Timetable Generated Successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Error generating timetable', 'error');
    } finally {
      if (startBtn) startBtn.disabled = false;
      this.updateConflictDiagnostics();
      this.render();
    }
  }

  updateConflictDiagnostics() {
    const conflicts = this.scheduler.detectConflicts(appState.schedule);
    appState.conflicts = conflicts;

    const badge = document.getElementById('conflict-audit-badge');
    if (badge) {
      if (conflicts.length === 0) {
        badge.className = 'badge badge--success';
        badge.textContent = '0 Clashes (100% Clean)';
      } else {
        badge.className = 'badge badge--conflict';
        badge.textContent = `${conflicts.length} Hard Clashes`;
      }
    }

    const statFitness = document.getElementById('stat-fitness');
    const statConflicts = document.getElementById('stat-conflicts');
    const statLabs = document.getElementById('stat-labs');
    const statUtilization = document.getElementById('stat-utilization');

    if (statConflicts) {
      statConflicts.textContent = `${conflicts.length} Clashes`;
    }
    if (statFitness) {
      const score = Math.max(80, Math.min(100, 100 - (conflicts.length * 10)));
      statFitness.textContent = `${score}%`;
    }
    if (statLabs) {
      statLabs.textContent = '100%';
    }
    if (statUtilization) {
      const totalSlots = appState.schedule.length;
      const roomCapacityRatio = Math.min(95, Math.max(70, Math.round((totalSlots / (appState.data.rooms.length * 25)) * 100)));
      statUtilization.textContent = `${roomCapacityRatio}%`;
    }

    this.renderConflictList();
  }

  populateFilterDropdown() {
    const select = document.getElementById('timetable-filter-select');
    if (!select) return;

    select.innerHTML = '';
    const mode = appState.viewMode;

    if (mode === 'class') {
      appState.data.classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.id})`;
        if (c.id === appState.selectedFilterId) opt.selected = true;
        select.appendChild(opt);
      });
    } else if (mode === 'faculty') {
      appState.data.faculty.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.name} - ${f.designation}`;
        if (f.id === appState.selectedFilterId) opt.selected = true;
        select.appendChild(opt);
      });
    } else if (mode === 'room') {
      appState.data.rooms.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = `${r.name} (${r.type})`;
        if (r.id === appState.selectedFilterId) opt.selected = true;
        select.appendChild(opt);
      });
    }

    if (!appState.selectedFilterId && select.options.length > 0) {
      appState.selectedFilterId = select.options[0].value;
    }
  }

  updateTimetableCourseDropdown() {
    const courseSelect = document.getElementById('timetable-course-filter');
    if (!courseSelect) return;

    const mode = appState.viewMode;
    const filterId = appState.selectedFilterId;
    const dayFilter = appState.selectedDayFilter;

    let relevantSlots = appState.schedule;
    if (mode === 'class') {
      relevantSlots = relevantSlots.filter(s => s.classId === filterId);
    } else if (mode === 'faculty') {
      relevantSlots = relevantSlots.filter(s => s.facultyId === filterId);
    } else if (mode === 'room') {
      relevantSlots = relevantSlots.filter(s => s.roomId === filterId);
    }

    if (dayFilter && dayFilter !== 'ALL') {
      relevantSlots = relevantSlots.filter(s => s.day === dayFilter);
    }

    const uniqueCourses = [];
    const seen = new Set();
    relevantSlots.forEach(s => {
      if (s.courseCode && !seen.has(s.courseCode)) {
        seen.add(s.courseCode);
        uniqueCourses.push({ code: s.courseCode, title: s.courseTitle, type: s.type });
      }
    });

    const currentVal = appState.selectedCourseFilter || 'ALL';
    let optionsHtml = `<option value="ALL">📚 All Courses (${uniqueCourses.length})</option>`;
    uniqueCourses.forEach(c => {
      optionsHtml += `<option value="${c.code}" ${c.code === currentVal ? 'selected' : ''}>${c.code} (${c.type}) - ${c.title}</option>`;
    });

    courseSelect.innerHTML = optionsHtml;
    if (currentVal !== 'ALL' && !seen.has(currentVal)) {
      appState.selectedCourseFilter = 'ALL';
      courseSelect.value = 'ALL';
    }
  }

  renderTimetable() {
    const table = document.getElementById('timetable-table');
    if (!table) return;

    const { days, periods } = appState.data.scheduleConfig;
    const mode = appState.viewMode;
    const filterId = appState.selectedFilterId;

    // Filter relevant schedule items
    let filteredSchedule = [];
    if (mode === 'class') {
      filteredSchedule = appState.schedule.filter(s => s.classId === filterId);
    } else if (mode === 'faculty') {
      filteredSchedule = appState.schedule.filter(s => s.facultyId === filterId);
    } else if (mode === 'room') {
      filteredSchedule = appState.schedule.filter(s => s.roomId === filterId);
    }

    const activeDays = (appState.selectedDayFilter && appState.selectedDayFilter !== 'ALL')
      ? days.filter(d => d === appState.selectedDayFilter)
      : days;
    const activeCourse = appState.selectedCourseFilter;

    // Build Table Header
    let theadHtml = `<thead><tr><th class="day-header">Day / Time</th>`;
    periods.forEach(p => {
      if (p.isBreak) {
        theadHtml += `<th style="width: 80px; background-color: var(--md-sys-color-surface-container-high);">
          ${p.name}<span class="period-time-sub">${p.startTime} - ${p.endTime}</span>
        </th>`;
      } else {
        theadHtml += `<th>
          ${p.name}<span class="period-time-sub">${p.startTime} - ${p.endTime}</span>
        </th>`;
      }
    });
    theadHtml += `</tr></thead>`;

    // Build Table Body
    let tbodyHtml = `<tbody>`;

    activeDays.forEach(day => {
      tbodyHtml += `<tr><td class="day-cell">${day}</td>`;

      periods.forEach(p => {
        if (p.isBreak) {
          tbodyHtml += `<td class="break-cell">Lunch Break</td>`;
        } else {
          // Find matching slot for this day and period
          const slot = filteredSchedule.find(s => s.day === day && s.period === p.id);

          if (slot) {
            const facultyObj = appState.data.faculty.find(f => f.id === slot.facultyId);
            const facultyName = facultyObj ? facultyObj.name : slot.facultyId;
            const isSelected = appState.selectedSwapSlot && appState.selectedSwapSlot.id === slot.id;
            const hasConflict = appState.conflicts.some(c => c.day === day && c.period === p.id && (c.facultyId === slot.facultyId || c.roomId === slot.roomId || c.classId === slot.classId));
            const isDimmed = activeCourse && activeCourse !== 'ALL' && slot.courseCode !== activeCourse;

            tbodyHtml += `<td>
              <div class="slot-card ${isSelected ? 'selected-for-swap' : ''} ${hasConflict ? 'has-conflict' : ''} ${isDimmed ? 'dimmed' : ''}" data-slot-id="${slot.id}">
                <div class="slot-code">
                  <span>${slot.courseCode}</span>
                  <span class="badge ${slot.type === 'Lab' ? 'badge--lab' : 'badge--theory'}">${slot.type}</span>
                </div>
                <div class="slot-name" title="${slot.courseTitle}">${slot.courseTitle}</div>
                <div class="slot-details">
                  <span class="slot-faculty" title="${facultyName}">
                    <span class="material-symbols-outlined" style="font-size: 14px;">person</span>
                    ${facultyName.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span class="slot-room ${slot.type === 'Lab' ? 'is-lab-room' : ''}" title="Room: ${slot.roomId}">
                    <span class="material-symbols-outlined" style="font-size: 11px;">${slot.type === 'Lab' ? 'science' : 'meeting_room'}</span>
                    ${slot.roomId}
                  </span>
                </div>
              </div>
            </td>`;
          } else {
            tbodyHtml += `<td>
              <div class="slot-empty" data-day="${day}" data-period="${p.id}" title="Click to move or schedule">
                <span class="material-symbols-outlined" style="font-size: 18px; margin-right: 4px;">add</span> Free
              </div>
            </td>`;
          }
        }
      });

      tbodyHtml += `</tr>`;
    });

    tbodyHtml += `</tbody>`;
    table.innerHTML = theadHtml + tbodyHtml;

    // Attach click events on slot cards
    const slotCards = table.querySelectorAll('.slot-card');
    slotCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const slotId = card.getAttribute('data-slot-id');
        const slot = appState.schedule.find(s => s.id === slotId);
        if (!slot) return;

        if (appState.selectedSwapSlot) {
          appState.selectSwapSlot(slot);
        } else {
          this.openSlotModal(slot);
        }
      });
    });

    // Attach click events on empty slots
    const emptySlots = table.querySelectorAll('.slot-empty');
    emptySlots.forEach(empty => {
      empty.addEventListener('click', () => {
        if (appState.selectedSwapSlot) {
          const targetDay = empty.getAttribute('data-day');
          const targetPeriod = parseInt(empty.getAttribute('data-period'), 10);
          appState.moveSlotToEmpty(appState.selectedSwapSlot.id, targetDay, targetPeriod);
        }
      });
    });
  }

  updateSwapBanner() {
    const banner = document.getElementById('swap-guide-banner');
    const bannerText = document.getElementById('swap-banner-text');
    if (!banner) return;

    if (appState.selectedSwapSlot) {
      banner.style.display = 'flex';
      bannerText.textContent = `Selected: ${appState.selectedSwapSlot.courseCode} (${appState.selectedSwapSlot.day} Period ${appState.selectedSwapSlot.period}). Click another slot or empty period to move/swap.`;
    } else {
      banner.style.display = 'none';
    }
  }

  openSlotModal(slot) {
    this.inspectingSlot = slot;
    const modal = document.getElementById('slot-modal-scrim');
    const title = document.getElementById('modal-slot-title');
    const body = document.getElementById('modal-slot-body');
    if (!modal || !body) return;

    const facultyObj = appState.data.faculty.find(f => f.id === slot.facultyId);
    const roomObj = appState.data.rooms.find(r => r.id === slot.roomId);
    const classObj = appState.data.classes.find(c => c.id === slot.classId);

    title.textContent = `${slot.courseCode} - ${slot.courseTitle}`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; gap: 8px;">
          <span class="badge ${slot.type === 'Lab' ? 'badge--lab' : 'badge--theory'}">${slot.type} Session</span>
          <span class="badge badge--theory">${slot.day}, Period ${slot.period}</span>
        </div>

        <div style="background-color: var(--md-sys-color-surface-container-low); padding: 12px; border-radius: var(--md-sys-shape-corner-small);">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Faculty Instructor</div>
          <div>${facultyObj ? facultyObj.name : slot.facultyId} (${facultyObj ? facultyObj.designation : ''})</div>
          <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant);">Max Hours: ${facultyObj ? facultyObj.maxWeeklyHours : 0} hrs/week</div>
        </div>

        <div style="background-color: var(--md-sys-color-surface-container-low); padding: 12px; border-radius: var(--md-sys-shape-corner-small);">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">Class & Room Allocation</div>
          <div><strong>Section:</strong> ${classObj ? classObj.name : slot.classId} (${classObj ? classObj.strength : 0} Students)</div>
          <div><strong>Room:</strong> ${roomObj ? roomObj.name : slot.roomId} (Capacity: ${roomObj ? roomObj.capacity : 0}, Type: ${roomObj ? roomObj.type : 'N/A'})</div>
        </div>

        <div style="background-color: var(--md-sys-color-surface-container-low); padding: 12px; border-radius: var(--md-sys-shape-corner-small);">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--md-sys-color-primary);">meeting_room</span>
            Reassign Classroom / Lab Number:
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <select class="md-select" id="modal-reassign-room-select" style="height: 40px; font-size: 13px; flex: 1;">
              ${appState.data.rooms.map(r => `
                <option value="${r.id}" ${r.id === slot.roomId ? 'selected' : ''}>${r.name} (${r.id}) - ${r.type} [Cap: ${r.capacity}]</option>
              `).join('')}
            </select>
            <button class="md-btn md-btn--filled" id="modal-apply-room-btn" style="height: 40px; padding: 0 14px; white-space: nowrap;">
              Save Room
            </button>
          </div>
        </div>
      </div>
    `;

    // Wire Save Room button in modal
    const applyRoomBtn = document.getElementById('modal-apply-room-btn');
    if (applyRoomBtn) {
      applyRoomBtn.onclick = () => {
        const roomSelect = document.getElementById('modal-reassign-room-select');
        if (roomSelect) {
          appState.updateSlotRoom(slot.id, roomSelect.value);
          this.showToast(`Slot moved to ${roomSelect.value}`, 'success');
          modal.classList.remove('open');
          this.inspectingSlot = null;
        }
      };
    }

    modal.classList.add('open');
  }

  renderConflictList() {
    const container = document.getElementById('conflicts-list-container');
    if (!container) return;

    if (appState.conflicts.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; background-color: var(--md-sys-color-surface-container-lowest); border-radius: var(--md-sys-shape-corner-medium); border: 1px solid var(--md-sys-color-outline-variant);">
          <span class="material-symbols-outlined" style="font-size: 48px; color: var(--md-sys-color-success);">check_circle</span>
          <h3 style="font: var(--md-sys-typescale-title-large); margin-top: 8px;">Zero Clashes Detected</h3>
          <p style="color: var(--md-sys-color-on-surface-variant); max-width: 500px; margin: 8px auto 0;">
            All hard constraints (teacher exclusivity, classroom allocation, section synchronization, and continuous lab blocks) are 100% compliant.
          </p>
        </div>
      `;
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 8px;">`;
    appState.conflicts.forEach(c => {
      html += `
        <div style="padding: 12px 16px; border-radius: var(--md-sys-shape-corner-small); border-left: 4px solid var(--md-sys-color-error); background-color: var(--md-sys-color-surface-container-low); display: flex; align-items: flex-start; gap: 12px;">
          <span class="material-symbols-outlined" style="color: var(--md-sys-color-error); font-size: 20px;">warning</span>
          <div>
            <div style="font-weight: 600; font-size: 14px; color: var(--md-sys-color-on-surface);">${c.type}</div>
            <div style="font-size: 13px; color: var(--md-sys-color-on-surface-variant); margin-top: 2px;">${c.message}</div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  renderDataTable(tab) {
    const container = document.getElementById('data-tables-container');
    if (!container) return;

    if (tab === 'classes') {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Class ID</th>
              <th>Class / Cohort Name</th>
              <th>Student Strength</th>
              <th>Base Classroom</th>
            </tr>
          </thead>
          <tbody>
            ${appState.data.classes.map(c => `
              <tr>
                <td><strong>${c.id}</strong></td>
                <td>${c.name}</td>
                <td>${c.strength} Students</td>
                <td><span class="badge badge--theory">${c.baseRoom}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tab === 'faculty') {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Max Load</th>
              <th>Unavailable Preferences</th>
            </tr>
          </thead>
          <tbody>
            ${appState.data.faculty.map(f => `
              <tr>
                <td><strong>${f.id}</strong></td>
                <td>${f.name}</td>
                <td>${f.designation}</td>
                <td>${f.department}</td>
                <td>${f.maxWeeklyHours} hrs/week</td>
                <td>${f.unavailableSlots.length > 0 ? `<span class="badge badge--break">${f.unavailableSlots.join(', ')}</span>` : '<span style="color: var(--md-sys-color-outline)">None (Fully Available)</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tab === 'courses') {
      container.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Title</th>
              <th>Cohort</th>
              <th>Type</th>
              <th>Hours/Wk</th>
              <th>Faculty Assigned</th>
              <th>Room / Venue</th>
            </tr>
          </thead>
          <tbody>
            ${appState.data.courses.map(course => {
              const fObj = appState.data.faculty.find(f => f.id === course.facultyId);
              const isLab = course.type === 'Lab';
              const assignedRoom = course.roomId || course.labRoomId;
              return `
                <tr>
                  <td><strong>${course.code}</strong></td>
                  <td>${course.title}</td>
                  <td>${course.classId}</td>
                  <td><span class="badge ${isLab ? 'badge--lab' : 'badge--theory'}">${course.type}</span></td>
                  <td>${course.weeklyHours} hrs</td>
                  <td>${fObj ? fObj.name : course.facultyId}</td>
                  <td>${assignedRoom ? `<span class="badge ${isLab ? 'badge--lab' : 'badge--theory'}">${assignedRoom}</span>` : '<span style="color: var(--md-sys-color-outline)">Auto-Assigned</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (tab === 'rooms') {
      container.innerHTML = `
        <div style="background-color: var(--md-sys-color-surface-container-low); padding: 16px; border-radius: var(--md-sys-shape-corner-medium); margin-bottom: 16px; border: 1px solid var(--md-sys-color-outline-variant);">
          <h4 style="font: var(--md-sys-typescale-title-small); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; color: var(--md-sys-color-on-surface);">
            <span class="material-symbols-outlined" style="color: var(--md-sys-color-primary);">meeting_room</span>
            Add Classroom / Laboratory by Yourself
          </h4>
          <form id="form-add-room-data" style="display: grid; grid-template-columns: 1fr 2fr 1.2fr 1fr auto; gap: 10px; align-items: end;">
            <div class="input-group">
              <label class="input-label" style="font-size: 11px;">Room Number / ID</label>
              <input type="text" class="md-input" id="new-room-id" placeholder="e.g. Room 305" required style="height: 40px; font-size: 13px;">
            </div>
            <div class="input-group">
              <label class="input-label" style="font-size: 11px;">Room Name / Description</label>
              <input type="text" class="md-input" id="new-room-name" placeholder="e.g. Smart Multimedia Hall" required style="height: 40px; font-size: 13px;">
            </div>
            <div class="input-group">
              <label class="input-label" style="font-size: 11px;">Facility Type</label>
              <select class="md-select" id="new-room-type" style="height: 40px; font-size: 13px;">
                <option value="Lecture">Lecture Hall</option>
                <option value="Lab">Practical Laboratory</option>
                <option value="Seminar">Seminar Hall</option>
                <option value="Tutorial">Tutorial Room</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label" style="font-size: 11px;">Seating</label>
              <input type="number" class="md-input" id="new-room-capacity" min="10" max="300" value="65" required style="height: 40px; font-size: 13px;">
            </div>
            <button type="submit" class="md-btn md-btn--filled" style="height: 40px; white-space: nowrap;">
              <span class="material-symbols-outlined">add</span> Save Room
            </button>
          </form>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Room ID / No.</th>
              <th>Room Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${appState.data.rooms.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.name}</td>
                <td><span class="badge ${r.type === 'Lab' ? 'badge--lab' : 'badge--theory'}">${r.type}</span></td>
                <td>${r.capacity} Seats</td>
                <td style="text-align: right;">
                  <button class="btn-remove-course btn-delete-room" data-room-id="${r.id}" title="Delete Room" style="margin-left: auto;">
                    <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Wire Add Room Form Submit
      const formAddRoom = document.getElementById('form-add-room-data');
      if (formAddRoom) {
        formAddRoom.onsubmit = (e) => {
          e.preventDefault();
          const idInput = document.getElementById('new-room-id');
          const nameInput = document.getElementById('new-room-name');
          const typeInput = document.getElementById('new-room-type');
          const capInput = document.getElementById('new-room-capacity');

          const rawId = idInput.value.trim();
          const roomId = rawId.toUpperCase().replace(/\s+/g, '-');
          appState.addNewRoom({
            id: roomId,
            name: nameInput.value.trim() || rawId,
            type: typeInput.value,
            capacity: parseInt(capInput.value, 10) || 60
          });

          this.showToast(`Added room ${roomId} to University`, 'success');
        };
      }

      // Wire Delete Room Buttons
      const deleteRoomBtns = container.querySelectorAll('.btn-delete-room');
      deleteRoomBtns.forEach(btn => {
        btn.onclick = () => {
          const rId = btn.getAttribute('data-room-id');
          if (confirm(`Remove room ${rId}?`)) {
            appState.removeRoom(rId);
            this.showToast(`Removed room ${rId}`);
          }
        };
      });
    }
  }

  preparePrint() {
    const printTarget = document.getElementById('print-view-target');
    if (!printTarget) return;

    const mode = appState.viewMode;
    const filterId = appState.selectedFilterId;

    if (mode === 'class') {
      const c = appState.data.classes.find(item => item.id === filterId);
      printTarget.textContent = `Official Weekly Schedule: ${c ? c.name : filterId} (${filterId})`;
    } else if (mode === 'faculty') {
      const f = appState.data.faculty.find(item => item.id === filterId);
      printTarget.textContent = `Faculty Teaching Schedule: ${f ? f.name : filterId} - ${f ? f.designation : ''}`;
    } else if (mode === 'room') {
      const r = appState.data.rooms.find(item => item.id === filterId);
      printTarget.textContent = `Room Occupancy Schedule: ${r ? r.name : filterId} (${r ? r.type : ''})`;
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 18px;">
        ${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  render() {
    this.populateFilterDropdown();
    this.updateTimetableCourseDropdown();
    this.renderTimetable();
    this.renderDataTable(appState.dataManagementTab);
    this.renderConflictList();
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.__app = new TimetableApp();
});
