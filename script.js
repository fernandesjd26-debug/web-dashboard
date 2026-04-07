// ==========================================
// PWA SERVICE WORKER REGISTRATION
// ==========================================

// Temporary safeguard: disable SW while auth rollout is stabilized.
const ENABLE_SERVICE_WORKER = false;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (ENABLE_SERVICE_WORKER) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => console.log('Service Worker registration failed:', error));
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(cacheKey => caches.delete(cacheKey)));
      }
      console.log('Service worker disabled and old caches cleared.');
    } catch (error) {
      console.log('Could not clear old service worker/cache state:', error);
    }
  });
}

// ==========================================
// MOTIVATIONAL PHRASES
// ==========================================

const motivationalPhrases = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Your limitation—it's only your imagination. Push beyond limits.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Don't stop until you're proud.", author: "Unknown" },
  { text: "You are capable of amazing things.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Excellence is not a destination; it is a continuous journey that never ends.", author: "Brian Tracy" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Perfection is not just about control, it's also about letting go.", author: "Freida McFadden" },
  { text: "Expect nothing, be happy about everything.", author: "Unknown" }
];

let currentPhraseIndex = 0;

function displayRandomPhrase() {
  const randomIndex = Math.floor(Math.random() * motivationalPhrases.length);
  currentPhraseIndex = randomIndex;
  const phrase = motivationalPhrases[randomIndex];
  
  const phraseElement = document.getElementById('motivational-phrase');
  const authorElement = document.getElementById('motivation-author');
  
  // Fade out effect
  phraseElement.style.opacity = '0';
  authorElement.style.opacity = '0';
  
  setTimeout(() => {
    phraseElement.textContent = phrase.text;
    authorElement.textContent = `— ${phrase.author}`;
    
    // Fade in effect
    phraseElement.style.opacity = '1';
    authorElement.style.opacity = '1';
  }, 200);
}

// Initialize immediately and also on DOMContentLoaded as fallback
function initMotivation() {
  console.log("🎯 Initializing motivation section...");
  displayRandomPhrase();
  
  const newPhraseBtn = document.getElementById('new-phrase-btn');
  if (newPhraseBtn) {
    console.log("✅ Button found, attaching click listener");
    newPhraseBtn.addEventListener('click', displayRandomPhrase);
  } else {
    console.warn("⚠️ Button not found in DOM");
  }
}

// Try to initialize immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMotivation);
} else {
  initMotivation();
}

// ==========================================
// GOALS SYSTEM
// ==========================================

const GOALS_STORAGE_KEY = 'yearlyGoals2026';

function loadGoals() {
  const stored = localStorage.getItem(GOALS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveGoals(goals) {
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

function renderGoals() {
  const goals = loadGoals();
  const goalsList = document.getElementById('goalsList');
  goalsList.innerHTML = '';
  
  if (goals.length === 0) {
    goalsList.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">No goals yet. Add one to get started! 🎯</li>';
    return;
  }
  
  goals.forEach((goal, index) => {
    const li = document.createElement('li');
    li.className = 'goal-item';
    li.innerHTML = `
      <p class="goal-text">${goal}</p>
      <button class="goal-delete" data-index="${index}">Delete</button>
    `;
    goalsList.appendChild(li);
  });
  
  // Attach delete listeners
  document.querySelectorAll('.goal-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      const goals = loadGoals();
      goals.splice(index, 1);
      saveGoals(goals);
      renderGoals();
    });
  });
}

function initGoals() {
  console.log("🎯 Initializing goals section...");
  renderGoals();
  
  const addGoalBtn = document.getElementById('addGoalBtn');
  const goalInput = document.getElementById('goalInput');
  
  if (addGoalBtn && goalInput) {
    addGoalBtn.addEventListener('click', addGoal);
    goalInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addGoal();
      }
    });
  } else {
    console.warn("⚠️ Goals elements not found in DOM");
  }
}

function addGoal() {
  const goalInput = document.getElementById('goalInput');
  const goalText = goalInput.value.trim();
  
  if (!goalText) {
    alert('Please enter a goal');
    return;
  }
  
  const goals = loadGoals();
  goals.push(goalText);
  saveGoals(goals);
  goalInput.value = '';
  renderGoals();
  goalInput.focus();
}

// Initialize goals immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoals);
} else {
  initGoals();
}

// ==========================================
// NOTIFICATION SYSTEM FOR HABITS & DIARY
// ==========================================

const APP_NOTIFICATION_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect fill='%234f46e5' width='192' height='192'/%3E%3Ctext x='50%25' y='50%25' font-size='100' font-weight='bold' fill='white' text-anchor='middle' dominant-baseline='middle'%3ED%3C/text%3E%3C/svg%3E";
const REMINDER_STORAGE_KEY = 'dashboardReminderSchedules';
const REMINDER_META_KEY = 'dashboardReminderMeta';
const NATIVE_REMINDER_IDS_KEY = 'dashboardNativeReminderIds';
const REMINDER_CATCH_UP_WINDOW_MS = 30 * 60 * 1000;
const REMINDER_DAY_LABELS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' }
];
const DEFAULT_REMINDER_SCHEDULES = [
  {
    id: 'morning-habits',
    name: 'Morning habits',
    time: '06:50',
    title: 'Morning habits',
    message: 'Open your dashboard and fill in today\'s habits.',
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true
  },
  {
    id: 'morning-tasks',
    name: 'Morning tasks',
    time: '08:00',
    title: 'Morning tasks',
    message: 'Check your to-do list and plan today\'s work.',
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true
  },
  {
    id: 'afternoon-focus',
    name: 'Afternoon focus',
    time: '14:00',
    title: 'Afternoon focus',
    message: 'Review what is left for today and keep moving.',
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true
  },
  {
    id: 'evening-reflection',
    name: 'Evening reflection',
    time: '20:00',
    title: 'Evening reflection',
    message: 'Open your diary, update habits, and close the day cleanly.',
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true
  }
];

