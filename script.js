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

// Initialize Supabase data on page load
(async () => {
  console.log("Loading data from Supabase...");
  
  // Load todos
  const { data: todosData, error: todosError } = await supabaseClient
    .from("todos")
    .select("*");
  if (!todosError && todosData) {
    todos = {};
    todosData.forEach(item => {
      if (!todos[item.week_key]) {
        todos[item.week_key] = Array(7).fill().map(() => []);
      }
      todos[item.week_key][item.day_index] = todos[item.week_key][item.day_index] || [];
      todos[item.week_key][item.day_index].push({
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
      budgetData[item.month_key] = {
        id: item.id,
        income: item.income,
        expenses: item.expenses || [],
        savings: item.savings,
        extra: item.extra || []
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
  initCurrentMonth();
  renderBudget();
  renderHabits();
  renderCalendar();
})();


// Section navigation
function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
}

// show To-Do by default
showSection("todo-section");

const todoDaysEl = document.getElementById("todoDays");
const weekLabel = document.getElementById("weekLabel");

let todos = {};
let currentWeekOffset = 0;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekKey(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);

  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const week = Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);

  return `${year}-W${week}`;
}

function renderTodos() {
  const weekKey = getWeekKey(currentWeekOffset);
  weekLabel.textContent = weekKey;

  if (!todos[weekKey]) {
    todos[weekKey] = Array(7).fill().map(() => []);
  }

  todos[weekKey].forEach((dayTodos, dayIndex) => {
    const dayEl = document.createElement("div");
    dayEl.className = "todo-day";
    dayEl.innerHTML = `<strong>${days[dayIndex]}</strong>`;

    dayTodos.forEach((todo, index) => {
      const item = document.createElement("div");
      item.className = "todo-item" + (todo.done ? " done" : "");

      item.innerHTML = `
        <input type="checkbox" ${todo.done ? "checked" : ""}>
        <div class="todo-content">
          <span>${todo.text}</span>
          ${todo.note ? `<div class="todo-note">${todo.note}</div>` : ""}
        </div>
        <button>×</button>
      `;

      item.querySelector("input").onchange = async () => {
        todo.done = !todo.done;
        // Update in Supabase
        if (todo.id) {
          const { error } = await supabaseClient
            .from("todos")
            .update({ done: todo.done })
            .eq("id", todo.id);
          handleError(error, "updating todo status");
        }
        renderTodos();
      };

      item.querySelector("button").onclick = async () => {
        // Delete from Supabase
        if (todo.id) {
          const { error } = await supabaseClient
            .from("todos")
            .delete()
            .eq("id", todo.id);
          handleError(error, "deleting todo");
        }
        dayTodos.splice(index, 1);
        saveTodos();
        renderTodos();
      };

      dayEl.appendChild(item);
    });

    todoDaysEl.appendChild(dayEl);
  });
}

async function saveTodos() {
  // Save to Supabase
  for (const weekKey in todos) {
    for (let dayIndex = 0; dayIndex < todos[weekKey].length; dayIndex++) {
      const dayTodos = todos[weekKey][dayIndex];
      for (const todo of dayTodos) {
        if (todo.id) {
          // Update existing
          const { error } = await supabaseClient
            .from("todos")
            .update({
              text: todo.text,
              note: todo.note,
              done: todo.done
            })
            .eq("id", todo.id);
          handleError(error, "updating todo");
        } else {
          // Insert new
          const { data, error } = await supabaseClient
            .from("todos")
            .insert([{
              week_key: weekKey,
              day_index: dayIndex,
              text: todo.text,
              note: todo.note,
              done: todo.done
            }]);
          if (!error && data && data[0]) {
            todo.id = data[0].id;
          }
          handleError(error, "inserting todo");
        }
      }
    }
  }
}

document.getElementById("addTodo").onclick = async () => {
  const text = todoText.value.trim();
  if (!text) return;

  const note = todoNote.value.trim();
  const day = Number(todoDay.value);
  const weekKey = getWeekKey(currentWeekOffset);

  // Insert into Supabase immediately
  const { data, error } = await supabaseClient
    .from("todos")
    .insert([{
      week_key: weekKey,
      day_index: day,
      text: text,
      note: note,
      done: false
    }], { count: 'estimated' });

  if (!error && data && data[0]) {
    // Add to local state with ID
    todos[weekKey][day].push({
      id: data[0].id,
      text,
      note,
      done: false
    });
    todoText.value = "";
    todoNote.value = "";
    renderTodos();
    console.log("✅ Todo saved to Supabase!");
  } else {
    console.error("❌ Failed to save todo:", error);
    alert("Failed to save task. Check console.");
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
  saveTodos();
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

  budgetData[currentMonth].expenses.push({ name, amount });
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

  budgetData[currentMonth].extra.push({ name, amount });
  extraNameInput.value = "";
  extraAmountInput.value = "";
  
  // Save to Supabase
  await saveBudget();
  renderBudget();
};

function renderBudget() {
  updateMonthDisplay();
  const monthData = budgetData[currentMonth];

  incomeInput.value = monthData.income || 0;
  savingsInput.value = monthData.savings || 0;

  // Expenses
  expenseList.innerHTML = "";
  let totalExpenses = 0;
  monthData.expenses.forEach((e, i) => {
    const li = document.createElement("li");
    li.textContent = `${e.name}: ${e.amount}`;
    expenseList.appendChild(li);
    totalExpenses += e.amount;
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
  monthData.extra.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.name}: ${e.amount}`;
    extraList.appendChild(li);
    totalExtra += e.amount;
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
      week_key: weekKey,
      name: name,
      days: Array(7).fill(false)
    }], { count: 'estimated' });

  if (!error && data && data[0]) {
    habits[weekKey].push({
      id: data[0].id,
      name,
      days: Array(7).fill(false)
    });
    habitName.value = "";
    renderHabits();
    console.log("✅ Habit saved to Supabase!");
  } else {
    console.error("❌ Failed to save habit:", error);
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

function saveDiary() {
  if (!diaryDate.value || !diaryText.value.trim()) return;

  const newEntry = {
    date: diaryDate.value,
    text: diaryText.value
  };

  // Save to Supabase
  supabaseClient
    .from('diary_entries')
    .insert([newEntry])
    .then(({ data, error }) => {
      if (!error && data && data[0]) {
        newEntry.id = data[0].id;
        diaryEntries.unshift(newEntry);
        diaryText.value = '';
        renderDiary(diaryEntries);
      }
      handleError(error, "saving diary entry");
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
      event_date: date,
      title: title,
      note: note
    }])
    .then(({ data, error }) => {
      if (!error && data && data[0]) {
        newEvent.id = data[0].id;
        
        if (!calendarEvents[date]) calendarEvents[date] = [];
        calendarEvents[date].push(newEvent);

        document.getElementById('eventTitle').value = '';
        document.getElementById('eventNote').value = '';

        renderCalendar();
        showDayEvents(date);
      }
      handleError(error, "adding calendar event");
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
