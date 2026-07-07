/**
 * Timetable Data Extraction & Application Logic
 * Data Source: Provided Image (SY BSc - CS Div A, Sem-IV 2026-27)
 */

const APP_DATA = {
    headerInfo: {
        class: "SY BSc - CS Div A",
        semester: "Semester-3 (2026-27)",
        teacher: "Dr. Anu Singha (AS)",
        strength: 48,
        room: "VY504",
        labs: "VY426, 528, 422"
    },
    subjects: [
        { code: "BSC10060", name: "Microcontroller", th: "Dr. Shital Rajapurkar (SR)", pr: "Dr. Shital Rajapurkar (SR)", credits: 4, type: "micro" },
        { code: "BSC20040", name: "OOP using C++", th: "Dr. Anu Singha (AS)", pr: "Dr. Anu Singha/Sidhnant B", credits: 4, type: "cpp" },
        { code: "BSC20050", name: "Web Technologies", th: "Dr. Deepali Shahane", pr: "Ms. Minakshee Bari", credits: 4, type: "wt" },
        { code: "BSC10080", name: "Lab on Python", th: "-", pr: "Dr. Barnali B/Dr. Mahesh Landge", credits: 2, type: "python" },
        { code: "BSC30310", name: "Data Analytics", th: "-", pr: "Dr. Mahesh Landge/Pavankumar P.", credits: 2, type: "da" },
        { code: "PEACE", name: "Peace", th: "-", pr: "-", credits: 0, type: "peace" }
    ],
    schedule: {
        1: [ // Monday
            { start: "09:00", end: "11:00", subject: "Micro Lab", faculty: "SP", room: "Lab 426", type: "micro" },
            { start: "12:00", end: "13:00", subject: "Peace", faculty: "-", room: "-", type: "peace" },
            { start: "13:00", end: "14:00", subject: "C++", faculty: "AS", room: "VY504", type: "cpp" },
            { start: "14:00", end: "16:00", subject: "DA Lab", faculty: "AK-RA", room: "Lab 426", type: "da" }
        ],
        2: [ // Tuesday
            { start: "09:00", end: "11:00", subject: "Micro Lab", faculty: "SP", room: "Lab 426", type: "micro" },
            { start: "12:00", end: "13:00", subject: "Peace", faculty: "-", room: "-", type: "peace" },
            { start: "13:00", end: "14:00", subject: "C++", faculty: "AS", room: "VY504", type: "cpp" },
            { start: "14:00", end: "16:00", subject: "WT Lab", faculty: "MB", room: "Lab 426", type: "wt" }
        ],
        3: [ // Wednesday
            { start: "09:00", end: "11:00", subject: "C++ Lab", faculty: "AS-PC", room: "Lab 426", type: "cpp" },
            { start: "12:00", end: "13:00", subject: "Micro", faculty: "SR", room: "VY504", type: "micro" },
            { start: "13:00", end: "14:00", subject: "WT", faculty: "DS", room: "VY504", type: "wt" },
            { start: "14:00", end: "16:00", subject: "Python Lab", faculty: "BB-ML", room: "Lab 527", type: "python" }
        ],
        4: [ // Thursday
            { start: "09:00", end: "11:00", subject: "Python Lab", faculty: "BB-ML", room: "Lab 426", type: "python" },
            { start: "12:00", end: "13:00", subject: "WT", faculty: "DS", room: "VY504", type: "wt" },
            { start: "13:00", end: "14:00", subject: "Micro", faculty: "SR", room: "VY504", type: "micro" },
            { start: "14:00", end: "16:00", subject: "DA Lab", faculty: "AK-", room: "Lab 528", type: "da" }
        ],
        5: [ // Friday
            { start: "11:00", end: "12:00", subject: "WT", faculty: "DS", room: "VY504", type: "wt" },
            { start: "12:00", end: "13:00", subject: "Micro", faculty: "SR", room: "VY504", type: "micro" },
            { start: "13:00", end: "14:00", subject: "C++", faculty: "AS", room: "VY504", type: "cpp" }
        ],
        6: [] // Saturday
    }
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentView = 'home';
let selectedDay = new Date().getDay();
if (selectedDay === 0) selectedDay = 1; // Default to Monday if Sunday

// DOM Elements
const mainContent = document.getElementById('main-content');
const appTitle = document.getElementById('app-title');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('theme-toggle');

// Initialize App
function init() {
    initTheme();
    startClock();
    renderView('home');
    setupNavigation();
    setupGestures();
}

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// --- Clock & Time Logic ---
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-date').innerText = `${DAYS[now.getDay()]}, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    // Update live progress if on a schedule view
    if (currentView === 'home' || currentView === 'schedule') {
        updateLiveClasses(now);
    }
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function updateLiveClasses(now) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const activeCards = document.querySelectorAll('.class-card');
    
    activeCards.forEach(card => {
        const start = timeToMinutes(card.dataset.start);
        const end = timeToMinutes(card.dataset.end);
        const badge = card.querySelector('.badge');
        const progressContainer = card.querySelector('.progress-container');
        const progressBar = card.querySelector('.progress-bar');
        const timeText = card.querySelector('.time-remaining');
        
        if (currentMins >= start && currentMins < end) {
            // Class is Active
            card.classList.add('active-class');
            if(badge) {
                badge.className = 'badge now';
                badge.innerText = 'NOW';
            }
            if (progressContainer) {
                progressContainer.style.display = 'block';
                const total = end - start;
                const elapsed = currentMins - start;
                const percentage = (elapsed / total) * 100;
                progressBar.style.width = `${percentage}%`;
                timeText.innerText = `${end - currentMins} min remaining`;
            }
        } else if (currentMins < start) {
            // Class is Upcoming
            card.classList.remove('active-class');
            if(progressContainer) progressContainer.style.display = 'none';
            if(badge) {
                badge.className = 'badge next';
                badge.innerText = 'UPCOMING';
            }
        } else {
            // Class is Completed
            card.classList.remove('active-class');
            card.style.opacity = '0.6';
            if(progressContainer) progressContainer.style.display = 'none';
            if(badge) {
                badge.className = 'badge completed';
                badge.innerText = 'DONE';
            }
        }
    });
}