let reminderEditId = null;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createReminderId() {
  return `reminder-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeReminderSchedule(schedule, fallbackId) {
  const normalizedDays = Array.isArray(schedule.days)
    ? Array.from(new Set(schedule.days.map(Number).filter(day => Number.isInteger(day) && day >= 0 && day <= 6)))
    : [];

  return {
    id: schedule.id || fallbackId || createReminderId(),
    name: (schedule.name || 'Untitled reminder').trim(),
    time: schedule.time || '09:00',
    title: (schedule.title || 'Dashboard reminder').trim(),
    message: (schedule.message || 'Open the dashboard and continue your plan.').trim(),
    days: normalizedDays.length ? normalizedDays : [1, 2, 3, 4, 5, 6, 0],
    enabled: schedule.enabled !== false
  };
}

function loadReminderSchedules() {
  const stored = localStorage.getItem(REMINDER_STORAGE_KEY);

  if (!stored) {
    return DEFAULT_REMINDER_SCHEDULES.map(schedule => normalizeReminderSchedule(schedule, schedule.id));
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_REMINDER_SCHEDULES.map(schedule => normalizeReminderSchedule(schedule, schedule.id));
    }

    return parsed.map((schedule, index) => normalizeReminderSchedule(schedule, `loaded-${index}`));
  } catch (error) {
    console.error('Failed to load reminder schedules:', error);
    return DEFAULT_REMINDER_SCHEDULES.map(schedule => normalizeReminderSchedule(schedule, schedule.id));
  }
}

function saveReminderSchedules() {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminderSchedules));
}

function loadReminderMeta() {
  const stored = localStorage.getItem(REMINDER_META_KEY);

  if (!stored) {
    return {
      lastCheckedAt: null,
      deliveredOn: {}
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      lastCheckedAt: parsed.lastCheckedAt || null,
      deliveredOn: parsed.deliveredOn || {}
    };
  } catch (error) {
    console.error('Failed to load reminder metadata:', error);
    return {
      lastCheckedAt: null,
      deliveredOn: {}
    };
  }
}

function saveReminderMeta() {
  localStorage.setItem(REMINDER_META_KEY, JSON.stringify(reminderMeta));
}

function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function formatReminderTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const displayDate = new Date();
  displayDate.setHours(hours, minutes, 0, 0);

  return displayDate.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatReminderDays(days) {
  const orderedDays = REMINDER_DAY_LABELS.filter(day => days.includes(day.value)).map(day => day.label);

  if (orderedDays.length === 7) {
    return 'Every day';
  }

  if (orderedDays.join(',') === 'Mon,Tue,Wed,Thu,Fri') {
    return 'Weekdays';
  }

  if (orderedDays.join(',') === 'Sat,Sun') {
    return 'Weekends';
  }

  return orderedDays.join(', ');
}

function isReminderScheduledForDate(schedule, date) {
  return schedule.days.includes(date.getDay());
}

function getReminderScheduledDate(schedule, referenceDate) {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const scheduledDate = new Date(referenceDate);
  scheduledDate.setHours(hours, minutes, 0, 0);
  return scheduledDate;
}

function getCapacitorBridge() {
  return window.Capacitor || null;
}

function getCapacitorPlatform() {
  const capacitorBridge = getCapacitorBridge();

  if (!capacitorBridge || typeof capacitorBridge.getPlatform !== 'function') {
    return 'web';
  }

  return capacitorBridge.getPlatform();
}

function isNativeCapacitorApp() {
  const capacitorBridge = getCapacitorBridge();

  if (!capacitorBridge) {
    return false;
  }

  if (typeof capacitorBridge.isNativePlatform === 'function') {
    return capacitorBridge.isNativePlatform();
  }

  return getCapacitorPlatform() !== 'web';
}

function getNativeLocalNotificationsPlugin() {
  return getCapacitorBridge()?.Plugins?.LocalNotifications || null;
}

function hasNativeLocalNotifications() {
  return isNativeCapacitorApp() && !!getNativeLocalNotificationsPlugin();
}

function loadNativeReminderIds() {
  const stored = localStorage.getItem(NATIVE_REMINDER_IDS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isInteger) : [];
  } catch (error) {
    console.error('Failed to load native reminder ids:', error);
    return [];
  }
}

function saveNativeReminderIds() {
  localStorage.setItem(NATIVE_REMINDER_IDS_KEY, JSON.stringify(nativeReminderIds));
}

function mapJsDayToCapacitorWeekday(day) {
  return day === 0 ? 1 : day + 1;
}

function getReminderBaseNotificationId(reminderId) {
  let hash = 0;

  for (const character of reminderId) {
    hash = ((hash << 5) - hash) + character.charCodeAt(0);
    hash |= 0;
  }

  return (Math.abs(hash) % 200000) * 10;
}

function getNativeReminderNotificationId(reminderId, day) {
  return getReminderBaseNotificationId(reminderId) + mapJsDayToCapacitorWeekday(day);
}

function buildNativeReminderNotifications() {
  return reminderSchedules
    .filter(schedule => schedule.enabled)
    .flatMap(schedule => {
      const [hour, minute] = schedule.time.split(':').map(Number);

      return schedule.days.map(day => ({
        id: getNativeReminderNotificationId(schedule.id, day),
        title: schedule.title,
        body: schedule.message,
        schedule: {
          on: {
            weekday: mapJsDayToCapacitorWeekday(day),
            hour,
            minute
          },
          repeats: true
        },
        extra: {
          reminderId: schedule.id,
          source: 'dashboard-reminder'
        }
      }));
    });
}

async function syncNativeReminderSchedules() {
  const localNotifications = getNativeLocalNotificationsPlugin();
  if (!localNotifications) {
    return false;
  }

  if (nativeReminderIds.length > 0) {
    await localNotifications.cancel({
      notifications: nativeReminderIds.map(id => ({ id }))
    });
    nativeReminderIds = [];
    saveNativeReminderIds();
  }

  const permissionStatus = await localNotifications.checkPermissions();
  if (permissionStatus.display !== 'granted') {
    updateNotificationStatus();
    return false;
  }

  const notifications = buildNativeReminderNotifications();
  if (notifications.length > 0) {
    await localNotifications.schedule({ notifications });
  }

  nativeReminderIds = notifications.map(notification => notification.id);
  saveNativeReminderIds();
  updateNotificationStatus();
  return true;
}

function syncReminderEngine() {
  if (hasNativeLocalNotifications()) {
    return syncNativeReminderSchedules();
  }

  return checkReminderSchedules();
}

async function requestNotificationPermission() {
  const localNotifications = getNativeLocalNotificationsPlugin();
  if (localNotifications) {
    const currentStatus = await localNotifications.checkPermissions();
    if (currentStatus.display === 'granted') {
      updateNotificationStatus();
      await syncNativeReminderSchedules();
      return currentStatus.display;
    }

    const permissionStatus = await localNotifications.requestPermissions();
    updateNotificationStatus();
    if (permissionStatus.display === 'granted') {
      await syncNativeReminderSchedules();
    }
    return permissionStatus.display;
  }

  if (!('Notification' in window)) {
    updateNotificationStatus();
    return 'unsupported';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  updateNotificationStatus();
  return permission;
}

async function sendNotification(title, body, type = 'dashboard-reminder') {
  const localNotifications = getNativeLocalNotificationsPlugin();
  if (localNotifications) {
    const permissionStatus = await localNotifications.checkPermissions();
    if (permissionStatus.display !== 'granted') {
      updateNotificationStatus();
      return false;
    }

    await localNotifications.schedule({
      notifications: [{
        id: Math.floor(Date.now() % 2000000000),
        title,
        body,
        schedule: {
          at: new Date(Date.now() + 1000)
        },
        extra: {
          source: 'dashboard-immediate',
          type
        }
      }]
    });

    return true;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    updateNotificationStatus();
    return false;
  }

  const notificationOptions = {
    body,
    icon: APP_NOTIFICATION_ICON,
    badge: APP_NOTIFICATION_ICON,
    tag: type,
    data: { url: './' }
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notificationOptions);
    } else {
      new Notification(title, notificationOptions);
    }

    console.log(`Notification sent: ${title}`);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

function populateReminderForm(scheduleId) {
  const schedule = reminderSchedules.find(item => item.id === scheduleId);
  if (!schedule) {
    return;
  }

  reminderEditId = schedule.id;
  reminderNameInput.value = schedule.name;
  reminderTimeInput.value = schedule.time;
  reminderTitleInput.value = schedule.title;
  reminderMessageInput.value = schedule.message;
  reminderDayInputs.forEach(input => {
    input.checked = schedule.days.includes(Number(input.value));
  });
  saveReminderBtn.textContent = 'Update reminder';
}

function resetReminderForm() {
  reminderEditId = null;
  reminderNameInput.value = '';
  reminderTimeInput.value = '';
  reminderTitleInput.value = '';
  reminderMessageInput.value = '';
  reminderDayInputs.forEach(input => {
    input.checked = true;
  });
  saveReminderBtn.textContent = 'Save reminder';
}

function readReminderForm() {
  const name = reminderNameInput.value.trim();
  const time = reminderTimeInput.value;
  const title = reminderTitleInput.value.trim();
  const message = reminderMessageInput.value.trim();
  const days = reminderDayInputs
    .filter(input => input.checked)
    .map(input => Number(input.value));

  if (!name || !time || !title || !message) {
    alert('Fill in the reminder name, time, title, and message.');
    return null;
  }

  if (days.length === 0) {
    alert('Select at least one day for the reminder.');
    return null;
  }

  return {
    id: reminderEditId || createReminderId(),
    name,
    time,
    title,
    message,
    days,
    enabled: true
  };
}

function renderReminderSchedules() {
  if (reminderSchedules.length === 0) {
    remindersListEl.innerHTML = `
      <div class="reminder-empty-state">
        <p>No reminders yet.</p>
        <p>Build your first schedule and the app will check for it every minute.</p>
      </div>
    `;
    return;
  }

  const sortedSchedules = [...reminderSchedules].sort((left, right) => left.time.localeCompare(right.time));

  remindersListEl.innerHTML = sortedSchedules.map(schedule => `
    <article class="reminder-card">
      <div class="reminder-card-header">
        <div>
          <h4>${escapeHtml(schedule.name)}</h4>
          <p class="reminder-day-summary">${escapeHtml(formatReminderDays(schedule.days))}</p>
        </div>
        <p class="reminder-time">${escapeHtml(formatReminderTime(schedule.time))}</p>
      </div>
      <div class="reminder-card-body">
        <p><strong>${escapeHtml(schedule.title)}</strong></p>
        <p>${escapeHtml(schedule.message)}</p>
        <p class="reminder-card-meta">Status: ${schedule.enabled ? 'Enabled' : 'Paused'}</p>
      </div>
      <div class="reminder-card-actions">
        <button type="button" data-action="edit" data-id="${escapeHtml(schedule.id)}">Edit</button>
        <button type="button" class="reminder-toggle ${schedule.enabled ? '' : 'off'}" data-action="toggle" data-id="${escapeHtml(schedule.id)}">${schedule.enabled ? 'Pause' : 'Enable'}</button>
        <button type="button" class="reminder-delete" data-action="delete" data-id="${escapeHtml(schedule.id)}">Delete</button>
      </div>
    </article>
  `).join('');
}

async function checkReminderSchedules() {
  if (hasNativeLocalNotifications()) {
    return syncNativeReminderSchedules();
  }

  const now = new Date();
  const lastCheckedAt = reminderMeta.lastCheckedAt ? new Date(reminderMeta.lastCheckedAt) : new Date(now.getTime() - 60000);
  const todayKey = getDateKey(now);

  for (const schedule of reminderSchedules) {
    if (!schedule.enabled || !isReminderScheduledForDate(schedule, now)) {
      continue;
    }

    const scheduledDate = getReminderScheduledDate(schedule, now);
    const alreadyDeliveredToday = reminderMeta.deliveredOn[schedule.id] === todayKey;
    const isDueNow = scheduledDate <= now;
    const becameDueSinceLastCheck = scheduledDate > lastCheckedAt;
    const stillFresh = now.getTime() - scheduledDate.getTime() <= REMINDER_CATCH_UP_WINDOW_MS;

    if (!alreadyDeliveredToday && isDueNow && becameDueSinceLastCheck && stillFresh) {
      const sent = await sendNotification(schedule.title, schedule.message, schedule.id);
      if (sent) {
        reminderMeta.deliveredOn[schedule.id] = todayKey;
      }
    }
  }

  reminderMeta.lastCheckedAt = now.toISOString();
  saveReminderMeta();
}

function updateNotificationStatus() {
  const localNotifications = getNativeLocalNotificationsPlugin();
  if (localNotifications) {
    const platform = getCapacitorPlatform() === 'ios' ? 'Native iPhone app' : 'Native app';
    appInstallStatus.textContent = platform;
    notificationPermissionStatus.textContent = 'Checking native permission...';
    notificationCapabilityNote.textContent = 'This build uses native local notifications. Saved reminders are scheduled directly on the device instead of relying on the browser timer.';

    localNotifications.checkPermissions()
      .then(permissionStatus => {
        const permissionLabels = {
          granted: 'Granted',
          denied: 'Blocked',
          prompt: 'Not requested',
          'prompt-with-rationale': 'Needs request'
        };
        notificationPermissionStatus.textContent = permissionLabels[permissionStatus.display] || permissionStatus.display;
      })
      .catch(error => {
        console.error('Failed to check native notification permission:', error);
        notificationPermissionStatus.textContent = 'Permission check failed';
      });
    return;
  }

  if (!('Notification' in window)) {
    notificationPermissionStatus.textContent = 'Not supported in this browser';
    appInstallStatus.textContent = 'Browser tab only';
    notificationCapabilityNote.textContent = 'This browser does not support the Notifications API. Use a Chromium-based browser and install the app for the most reliable results.';
    return;
  }

  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const permission = Notification.permission;
  const permissionLabels = {
    granted: 'Granted',
    denied: 'Blocked',
    default: 'Not requested'
  };

  notificationPermissionStatus.textContent = permissionLabels[permission] || permission;
  appInstallStatus.textContent = isInstalled ? 'Installed app window' : 'Browser tab';
  notificationCapabilityNote.textContent = isInstalled
    ? 'Installed mode gives this scheduler the best chance to stay active, but browsers still cannot guarantee alarms after the app is fully closed.'
    : 'Install the app from the browser menu and keep notifications allowed. Browser-based reminders work best when the app stays installed and is opened regularly.';
}

function saveReminderFromForm() {
  const reminder = readReminderForm();
  if (!reminder) {
    return;
  }

  const existingIndex = reminderSchedules.findIndex(schedule => schedule.id === reminder.id);
  if (existingIndex >= 0) {
    const previousEnabled = reminderSchedules[existingIndex].enabled;
    reminder.enabled = previousEnabled;
    reminderSchedules[existingIndex] = reminder;
  } else {
    reminderSchedules.push(reminder);
  }

  saveReminderSchedules();
  renderReminderSchedules();
  resetReminderForm();
  syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));
}

function handleReminderListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const scheduleId = button.dataset.id;
  const scheduleIndex = reminderSchedules.findIndex(schedule => schedule.id === scheduleId);

  if (scheduleIndex === -1) {
    return;
  }

  if (action === 'edit') {
    populateReminderForm(scheduleId);
    showSection('reminders-section');
    return;
  }

  if (action === 'toggle') {
    reminderSchedules[scheduleIndex].enabled = !reminderSchedules[scheduleIndex].enabled;
    saveReminderSchedules();
    renderReminderSchedules();
    syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));
    return;
  }

  if (action === 'delete') {
    reminderSchedules.splice(scheduleIndex, 1);
    delete reminderMeta.deliveredOn[scheduleId];
    saveReminderSchedules();
    saveReminderMeta();
    renderReminderSchedules();
    syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));

    if (reminderEditId === scheduleId) {
      resetReminderForm();
    }
  }
}

async function testNotification() {
  if (hasNativeLocalNotifications()) {
    const permissionStatus = await requestNotificationPermission();
    if (permissionStatus !== 'granted') {
      alert('Allow notifications first so the app can send reminders.');
      return;
    }
  } else {
    if (Notification.permission === 'default') {
      await requestNotificationPermission();
    }

    if (Notification.permission !== 'granted') {
      alert('Allow notifications first so the app can send reminders.');
      return;
    }
  }

  await sendNotification('Test notification', 'Your reminder system is ready.', 'test-notification');
}

const notificationPermissionStatus = document.getElementById('notificationPermissionStatus');
const appInstallStatus = document.getElementById('appInstallStatus');
const notificationCapabilityNote = document.getElementById('notificationCapabilityNote');
const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
const testNotificationBtn = document.getElementById('testNotificationBtn');
const reminderNameInput = document.getElementById('reminderName');
const reminderTimeInput = document.getElementById('reminderTime');
const reminderTitleInput = document.getElementById('reminderTitle');
const reminderMessageInput = document.getElementById('reminderMessage');
const reminderDayInputs = Array.from(document.querySelectorAll('#reminderDays input'));
const saveReminderBtn = document.getElementById('saveReminderBtn');
const resetReminderFormBtn = document.getElementById('resetReminderFormBtn');
const remindersListEl = document.getElementById('remindersList');

let reminderSchedules = loadReminderSchedules();
let reminderMeta = loadReminderMeta();
let nativeReminderIds = loadNativeReminderIds();

saveReminderSchedules();
renderReminderSchedules();
resetReminderForm();
updateNotificationStatus();
syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));

enableNotificationsBtn.addEventListener('click', () => {
  requestNotificationPermission().catch(error => console.error('Permission request failed:', error));
});
testNotificationBtn.addEventListener('click', () => {
  testNotification().catch(error => console.error('Test notification failed:', error));
});
saveReminderBtn.addEventListener('click', saveReminderFromForm);
resetReminderFormBtn.addEventListener('click', resetReminderForm);
remindersListEl.addEventListener('click', handleReminderListClick);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateNotificationStatus();
    syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));
  }
});
window.addEventListener('focus', () => {
  updateNotificationStatus();
  syncReminderEngine().catch(error => console.error('Reminder sync failed:', error));
});
if (!hasNativeLocalNotifications()) {
  setInterval(() => {
    checkReminderSchedules().catch(error => console.error('Reminder check failed:', error));
  }, 60000);
}

// ==========================================
// SUPABASE SETUP & INITIALIZATION
// ==========================================

console.log("✅ script.js is loading...");
console.log("supabaseClient available?", typeof supabaseClient !== 'undefined');

// Helper function to log Supabase errors
function handleError(error, context = "") {
  if (error) {
    console.error(`Supabase error (${context}):`, error);
  }
}

// ==========================================
// AUTHENTICATION
// ==========================================

let currentUser = null;

function showApp() {
  const overlay = document.getElementById('auth-overlay');
  const logoutBtn = document.getElementById('logout-btn');
  if (overlay) overlay.style.display = 'none';
  if (logoutBtn) logoutBtn.style.display = '';
}

function showAuthScreen() {
  const overlay = document.getElementById('auth-overlay');
  const logoutBtn = document.getElementById('logout-btn');
  if (overlay) overlay.style.display = 'flex';
  if (logoutBtn) logoutBtn.style.display = 'none';
}

function resetAppState() {
  todos = {};
  budgetData = {};
  habits = {};
  diaryEntries = [];
  calendarEvents = {};
  renderTodos();
  renderBudget();
  renderHabits();
  renderCalendar();
  renderDiary([]);
}

async function initAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    showApp();
    await loadAllData();
  } else {
    showAuthScreen();
  }
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
      showApp();
      await loadAllData();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      resetAppState();
      showAuthScreen();
    }
  });
}

// Load all Supabase data for the current user
async function loadAllData() {
  if (!currentUser) return;
  console.log("Loading data from Supabase...");
  
  // Load todos
  const { data: todosData, error: todosError } = await supabaseClient
    .from("todos")
    .select("*")
    .order("created_at", { ascending: true });
  if (!todosError && todosData) {
    todos = {};
    todosData.forEach(item => {
      if (!todos[item.week_key]) {
        const weekTodos = Array(7).fill().map(() => []);
        weekTodos.general = [];
        todos[item.week_key] = weekTodos;
      }

      const targetBucket = item.day_index === -1
        ? todos[item.week_key].general
        : (todos[item.week_key][item.day_index] = todos[item.week_key][item.day_index] || []);

      targetBucket.push({
        id: item.id,
        text: item.text,
        note: item.note,
        done: item.done
      });
    });
    console.log("Todos loaded:", todos);
  }
  handleError(todosError, "loading todos");

  // Load budget
  const { data: budgetDataList, error: budgetError } = await supabaseClient
    .from("budget")
    .select("*");
  if (!budgetError && budgetDataList) {
    budgetData = {};
    budgetDataList.forEach(item => {
      // ensure expenses/extra have a `paid` boolean
      const expenses = (item.expenses || []).map(e => ({ name: e.name, amount: e.amount, paid: e.paid || false }));
      const extra = (item.extra || []).map(e => ({ name: e.name, amount: e.amount, paid: e.paid || false }));

      budgetData[item.month_key] = {
        id: item.id,
        income: item.income,
        expenses: expenses,
        savings: item.savings,
        extra: extra
      };
    });
    console.log("Budget loaded:", budgetData);
  }
  handleError(budgetError, "loading budget");

  // Load habits
  const { data: habitsData, error: habitsError } = await supabaseClient
    .from("habits")
    .select("*");
  if (!habitsError && habitsData) {
    habits = {};
    habitsData.forEach(item => {
      if (!habits[item.week_key]) {
        habits[item.week_key] = [];
      }
      habits[item.week_key].push({
        id: item.id,
        name: item.name,
        days: item.days || Array(7).fill(false)
      });
    });
    console.log("Habits loaded:", habits);
  }
  handleError(habitsError, "loading habits");

  // Load diary entries
  const { data: diaryData, error: diaryError } = await supabaseClient
    .from("diary_entries")
    .select("*")
    .order("date", { ascending: false });
  if (!diaryError && diaryData) {
    diaryEntries = diaryData;
    renderDiary(diaryEntries);
    console.log("Diary loaded:", diaryEntries);
  }
  handleError(diaryError, "loading diary");

  // Load calendar events
  const { data: calendarData, error: calendarError } = await supabaseClient
    .from("calendar_events")
    .select("*");
  if (!calendarError && calendarData) {
    calendarEvents = {};
    calendarData.forEach(item => {
      if (!calendarEvents[item.event_date]) {
        calendarEvents[item.event_date] = [];
      }
      calendarEvents[item.event_date].push({
        id: item.id,
        title: item.title,
        note: item.note
      });
    });
    console.log("Calendar events loaded:", calendarEvents);
  }
  handleError(calendarError, "loading calendar events");

  // Render initial UI
  renderTodos();
  renderBudget();
  renderHabits();
  renderCalendar();
}


// Section navigation
function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// show Motivation by default
showSection("motivation-section");

const todoDaysEl = document.getElementById("todoDays");
const weekLabel = document.getElementById("weekLabel");
const weekRangeLabel = document.getElementById("weekRangeLabel");

let todos = {};
let currentWeekOffset = 0;
const GENERAL_DAY_INDEX = -1;
const GENERAL_DAY_TITLE = "General (This Week)";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);

  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const week = Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);

  return `${year}-W${week}`;
}

function createWeekTodos() {
  const weekTodos = Array(7).fill().map(() => []);
  weekTodos.general = [];
  return weekTodos;
}

function ensureWeekTodos(weekKey) {
  if (!todos[weekKey]) {
    todos[weekKey] = createWeekTodos();
  }

  if (!Array.isArray(todos[weekKey].general)) {
    todos[weekKey].general = [];
  }

  return todos[weekKey];
}

function getDayTodos(weekKey, dayIndex) {
  const weekTodos = ensureWeekTodos(weekKey);
  return dayIndex === GENERAL_DAY_INDEX ? weekTodos.general : weekTodos[dayIndex];
}

function setDayTodos(weekKey, dayIndex, updatedTodos) {
  const weekTodos = ensureWeekTodos(weekKey);
  if (dayIndex === GENERAL_DAY_INDEX) {
    weekTodos.general = updatedTodos;
    return;
  }
  weekTodos[dayIndex] = updatedTodos;
}

function getWeekDateRange(offset = 0) {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - todayIndex + (offset * 7));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatShortDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function updateWeekHeader(weekKey) {
  weekLabel.textContent = weekKey;
  const { start, end } = getWeekDateRange(currentWeekOffset);
  if (weekRangeLabel) {
    weekRangeLabel.textContent = `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }
}

