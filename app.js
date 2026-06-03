// =============================================================
// MINIMA - Application JavaScript Logic
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  // --- State Initialization ---
  let currentUser = null;
  let currentCoordinates = null;
  let locationWatchId = null;

  // Default Mock Employees
  const defaultEmployees = [
    { id: 'EMP001', name: 'สมชาย ใจดี' },
    { id: 'EMP002', name: 'สมศรี รักดี' },
    { id: 'EMP003', name: 'วิชัย มั่นคง' }
  ];

  // --- Element Selectors ---
  const screens = {
    login: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboardScreen')
  };

  const topActions = document.getElementById('topActions');
  const themeToggle = document.getElementById('themeToggle');
  const settingsBtn = document.getElementById('settingsBtn');
  const dashboardSettingsBtn = document.getElementById('dashboardSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const toastContainer = document.getElementById('toastContainer');

  // Login Selectors
  const loginForm = document.getElementById('loginForm');
  const employeeSelect = document.getElementById('employeeSelect');
  const employeeIdInput = document.getElementById('employeeId');
  const employeeNameInput = document.getElementById('employeeName');
  const localModeLabel = document.getElementById('localModeLabel');

  // Dashboard Selectors
  const displayUserName = document.getElementById('displayUserName');
  const displayUserId = document.getElementById('displayUserId');
  const userAvatar = document.getElementById('userAvatar');
  const logoutBtn = document.getElementById('logoutBtn');
  const liveClock = document.getElementById('liveClock');
  const liveDate = document.getElementById('liveDate');

  // Location Selectors
  const locationDot = document.getElementById('locationDot');
  const locationPinIcon = document.getElementById('locationPinIcon');
  const locationStatus = document.getElementById('locationStatus');
  const locationCoords = document.getElementById('locationCoords');
  const retryLocationBtn = document.getElementById('retryLocationBtn');
  const mockLocationBtn = document.getElementById('mockLocationBtn');

  // Action Selectors
  const checkInBtn = document.getElementById('checkInBtn');
  const checkOutBtn = document.getElementById('checkOutBtn');
  const attendanceNotes = document.getElementById('attendanceNotes');

  // Summary & History Selectors
  const todayCheckInTime = document.getElementById('todayCheckInTime');
  const todayCheckOutTime = document.getElementById('todayCheckOutTime');
  const historyList = document.getElementById('historyList');
  const noHistoryMsg = document.getElementById('noHistoryMsg');
  const clearLocalHistoryBtn = document.getElementById('clearLocalHistoryBtn');

  // Settings Panel Selectors
  const sheetsUrlInput = document.getElementById('sheetsUrlInput');
  const testSheetsBtn = document.getElementById('testSheetsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const connIndicator = document.getElementById('connIndicator');
  const connStatusText = document.getElementById('connStatusText');
  const newEmpId = document.getElementById('newEmpId');
  const newEmpName = document.getElementById('newEmpName');
  const addEmpBtn = document.getElementById('addEmpBtn');
  const adminEmployeeTableBody = document.getElementById('adminEmployeeTableBody');

  // --- Initial Setup ---
  initTheme();
  initEmployees();
  initSettings();
  checkSession();
  startClock();
  startLocationTracking();
  lucide.createIcons(); // Initialize Lucide Icons

  // --- Theme Controller ---
  function initTheme() {
    const savedTheme = localStorage.getItem('minima_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('minima_theme', newTheme);
    showToast(`เปลี่ยนเป็นธีม ${newTheme === 'dark' ? 'มืด' : 'สว่าง'}`, 'info');
  });

  // --- Employee Database Controller ---
  function initEmployees() {
    let employees = getStoredEmployees();
    if (!employees || employees.length === 0) {
      employees = defaultEmployees;
      localStorage.setItem('minima_employees', JSON.stringify(employees));
    }
    renderEmployeeSelectOptions(employees);
    renderAdminEmployeeTable(employees);
  }

  function getStoredEmployees() {
    try {
      return JSON.parse(localStorage.getItem('minima_employees')) || [];
    } catch {
      return [];
    }
  }

  function renderEmployeeSelectOptions(employees) {
    // Preserve default first option
    employeeSelect.innerHTML = '<option value="" disabled selected>-- กรุณาเลือกชื่อของคุณ --</option>';
    employees.forEach(emp => {
      const option = document.createElement('option');
      option.value = emp.id;
      option.textContent = `${emp.id} - ${emp.name}`;
      employeeSelect.appendChild(option);
    });
  }

  function renderAdminEmployeeTable(employees) {
    adminEmployeeTableBody.innerHTML = '';
    if (employees.length === 0) {
      adminEmployeeTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-tertiary);">ไม่มีข้อมูลพนักงาน</td></tr>';
      return;
    }

    employees.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${emp.id}</strong></td>
        <td>${emp.name}</td>
        <td>
          <button class="btn btn-secondary btn-sm text-danger delete-emp-btn" data-id="${emp.id}">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i> ลบ
          </button>
        </td>
      `;
      adminEmployeeTableBody.appendChild(tr);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-emp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = btn.getAttribute('data-id');
        deleteEmployee(empId);
      });
    });
    lucide.createIcons();
  }

  addEmpBtn.addEventListener('click', () => {
    const id = newEmpId.value.trim().toUpperCase();
    const name = newEmpName.value.trim();

    if (!id || !name) {
      showToast('กรุณากรอกข้อมูลรหัสและชื่อพนักงานให้ครบถ้วน', 'error');
      return;
    }

    const employees = getStoredEmployees();
    if (employees.some(emp => emp.id === id)) {
      showToast(`รหัสพนักงาน ${id} มีในระบบแล้ว`, 'error');
      return;
    }

    employees.push({ id, name });
    localStorage.setItem('minima_employees', JSON.stringify(employees));
    
    newEmpId.value = '';
    newEmpName.value = '';
    
    initEmployees();
    showToast('เพิ่มพนักงานสำเร็จ', 'success');
  });

  function deleteEmployee(empId) {
    let employees = getStoredEmployees();
    employees = employees.filter(emp => emp.id !== empId);
    localStorage.setItem('minima_employees', JSON.stringify(employees));
    initEmployees();
    showToast('ลบข้อมูลพนักงานเรียบร้อยแล้ว', 'info');
  }

  // --- Google Sheets URL Config ---
  function initSettings() {
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbyXHGuum24HR1XYC4JIVLnyxeLoxla_Ug24FxoRuOwZvX_NiULMIez0we0a5-K4K_bV/exec';
    let savedUrl = localStorage.getItem('minima_sheets_url');
    if (savedUrl === null || savedUrl === '' || !savedUrl.includes('/exec')) {
      localStorage.setItem('minima_sheets_url', defaultUrl);
      savedUrl = defaultUrl;
    }
    sheetsUrlInput.value = savedUrl;
    updateConnectionStatusUI(savedUrl);
  }

  function updateConnectionStatusUI(url) {
    if (url) {
      connIndicator.className = 'status-indicator-dot online';
      connStatusText.textContent = 'สถานะการเชื่อมต่อ: พร้อมใช้งาน Cloud Sync';
      localModeLabel.innerHTML = '<i data-lucide="cloud"></i> เชื่อมต่อ Google Sheets แล้ว';
    } else {
      connIndicator.className = 'status-indicator-dot offline';
      connStatusText.textContent = 'สถานะการเชื่อมต่อ: ทำงานในเครื่อง (Local Storage เท่านั้น)';
      localModeLabel.innerHTML = '<i data-lucide="info"></i> โหมดใช้งานภายในบราวเซอร์ (Offline)';
    }
    lucide.createIcons();
  }

  saveSettingsBtn.addEventListener('click', () => {
    const url = sheetsUrlInput.value.trim();
    
    // Client-side URL Validation on save (if not empty)
    if (url && (!url.includes('/macros/s/') || !url.includes('/exec'))) {
      showToast('URL ไม่ถูกต้อง! ต้องใช้ Web App URL ที่ลงท้ายด้วย /exec (ห้ามใช้ลิงก์จากหน้าเขียนโค้ด /edit)', 'error');
      return;
    }
    
    localStorage.setItem('minima_sheets_url', url);
    updateConnectionStatusUI(url);
    showToast('บันทึกการตั้งค่าแล้ว', 'success');
    closeModal();
  });

  testSheetsBtn.addEventListener('click', async () => {
    const url = sheetsUrlInput.value.trim();
    if (!url) {
      showToast('กรุณาระบุ URL ก่อนทำการทดสอบ', 'error');
      return;
    }

    // Client-side URL Validation
    if (!url.includes('/macros/s/') || !url.includes('/exec')) {
      showToast('URL ไม่ถูกต้อง! ต้องใช้ Web App URL ที่ลงท้ายด้วย /exec (ห้ามใช้ลิงก์จากหน้าเขียนโค้ด /edit)', 'error');
      return;
    }

    showToast('กำลังทดสอบการเชื่อมต่อ...', 'info');
    
    // Create a ping payload
    const testPayload = {
      timestamp: Date.now(),
      formattedDate: "ทดสอบการเชื่อมต่อ",
      formattedTime: new Date().toLocaleTimeString('th-TH'),
      employeeName: "ระบบทดสอบบราวเซอร์",
      type: "ping",
      latitude: 0,
      longitude: 0,
      notes: "ปิงทดสอบระบบ"
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain' // Using text/plain avoids CORS preflight issues on standard configurations
        },
        body: JSON.stringify(testPayload)
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        showToast('เชื่อมต่อสำเร็จ! Google Sheets พร้อมบันทึกข้อมูล', 'success');
      } else {
        showToast('การเชื่อมต่อตอบสนอง แต่ระบบระบุข้อผิดพลาด: ' + result.message, 'error');
      }
    } catch (error) {
      console.warn("CORS connection failed, trying no-cors fallback...", error);
      // Fallback for file:// or browser sandboxing
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(testPayload)
        });
        showToast('เชื่อมต่อสำเร็จผ่านโหมดเข้ากันได้! (โปรดตรวจสอบใน Google Sheets ว่ามีข้อมูลการทดสอบแสดงขึ้นมาหรือไม่)', 'success');
      } catch (noCorsError) {
        console.error(noCorsError);
        showToast('เชื่อมต่อไม่สำเร็จ กรุณาตรวจความถูกต้องของ URL หรือสิทธิ์การ Deploy', 'error');
      }
    }
  });

  // --- Session Management ---
  function checkSession() {
    try {
      const savedSession = JSON.parse(localStorage.getItem('minima_session'));
      if (savedSession) {
        currentUser = savedSession;
        showScreen('dashboard');
      } else {
        showScreen('login');
      }
    } catch {
      showScreen('login');
    }
  }

  // Handle dropdown value changes to sync inputs
  employeeSelect.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    const employees = getStoredEmployees();
    const employee = employees.find(emp => emp.id === selectedId);
    if (employee) {
      employeeIdInput.value = employee.id;
      employeeNameInput.value = employee.name;
    }
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = employeeIdInput.value.trim().toUpperCase();
    const name = employeeNameInput.value.trim();

    if (!id || !name) {
      showToast('กรุณากรอกข้อมูลพนักงาน', 'error');
      return;
    }

    currentUser = { id, name };
    localStorage.setItem('minima_session', JSON.stringify(currentUser));
    
    // Proactively save to stored list if not exists
    const employees = getStoredEmployees();
    if (!employees.some(emp => emp.id === id)) {
      employees.push(currentUser);
      localStorage.setItem('minima_employees', JSON.stringify(employees));
      initEmployees();
    }

    showToast(`ยินดีต้อนรับคุณ ${name}`, 'success');
    showScreen('dashboard');
  });

  logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('minima_session');
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    showScreen('login');
    
    // Clear today's metrics
    todayCheckInTime.textContent = '--:--';
    todayCheckOutTime.textContent = '--:--';
  });

  // --- Screen Switcher ---
  function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.remove('active');
    });
    
    screens[screenKey].classList.add('active');

    if (screenKey === 'dashboard') {
      topActions.style.display = 'flex';
      displayUserName.textContent = currentUser.name;
      displayUserId.textContent = currentUser.id;
      userAvatar.textContent = currentUser.name.charAt(0);
      loadLocalHistory();
    } else {
      topActions.style.display = 'flex'; // Let settings and theme be editable on login page
    }
  }

  // --- Clock Ticker (Thai Date Integration) ---
  function startClock() {
    const daysThai = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    const monthsThai = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    function update() {
      const now = new Date();
      
      // Clock format HH:MM:SS
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${hh}:${mm}:${ss}`;

      // Date Format: วันพุธที่ 3 มิถุนายน พ.ศ. 2569
      const dayName = daysThai[now.getDay()];
      const dateNum = now.getDate();
      const monthName = monthsThai[now.getMonth()];
      const yearBE = now.getFullYear() + 543;
      liveDate.textContent = `${dayName}ที่ ${dateNum} ${monthName} พ.ศ. ${yearBE}`;
    }
    
    update();
    setInterval(update, 1000);
  }

  // --- Geolocation (GPS Tracker) ---
  function startLocationTracking() {
    if (!navigator.geolocation) {
      updateLocationUI('error', 'เบราวเซอร์นี้ไม่รองรับ Geolocation', '--', '--');
      return;
    }

    updateLocationUI('warning', 'กำลังจับสัญญาณพิกัด GPS...', '--', '--');

    // Options for geolocation
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    // Watch position returns continuous updates
    locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const accuracy = position.coords.accuracy.toFixed(1);
        currentCoordinates = { lat, lng };

        updateLocationUI('success', `พิกัดคงที่ (คลาดเคลื่อน ±${accuracy} ม.)`, lat, lng);
      },
      (error) => {
        let msg = 'ไม่สามารถดึงข้อมูลตำแหน่งพิกัดได้';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'กรุณาอนุญาตให้แอปพลิเคชันเข้าถึงตำแหน่ง GPS ของคุณ';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'ไม่พบสัญญาณพิกัด GPS ปัจจุบัน';
            break;
          case error.TIMEOUT:
            msg = 'หมดเวลาตรวจจับพิกัด GPS ปัจจุบัน';
            break;
        }
        currentCoordinates = null;
        updateLocationUI('danger', msg, '--', '--');
      },
      options
    );
  }

  function updateLocationUI(status, message, lat, lng) {
    // Reset status classes
    locationDot.className = 'status-dot ' + status;
    locationPinIcon.className = status;
    
    locationStatus.textContent = message;
    locationCoords.textContent = `Latitude: ${lat} | Longitude: ${lng}`;

    // Enable/disable buttons based on coordinate status
    if (lat !== '--' && lng !== '--') {
      checkInBtn.removeAttribute('disabled');
      checkOutBtn.removeAttribute('disabled');
    } else {
      checkInBtn.setAttribute('disabled', 'true');
      checkOutBtn.setAttribute('disabled', 'true');
    }
  }

  retryLocationBtn.addEventListener('click', () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
    }
    startLocationTracking();
    showToast('กำลังรีเฟรชตำแหน่งพิกัด...', 'info');
  });

  mockLocationBtn.addEventListener('click', () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      locationWatchId = null;
    }
    const mockLat = "13.756300";
    const mockLng = "100.501800";
    currentCoordinates = { lat: mockLat, lng: mockLng };
    updateLocationUI('success', 'ใช้พิกัดจำลอง (กรุงเทพมหานคร)', mockLat, mockLng);
    showToast('เปิดใช้งานพิกัดจำลองสำเร็จ', 'success');
  });

  // --- Clock In / Out Handlers ---
  checkInBtn.addEventListener('click', () => recordAttendance('check_in'));
  checkOutBtn.addEventListener('click', () => recordAttendance('check_out'));

  async function recordAttendance(type) {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนลงเวลา', 'error');
      return;
    }

    if (!currentCoordinates) {
      showToast('ไม่พบพิกัดตำแหน่ง ไม่สามารถลงเวลาได้', 'error');
      return;
    }

    const now = new Date();
    const formattedDate = formatDateShort(now);
    const formattedTime = now.toLocaleTimeString('th-TH', { hour12: false });
    const notesVal = attendanceNotes.value.trim();

    const payload = {
      timestamp: now.getTime(),
      formattedDate,
      formattedTime,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      type,
      latitude: currentCoordinates.lat,
      longitude: currentCoordinates.lng,
      notes: notesVal
    };

    // Save to Local History immediately (to prevent data loss)
    saveToLocalHistory(payload);
    attendanceNotes.value = '';

    // If Google Sheet is set up, sync it
    const sheetsUrl = localStorage.getItem('minima_sheets_url');
    if (sheetsUrl) {
      showToast('กำลังส่งข้อมูลไปยัง Google Sheets...', 'info');
      
      try {
        const response = await fetch(sheetsUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
          showToast(`ลงเวลา${type === 'check_in' ? 'เข้างาน' : 'ออกงาน'} และคลาวด์ซิงก์เรียบร้อยแล้ว`, 'success');
        } else {
          showToast('บันทึกสำเร็จลงเครื่อง แต่ซิงก์ตอบรับล้มเหลว: ' + result.message, 'warning');
        }
      } catch (err) {
        console.warn("CORS sync failed, trying no-cors fallback...", err);
        // Fallback for file:// or browser sandboxing
        try {
          await fetch(sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain'
            },
            body: JSON.stringify(payload)
          });
          showToast(`ลงเวลา${type === 'check_in' ? 'เข้างาน' : 'ออกงาน'} และส่งข้อมูลแล้ว (โหมดเข้ากันได้)`, 'success');
        } catch (noCorsErr) {
          console.error(noCorsErr);
          showToast('เซิร์ฟเวอร์ไม่ตอบรับ บันทึกลงเครื่องแบบออฟไลน์สำเร็จ', 'warning');
        }
      }
    } else {
      showToast(`ลงเวลา${type === 'check_in' ? 'เข้างาน' : 'ออกงาน'}เรียบร้อยแล้ว (ออฟไลน์)`, 'success');
    }

    // Refresh display
    loadLocalHistory();
  }

  // Helper date formatter (DD/MM/YYYY)
  function formatDateShort(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear() + 543; // Buddhist Era
    return `${dd}/${mm}/${yyyy}`;
  }

  // --- Local History Controller ---
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('minima_history')) || [];
    } catch {
      return [];
    }
  }

  function saveToLocalHistory(item) {
    const history = getHistory();
    history.unshift(item); // Add to beginning of array
    localStorage.setItem('minima_history', JSON.stringify(history));
  }

  function loadLocalHistory() {
    const history = getHistory();
    const userHistory = history.filter(item => item.employeeId === currentUser.id);

    // Filter today's records for summary metrics
    const todayStr = formatDateShort(new Date());
    const todayLogs = userHistory.filter(item => item.formattedDate === todayStr);
    
    // Find check_in and check_out for today
    const lastCheckIn = todayLogs.find(item => item.type === 'check_in');
    const lastCheckOut = todayLogs.find(item => item.type === 'check_out');

    todayCheckInTime.textContent = lastCheckIn ? lastCheckIn.formattedTime.substring(0, 5) : '--:--';
    todayCheckOutTime.textContent = lastCheckOut ? lastCheckOut.formattedTime.substring(0, 5) : '--:--';

    // Render history list
    historyList.innerHTML = '';
    if (userHistory.length === 0) {
      noHistoryMsg.style.display = 'flex';
      return;
    }
    
    noHistoryMsg.style.display = 'none';
    userHistory.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';

      const badgeClass = item.type === 'check_in' ? 'badge checkin' : 'badge checkout';
      const badgeText = item.type === 'check_in' ? 'เข้างาน' : 'ออกงาน';
      const mapsLink = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;

      li.innerHTML = `
        <div class="hist-left">
          <span class="${badgeClass}">${badgeText}</span>
          <div class="hist-info">
            <span class="hist-time">${item.formattedTime}</span>
            <span class="hist-date">${item.formattedDate}</span>
          </div>
        </div>
        <div class="hist-right">
          ${item.notes ? `<span class="help-text" title="${item.notes}" style="max-width:120px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">💬 ${item.notes}</span>` : ''}
          <a href="${mapsLink}" target="_blank" class="hist-link">
            <i data-lucide="map"></i> <span>แผนที่</span>
          </a>
        </div>
      `;
      historyList.appendChild(li);
    });

    lucide.createIcons();
  }

  clearLocalHistoryBtn.addEventListener('click', () => {
    if (confirm('คุณต้องการล้างประวัติลงเวลาของเครื่องนี้ใช่หรือไม่? (ข้อมูลบน Google Sheet จะไม่ถูกลบ)')) {
      const history = getHistory();
      // Keep other users' history, clear only current user
      const filtered = history.filter(item => item.employeeId !== currentUser.id);
      localStorage.setItem('minima_history', JSON.stringify(filtered));
      showToast('ล้างประวัติเสร็จสิ้น', 'info');
      loadLocalHistory();
    }
  });

  // --- Modal Controllers ---
  function openModal() {
    settingsModal.classList.add('active');
    initEmployees(); // Refresh employees display
    sheetsUrlInput.value = localStorage.getItem('minima_sheets_url') || '';
  }

  function closeModal() {
    settingsModal.classList.remove('active');
  }

  settingsBtn.addEventListener('click', openModal);
  dashboardSettingsBtn.addEventListener('click', openModal);
  closeSettingsBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside contents
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeModal();
    }
  });

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';
    if (type === 'warning') icon = 'alert-circle';

    toast.innerHTML = `
      <i data-lucide="${icon}" class="${type}"></i>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons(); // Refresh for the toast icon

    // Set layout slide-out and remove
    setTimeout(() => {
      toast.style.animation = 'modalSlide 0.3s reverse forwards';
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3500);
  }
});