// --- Views Rendering ---
function renderView(view) {
    currentView = view;
    mainContent.innerHTML = '';
    mainContent.className = 'fade-in';
    
    // Trigger reflow for animation
    void mainContent.offsetWidth;

    switch(view) {
        case 'home':
            appTitle.innerText = "Today";
            renderHome();
            break;
        case 'schedule':
            appTitle.innerText = "Weekly Schedule";
            renderSchedule();
            break;
        case 'subjects':
            appTitle.innerText = "Subjects";
            renderSubjects();
            break;
        case 'faculty':
            appTitle.innerText = "Faculty";
            renderFaculty();
            break;
    }
}

function renderHome() {
    // Header Info Card
    const infoHtml = `
        <div class="info-card">
            <h2>${APP_DATA.headerInfo.class}</h2>
            <div class="info-row"><span>Semester</span><span>${APP_DATA.headerInfo.semester}</span></div>
            <div class="info-row"><span>Class Teacher</span><span>${APP_DATA.headerInfo.teacher}</span></div>
            <div class="info-row"><span>Room / Labs</span><span>${APP_DATA.headerInfo.room} | ${APP_DATA.headerInfo.labs}</span></div>
        </div>
        <h2 style="margin-bottom: 12px; font-size: 20px;">Today's Classes</h2>
    `;
    mainContent.insertAdjacentHTML('beforeend', infoHtml);
    
    const today = new Date().getDay();
    const dayData = APP_DATA.schedule[today] || [];
    renderClassCards(dayData);
}

function renderSchedule() {
    // Render Day Selector
    let selectorHtml = `<div class="day-selector">`;
    for(let i=1; i<=6; i++) {
        const isActive = i === selectedDay ? 'active' : '';
        selectorHtml += `<button class="day-btn ${isActive}" data-day="${i}">${DAYS[i]}</button>`;
    }
    selectorHtml += `</div><div id="schedule-container"></div>`;
    mainContent.innerHTML = selectorHtml;

    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedDay = parseInt(e.target.dataset.day);
            updateScheduleContainer();
        });
    });
    
    updateScheduleContainer();
}