async function persistTodoDayOrder(weekKey, dayIndex) {
  const dayTodos = getDayTodos(weekKey, dayIndex);

  const { error: deleteError } = await supabaseClient
    .from("todos")
    .delete()
    .eq("week_key", weekKey)
    .eq("day_index", dayIndex);
  if (deleteError) {
    handleError(deleteError, "resetting todo day order");
    return false;
  }

  if (dayTodos.length === 0) {
    return true;
  }

  const payload = dayTodos.map(todo => ({
    user_id: currentUser.id,
    week_key: weekKey,
    day_index: dayIndex,
    text: todo.text,
    note: todo.note,
    done: todo.done
  }));

  const { data, error } = await supabaseClient
    .from("todos")
    .insert(payload)
    .select("id, text, note, done");

  if (error) {
    handleError(error, "saving reordered todos");
    return false;
  }

  if (Array.isArray(data)) {
    setDayTodos(weekKey, dayIndex, data.map(item => ({
      id: item.id,
      text: item.text,
      note: item.note,
      done: item.done
    })));
  }

  return true;
}

async function toggleTodoDone(todo) {
  todo.done = !todo.done;

  if (todo.id) {
    const { error } = await supabaseClient
      .from("todos")
      .update({ done: todo.done })
      .eq("id", todo.id);
    handleError(error, "updating todo status");
  }
}

async function moveTodo(weekKey, dayIndex, index, direction) {
  const dayTodos = getDayTodos(weekKey, dayIndex);
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= dayTodos.length) {
    return;
  }

  [dayTodos[index], dayTodos[targetIndex]] = [dayTodos[targetIndex], dayTodos[index]];
  const success = await persistTodoDayOrder(weekKey, dayIndex);
  if (!success) {
    [dayTodos[index], dayTodos[targetIndex]] = [dayTodos[targetIndex], dayTodos[index]];
  }

  renderTodos();
}

function renderTodos() {
  const weekKey = getWeekKey(currentWeekOffset);
  updateWeekHeader(weekKey);
  const weekTodos = ensureWeekTodos(weekKey);

  // CLEAR previous content
  todoDaysEl.innerHTML = "";

  const groupedTodos = [{
    dayTitle: GENERAL_DAY_TITLE,
    dayIndex: GENERAL_DAY_INDEX,
    dayTodos: weekTodos.general
  }].concat(days.map((day, dayIndex) => ({
    dayTitle: day,
    dayIndex,
    dayTodos: weekTodos[dayIndex]
  })));

  groupedTodos.forEach(({ dayTitle, dayIndex, dayTodos }) => {
    const dayEl = document.createElement("div");
    dayEl.className = "todo-day" + (dayIndex === GENERAL_DAY_INDEX ? " todo-general" : "");
    dayEl.innerHTML = `<h3 class="todo-day-title">${dayTitle}</h3>`;

    if (dayTodos.length === 0) {
      dayEl.innerHTML += `<div class="todo-day-empty">No tasks</div>`;
    }

    dayTodos.forEach((todo, index) => {
      const item = document.createElement("div");
      item.className = "todo-item" + (todo.done ? " done" : "");

      item.innerHTML = `
        <input class="todo-checkbox" type="checkbox" ${todo.done ? "checked" : ""}>
        <div class="todo-content">
          <span>${escapeHtml(todo.text)}</span>
          ${todo.note ? `<div class="todo-note">${escapeHtml(todo.note)}</div>` : ""}
        </div>
        <div class="todo-actions">
          <button type="button" class="todo-move" title="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="todo-move" title="Move down" ${index === dayTodos.length - 1 ? "disabled" : ""}>↓</button>
          <button type="button" class="todo-delete" title="Delete task">×</button>
        </div>
      `;

      const checkbox = item.querySelector(".todo-checkbox");
      const moveButtons = item.querySelectorAll(".todo-move");
      const deleteButton = item.querySelector(".todo-delete");

      checkbox.onchange = async () => {
        await toggleTodoDone(todo);
        renderTodos();
      };

      item.addEventListener("click", async (event) => {
        if (event.target.closest("button") || event.target.closest("input")) {
          return;
        }

        await toggleTodoDone(todo);
        renderTodos();
      });

      moveButtons[0].onclick = async () => {
        await moveTodo(weekKey, dayIndex, index, -1);
      };

      moveButtons[1].onclick = async () => {
        await moveTodo(weekKey, dayIndex, index, 1);
      };

      deleteButton.onclick = async () => {
        // Delete from Supabase
        if (todo.id) {
          const { error } = await supabaseClient
            .from("todos")
            .delete()
            .eq("id", todo.id);
          handleError(error, "deleting todo");
        }
        dayTodos.splice(index, 1);
        renderTodos();
      };

      dayEl.appendChild(item);
    });

    todoDaysEl.appendChild(dayEl);
  });
}