function updateScheduleContainer() {
    const container = document.getElementById('schedule-container');
    container.innerHTML = '';
    const dayData = APP_DATA.schedule[selectedDay];
    
    if(!dayData || dayData.length === 0) {
        container.innerHTML = `
            <div class="empty-state fade-in">
                <h1>🎉</h1>
                <p>No Classes Today. Enjoy your free time!</p>
            </div>
        `;
        return;
    }
    
    dayData.forEach(cls => {
        container.insertAdjacentHTML('beforeend', generateClassCardHTML(cls));
    });
    updateLiveClasses(new Date()); // force update colors based on time
}

function renderClassCards(dayData) {
    if(!dayData || dayData.length === 0) {
        mainContent.insertAdjacentHTML('beforeend', `
            <div class="empty-state">
                <h1>🎉</h1>
                <p>No Classes Today.</p>
            </div>
        `);
        return;
    }
    dayData.forEach(cls => {
        mainContent.insertAdjacentHTML('beforeend', generateClassCardHTML(cls));
    });
    updateLiveClasses(new Date());
}

function generateClassCardHTML(cls) {
    // Generate CSS Variable assignments for dynamic coloring
    const bgVar = `var(--color-${cls.type})`;
    const textVar = `var(--text-${cls.type})`;
    
    return `
        <div class="class-card" data-start="${cls.start}" data-end="${cls.end}" style="background-color: ${bgVar}; color: ${textVar}">
            <div class="card-header">
                <span class="subject-name">${cls.subject}</span>
                <span class="badge">...</span>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${cls.start} - ${cls.end}
                </div>
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${cls.faculty}
                </div>
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                    ${cls.room}
                </div>
            </div>
            <div class="progress-container" style="display:none;">
                <div class="progress-bar"></div>
                <div class="time-remaining"></div>
            </div>
        </div>
    `;
}

function renderSubjects() {
    let html = `<div style="margin-bottom: 20px;">`;
    APP_DATA.subjects.filter(s => s.code !== 'PEACE').forEach(sub => {
        html += `
            <div class="list-card fade-in">
                <div class="avatar" style="background: var(--color-${sub.type}); color: var(--text-${sub.type})">
                    ${sub.name.charAt(0)}
                </div>
                <div class="list-info" style="flex:1;">
                    <h3>${sub.name}</h3>
                    <p>Code: ${sub.code} | Credits: ${sub.credits}</p>
                    <p style="margin-top:4px;">Th: ${sub.th}</p>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    mainContent.innerHTML = html;
}

function renderFaculty() {
    // Extracted unique faculty from the sheet
    const faculty = [
        { name: "Dr. Shital Rajapurkar", init: "SR", subjects: "Microcontroller" },
        { name: "Dr. Anu Singha", init: "AS", subjects: "OOP using C++" },
        { name: "Dr. Deepali Shahane", init: "DS", subjects: "Web Technologies" },
        { name: "Ms. Minakshee Bari", init: "MB", subjects: "WT Lab" },
        { name: "Dr. Barnali B / Dr. Mahesh L.", init: "BB-ML", subjects: "Python Lab" },
        { name: "Pavankumar Patil / AK-RA", init: "AK", subjects: "Data Analytics Lab" }
    ];

    let html = `<div style="margin-bottom: 20px;">`;
    faculty.forEach(f => {
        html += `
            <div class="list-card fade-in">
                <div class="avatar">${f.init}</div>
                <div class="list-info">
                    <h3>${f.name}</h3>
                    <p>Handles: ${f.subjects}</p>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    mainContent.innerHTML = html;
}

// --- Navigation & Gestures ---
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            renderView(item.dataset.target);
        });
    });
}

function setupGestures() {
    let touchstartX = 0;
    let touchendX = 0;
    const threshold = 50;

    mainContent.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, {passive: true});

    mainContent.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        if (currentView !== 'schedule') return;
        
        if (touchendX < touchstartX - threshold) {
            // Swiped Left - Next Day
            selectedDay = selectedDay < 6 ? selectedDay + 1 : 1;
            updateScheduleTabs();
        }
        if (touchendX > touchstartX + threshold) {
            // Swiped Right - Previous Day
            selectedDay = selectedDay > 1 ? selectedDay - 1 : 6;
            updateScheduleTabs();
        }
    }
}

function updateScheduleTabs() {
    const btns = document.querySelectorAll('.day-btn');
    if (btns.length > 0) {
        btns.forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.day-btn[data-day="${selectedDay}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        updateScheduleContainer();
    }
}

// Boot
window.onload = init;