document.getElementById("addTodo").onclick = async () => {
  const text = todoText.value.trim();
  if (!text) return;

  const note = todoNote.value.trim();
  const day = Number(todoDay.value);
  const weekKey = getWeekKey(currentWeekOffset);

  ensureWeekTodos(weekKey);

  // Insert into Supabase immediately
  const { data, error } = await supabaseClient
    .from("todos")
    .insert([{
      user_id: currentUser.id,
      week_key: weekKey,
      day_index: day,
      text: text,
      note: note,
      done: false
    }])
    .select("id")
    .single();

  if (error) {
    console.error("❌ Failed to save todo:", error);
    alert("Failed to save task: " + error.message);
  } else {
    console.log("✅ Todo saved to Supabase!");
    // Add to local state
    getDayTodos(weekKey, day).push({
      id: data?.id,
      text,
      note,
      done: false
    });
    todoText.value = "";
    todoNote.value = "";
    renderTodos();
  }
};

document.getElementById("prevWeek").onclick = () => {
  currentWeekOffset--;
  renderTodos();
};

document.getElementById("nextWeek").onclick = () => {
  currentWeekOffset++;
  renderTodos();
};

document.getElementById("deleteWeek").onclick = async () => {
  if (!confirm("Delete all tasks for this week?")) return;

  const weekKey = getWeekKey(currentWeekOffset);
  
  // Delete all todos for this week from Supabase
  const { error } = await supabaseClient
    .from("todos")
    .delete()
    .eq("week_key", weekKey);
  handleError(error, "deleting week todos");
  
  delete todos[weekKey];
  renderTodos();
};

renderTodos();


// Monthly Budget
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const currentMonthSpan = document.getElementById("current-month");

const incomeInput = document.getElementById("income");
const expenseNameInput = document.getElementById("expense-name");
const expenseAmountInput = document.getElementById("expense-amount");
const addExpenseBtn = document.getElementById("add-expense");
const expenseList = document.getElementById("expense-list");

const savingsInput = document.getElementById("savings");
const leftAfterExpensesSpan = document.getElementById("left-after-expenses");
const leftAfterSavingsSpan = document.getElementById("left-after-savings");

const extraNameInput = document.getElementById("extra-name");
const extraAmountInput = document.getElementById("extra-amount");
const addExtraBtn = document.getElementById("add-extra");
const extraList = document.getElementById("extra-list");

const finalLeftSpan = document.getElementById("final-left");

const BUDGET_KEY = "monthly_budget_v1";

let budgetData = {};

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth()+1}`; // YYYY-M
}

let currentMonth = getMonthKey();

// Initialize current month if not exists
function initCurrentMonth() {
  if (!budgetData[currentMonth]) {
    budgetData[currentMonth] = {
      income: 0,
      expenses: [],
      savings: 0,
      extra: []
    };
  }
}

function updateMonthDisplay() {
  currentMonthSpan.textContent = currentMonth;
}

function saveBudget() {
  // Save to Supabase
  const monthData = budgetData[currentMonth];
  if (monthData.id) {
    // Update existing
    supabaseClient
      .from("budget")
      .update({
        income: monthData.income,
        expenses: monthData.expenses,
        savings: monthData.savings,
        extra: monthData.extra
      })
      .eq("id", monthData.id)
      .then(({ error }) => handleError(error, "updating budget"));
  } else {
    // Insert new
    supabaseClient
      .from("budget")
      .insert([{
        user_id: currentUser.id,
        month_key: currentMonth,
        income: monthData.income,
        expenses: monthData.expenses,
        savings: monthData.savings,
        extra: monthData.extra
      }])
      .then(({ data, error }) => {
        if (!error && data && data[0]) {
          monthData.id = data[0].id;
        }
        handleError(error, "inserting budget");
      });
  }
}

function changeMonth(offset) {
  let parts = currentMonth.split("-");
  let year = Number(parts[0]);
  let month = Number(parts[1]) + offset;

  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }

  currentMonth = `${year}-${month}`;
  if (!budgetData[currentMonth]) {
    budgetData[currentMonth] = { income:0, expenses:[], savings:0, extra:[] };
  }
  renderBudget();
}

prevMonthBtn.onclick = () => changeMonth(-1);
nextMonthBtn.onclick = () => changeMonth(1);

incomeInput.onchange = async () => {
  budgetData[currentMonth].income = Number(incomeInput.value) || 0;
  await saveBudget();
  renderBudget();
};

savingsInput.onchange = async () => {
  budgetData[currentMonth].savings = Number(savingsInput.value) || 0;
  await saveBudget();
  renderBudget();
};

addExpenseBtn.onclick = async () => {
  const name = expenseNameInput.value.trim();
  const amount = Number(expenseAmountInput.value);
  if (!name || !amount) return;

  budgetData[currentMonth].expenses.push({ name, amount, paid: false });
  expenseNameInput.value = "";
  expenseAmountInput.value = "";
  
  // Save to Supabase
  await saveBudget();
  renderBudget();
};

addExtraBtn.onclick = async () => {
  const name = extraNameInput.value.trim();
  const amount = Number(extraAmountInput.value);
  if (!name || !amount) return;

  budgetData[currentMonth].extra.push({ name, amount, paid: false });
  extraNameInput.value = "";
  extraAmountInput.value = "";
  
  // Save to Supabase
  await saveBudget();
  renderBudget();
};

function renderBudget() {
  updateMonthDisplay();
  
  // Initialize if doesn't exist
  if (!budgetData[currentMonth]) {
    budgetData[currentMonth] = {
      income: 0,
      expenses: [],
      savings: 0,
      extra: []
    };
  }
  
  const monthData = budgetData[currentMonth];

  incomeInput.value = monthData.income || 0;
  savingsInput.value = monthData.savings || 0;

  // Expenses
  expenseList.innerHTML = "";
  let totalExpenses = 0;
  monthData.expenses.forEach((e, i) => {
    const li = document.createElement("li");

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!e.paid;
    checkbox.dataset.index = i;

    const label = document.createElement('span');
    label.textContent = ` ${e.name}: ${e.amount}`;
    if (e.paid) label.style.textDecoration = 'line-through';

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.dataset.index = i;
    delBtn.className = 'small-delete';

    checkbox.onchange = async () => {
      e.paid = checkbox.checked;
      await saveBudget();
      renderBudget();
    };

    delBtn.onclick = async () => {
      monthData.expenses.splice(i, 1);
      await saveBudget();
      renderBudget();
    };

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    expenseList.appendChild(li);

    if (e.paid) totalExpenses += Number(e.amount) || 0;
  });

  // Left after expenses
  let leftAfterExpenses = monthData.income - totalExpenses;
  leftAfterExpensesSpan.textContent = leftAfterExpenses;

  // Left after savings
  let leftAfterSavings = leftAfterExpenses - monthData.savings;
  leftAfterSavingsSpan.textContent = leftAfterSavings;

  // Extra
  extraList.innerHTML = "";
  let totalExtra = 0;
  monthData.extra.forEach((e, i) => {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!e.paid;
    checkbox.dataset.index = i;

    const label = document.createElement('span');
    label.textContent = ` ${e.name}: ${e.amount}`;
    if (e.paid) label.style.textDecoration = 'line-through';

    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.dataset.index = i;
    delBtn.className = 'small-delete';

    checkbox.onchange = async () => {
      e.paid = checkbox.checked;
      await saveBudget();
      renderBudget();
    };

    delBtn.onclick = async () => {
      monthData.extra.splice(i, 1);
      await saveBudget();
      renderBudget();
    };

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    extraList.appendChild(li);

    if (e.paid) totalExtra += Number(e.amount) || 0;
  });

  // Final left
  finalLeftSpan.textContent = leftAfterSavings - totalExtra;
}

renderBudget();

// =======================
// HABITS
// =======================

const habitsTable = document.getElementById("habitsTable");
const habitsWeekLabel = document.getElementById("habitsWeekLabel");

let habits = {};
let habitsWeekOffset = 0;

const habitDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getHabitsWeekKey(offset = 0) {
  return getWeekKey(offset); // reuse from todo
}

function renderHabits() {
  const weekKey = getHabitsWeekKey(habitsWeekOffset);
  habitsWeekLabel.textContent = weekKey;

  if (!habits[weekKey]) {
    habits[weekKey] = [];
  }

  let html = `
    <table class="habits-table">
      <thead>
        <tr>
          <th>Habit</th>
          ${habitDays.map(d => `<th>${d}</th>`).join("")}
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  habits[weekKey].forEach((habit, hIndex) => {
    html += `
      <tr>
        <td>${habit.name}</td>
        ${habit.days.map((done, dIndex) => `
          <td>
            <input type="checkbox" ${done ? "checked" : ""} 
              data-h="${hIndex}" data-d="${dIndex}">
          </td>
        `).join("")}
        <td><button data-delete="${hIndex}">×</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  habitsTable.innerHTML = html;

  document.querySelectorAll("#habitsTable input").forEach(cb => {
    cb.onchange = async () => {
      const h = cb.dataset.h;
      const d = cb.dataset.d;
      const weekKey = getHabitsWeekKey(habitsWeekOffset);
      habits[weekKey][h].days[d] = cb.checked;
      
      // Update in Supabase
      const habitId = habits[weekKey][h].id;
      if (habitId) {
        const { error } = await supabaseClient
          .from("habits")
          .update({ days: habits[weekKey][h].days })
          .eq("id", habitId);
        handleError(error, "updating habit days");
      }
    };
  });

  document.querySelectorAll("#habitsTable button").forEach(btn => {
    btn.onclick = async () => {
      const index = btn.dataset.delete;
      const weekKey = getHabitsWeekKey(habitsWeekOffset);
      const habitId = habits[weekKey][index].id;
      
      // Delete from Supabase
      if (habitId) {
        const { error } = await supabaseClient
          .from("habits")
          .delete()
          .eq("id", habitId);
        handleError(error, "deleting habit");
      }
      
      habits[weekKey].splice(index, 1);
      saveHabits();
      renderHabits();
    };
  });
}

function saveHabits() {
  // Save to Supabase
  const weekKey = getHabitsWeekKey(habitsWeekOffset);
  if (!habits[weekKey]) return;
  
  habits[weekKey].forEach(habit => {
    if (habit.id) {
      // Update existing
      supabaseClient
        .from("habits")
        .update({
          name: habit.name,
          days: habit.days
        })
        .eq("id", habit.id)
        .then(({ error }) => handleError(error, "updating habit"));
    } else {
      // Insert new
      supabaseClient
        .from("habits")
        .insert([{
          user_id: currentUser.id,
          week_key: weekKey,
          name: habit.name,
          days: habit.days
        }])
        .then(({ data, error }) => {
          if (!error && data && data[0]) {
            habit.id = data[0].id;
          }
          handleError(error, "inserting habit");
        });
    }
  });
}

document.getElementById("addHabit").onclick = async () => {
  const name = habitName.value.trim();
  if (!name) return;

  const weekKey = getHabitsWeekKey(habitsWeekOffset);

  // Insert into Supabase immediately
  const { data, error } = await supabaseClient
    .from("habits")
    .insert([{
      user_id: currentUser.id,
      week_key: weekKey,
      name: name,
      days: Array(7).fill(false)
    }]);

  if (error) {
    console.error("❌ Failed to save habit:", error);
  } else {
    console.log("✅ Habit saved to Supabase!");
    habits[weekKey].push({
      name,
      days: Array(7).fill(false)
    });
    habitName.value = "";
    renderHabits();
  }
};

document.getElementById("habitsPrev").onclick = () => {
  habitsWeekOffset--;
  renderHabits();
};

document.getElementById("habitsNext").onclick = () => {
  habitsWeekOffset++;
  renderHabits();
};

document.getElementById("deleteHabitsWeek").onclick = async () => {
  if (!confirm("Delete all habits for this week?")) return;

  const weekKey = getHabitsWeekKey(habitsWeekOffset);
  
  // Delete all habits for this week from Supabase
  const { error } = await supabaseClient
    .from("habits")
    .delete()
    .eq("week_key", weekKey);
  handleError(error, "deleting week habits");
  
  delete habits[weekKey];
  saveHabits();
  renderHabits();
};

document.getElementById("copyHabitsFromPrevWeek").onclick = async () => {
  const currentWeekKey = getHabitsWeekKey(habitsWeekOffset);
  const prevWeekKey = getHabitsWeekKey(habitsWeekOffset - 1);
  
  console.log("Current week:", currentWeekKey);
  console.log("Previous week:", prevWeekKey);
  console.log("Previous week habits:", habits[prevWeekKey]);
  
  // Check if previous week has habits
  if (!habits[prevWeekKey] || habits[prevWeekKey].length === 0) {
    alert("No habits found in the previous week to copy!");
    return;
  }
  
  // Check if current week already has habits
  if (habits[currentWeekKey] && habits[currentWeekKey].length > 0) {
    if (!confirm("This week already has habits. Do you want to add the previous week's habits to it?")) {
      return;
    }
  }
  
  // Initialize current week if it doesn't exist
  if (!habits[currentWeekKey]) {
    habits[currentWeekKey] = [];
  }
  
  // Copy habit names from previous week (without the checked state)
  const prevHabits = habits[prevWeekKey];
  const existingHabitNames = habits[currentWeekKey].map(h => h.name);
  
  for (const prevHabit of prevHabits) {
    // Only add if habit doesn't already exist in current week
    if (!existingHabitNames.includes(prevHabit.name)) {
      const newHabit = {
        name: prevHabit.name,
        days: [false, false, false, false, false, false, false]
      };
      habits[currentWeekKey].push(newHabit);
      
      // Save to Supabase
      await supabaseClient
        .from("habits")
        .insert({
          user_id: currentUser.id,
          week_key: currentWeekKey,
          name: newHabit.name,
          days: Array(7).fill(false)
        });
    }
  }
  
  saveHabits();
  renderHabits();
  alert("Habits copied successfully!");
};

renderHabits();

/*******************************
 * Diary
 *******************************/

const diaryList = document.getElementById('diaryList');
const diaryDate = document.getElementById('diaryDate');
const diaryText = document.getElementById('diaryText');

let diaryEntries = [];

document.getElementById('saveDiary').addEventListener('click', saveDiary);
document.getElementById('searchDiary').addEventListener('click', searchDiary);

// PDF Guide hover functionality
const guideButton = document.querySelector('.guide-button');
const pdfPreview = document.querySelector('.pdf-preview');

if (guideButton && pdfPreview) {
  guideButton.addEventListener('mouseenter', () => {
    pdfPreview.classList.add('show');
  });

  guideButton.addEventListener('mouseleave', (e) => {
    // Check if mouse is moving to the preview
    setTimeout(() => {
      if (!pdfPreview.matches(':hover') && !guideButton.matches(':hover')) {
        pdfPreview.classList.remove('show');
      }
    }, 100);
  });

  pdfPreview.addEventListener('mouseleave', () => {
    pdfPreview.classList.remove('show');
  });
}

function saveDiary() {
  if (!diaryDate.value || !diaryText.value.trim()) return;

  const newEntry = {
    date: diaryDate.value,
    text: diaryText.value
  };

  // Save to Supabase
  supabaseClient
    .from('diary_entries')
    .insert([{ user_id: currentUser.id, ...newEntry }])
    .then(({ data, error }) => {
      if (error) {
        console.error("❌ Failed to save diary:", error);
      } else {
        console.log("✅ Diary entry saved!");
        diaryEntries.unshift(newEntry);
        diaryDate.value = '';
        diaryText.value = '';
        renderDiary(diaryEntries);
      }
    });
}

function renderDiary(entries) {
  diaryList.innerHTML = '';

  entries.forEach((entry, index) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div class="diary-entry">
        <div class="diary-date">${entry.date}</div>
        <div class="diary-text">${entry.text}</div>
        <button class="delete-diary" onclick="deleteDiary(${index})">
          Delete
        </button>
      </div>
    `;

    diaryList.appendChild(li);
  });
}

function searchDiary() {
  const searchValue = document.getElementById('searchDate').value;

  if (!searchValue) {
    renderDiary(diaryEntries);
    return;
  }

  const filtered = diaryEntries.filter(e => e.date === searchValue);
  renderDiary(filtered);
}

function deleteDiary(index) {
  const entry = diaryEntries[index];
  
  // Delete from Supabase
  if (entry.id) {
    supabaseClient
      .from('diary_entries')
      .delete()
      .eq('id', entry.id)
      .then(({ error }) => {
        handleError(error, "deleting diary entry");
      });
  }
  
  diaryEntries.splice(index, 1);
  renderDiary(diaryEntries);
}

// Load diary on page load
renderDiary(diaryEntries);


/*******************************
 * CALENDAR + EVENTS
 *******************************/

// ======================
// CALENDAR LOGIC
// ======================

const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');

let currentDate = new Date();

// Storage helpers
let calendarEvents = {};

function saveCalendarEvents(events) {
  // Events are saved automatically when modified
}

// Render calendar
function renderCalendar() {
  calendarGrid.innerHTML = '';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const events = calendarEvents;

  // Empty slots
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    cell.textContent = day;

    // Event dot
    if (events[dateStr]) {
      const dot = document.createElement('span');
      dot.className = 'event-dot';
      cell.appendChild(dot);
    }

    cell.addEventListener('click', () => showDayEvents(dateStr));
    calendarGrid.appendChild(cell);
  }
}

// Show events for a day
function showDayEvents(date) {
  const container = document.getElementById('calendarDiaryEntries');
  const events = calendarEvents;

  container.innerHTML = `<h4>${date}</h4>`;

  if (!events[date]) {
    container.innerHTML += '<p>No events</p>';
    return;
  }

  events[date].forEach((ev, index) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${ev.title}</strong>
      <p>${ev.note || ''}</p>
      <button onclick="deleteCalendarEvent('${date}', ${index})">Delete</button>
    `;
    container.appendChild(div);
  });
}

// Add event
document.getElementById('addEvent').addEventListener('click', () => {
  const date = document.getElementById('eventDate').value;
  const title = document.getElementById('eventTitle').value.trim();
  const note = document.getElementById('eventNote').value.trim();

  if (!date || !title) return;

  const newEvent = { title, note };

  // Save to Supabase
  supabaseClient
    .from('calendar_events')
    .insert([{
      user_id: currentUser.id,
      event_date: date,
      title: title,
      note: note
    }])
    .then(({ data, error }) => {
      if (error) {
        console.error("❌ Failed to save event:", error);
      } else {
        console.log("✅ Calendar event saved!");
        
        if (!calendarEvents[date]) calendarEvents[date] = [];
        calendarEvents[date].push(newEvent);

        document.getElementById('eventDate').value = '';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventNote').value = '';

        renderCalendar();
        showDayEvents(date);
      }
    });
});

function deleteCalendarEvent(date, index) {
  const event = calendarEvents[date][index];
  
  // Delete from Supabase
  if (event.id) {
    supabaseClient
      .from('calendar_events')
      .delete()
      .eq('id', event.id)
      .then(({ error }) => {
        handleError(error, "deleting calendar event");
      });
  }
  
  calendarEvents[date].splice(index, 1);
  if (calendarEvents[date].length === 0) {
    delete calendarEvents[date];
  }
  renderCalendar();
  showDayEvents(date);
}

// Month navigation
document.getElementById('prevMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById('nextMonth').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// Initial load
renderCalendar();

console.log("JS is running");

// ==========================================
// AUTH UI EVENTS
// ==========================================

function showAuthMessage(el, msg, isSuccess) {
  el.textContent = msg;
  el.style.display = 'block';
  el.style.padding = '8px 12px';
  el.style.borderRadius = '6px';
  el.style.fontSize = '0.875rem';
  el.style.background = isSuccess ? '#f0fdf4' : '#fef2f2';
  el.style.color = isSuccess ? '#16a34a' : '#dc2626';
  el.style.border = isSuccess ? '1px solid #86efac' : '1px solid #fca5a5';
}

document.getElementById('auth-login-btn').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';

  if (!email || !password) {
    showAuthMessage(errEl, 'Please enter your email and password.', false);
    return;
  }

  const loginBtn = document.getElementById('auth-login-btn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in\u2026';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Log in';
  if (error) showAuthMessage(errEl, error.message, false);
});

document.getElementById('auth-signup-btn').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error');
  errEl.style.display = 'none';

  if (!email || !password) {
    showAuthMessage(errEl, 'Please enter your email and password.', false);
    return;
  }
  if (password.length < 6) {
    showAuthMessage(errEl, 'Password must be at least 6 characters.', false);
    return;
  }

  const signupBtn = document.getElementById('auth-signup-btn');
  signupBtn.disabled = true;
  signupBtn.textContent = 'Creating account\u2026';

  const { error } = await supabaseClient.auth.signUp({ email, password });

  signupBtn.disabled = false;
  signupBtn.textContent = 'Create account';

  if (error) {
    showAuthMessage(errEl, error.message, false);
  } else {
    showAuthMessage(errEl, 'Account created! Check your email to confirm, then log in.', true);
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

initAuth();
