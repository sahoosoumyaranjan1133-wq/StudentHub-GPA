/**
 * ============================================================================
 * 1. DOM HELPERS & MULTI-USER STORAGE
 * ============================================================================
 */
const $ = (selector, root = document) => root.querySelector(selector); const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHTML(str) {
    const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str ?? '').replace(/[&<>"']/g, (ch) => escapeMap[ch]);
}

const USERS_KEY = 'studentHub_users_v2';
const SESSION_KEY = 'studentHub_session_v2';

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentEmail() {
    return localStorage.getItem(SESSION_KEY);
}

function createFreshUserData(name, email, password, program) {
    return {
        profile: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            program: program.trim() || 'General Studies',
            focus: 'Building consistency'
        },
        studyHours: 0,
        quizScores: [],
        tasks: [
            { id: Date.now() + 1, name: 'Add your subjects in Attendance Tracker', time: '2 min', done: false, tag: 'First Step' },
            { id: Date.now() + 2, name: 'Save your first study note in Notes Library', time: '5 min', done: false, tag: 'First Step' }
        ],
        notes: [],
        assignments: [],
        attendance: [],
        posts: [],
        resume: { name: name.trim(), skills: '', project: '' },
        widgets: { attendance: true, studyTime: true, tasks: true, quiz: true }
    };
}

let currentUser = null;

function saveCurrentUser() {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser.profile.email] = currentUser;
    saveUsers(users);
}

/**
 * ============================================================================
 * 2. AUTHENTICATION (SIGN UP, LOG IN, LOG OUT)
 * ============================================================================
 */
const authScreen = $('#authScreen');
const appShell = $('#appShell');
const signupForm = $('#signupForm');
const loginForm = $('#loginForm');
const tabSignup = $('#tabSignup');
const tabLogin = $('#tabLogin');

tabSignup?.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#signupName').value.trim();
    const email = $('#signupEmail').value.trim().toLowerCase();
    const password = $('#signupPassword').value;
    const program = $('#signupProgram').value.trim();
    const errorEl = $('#signupError');

    const users = getUsers();
    if (users[email]) {
        errorEl.textContent = 'An account with this email already exists. Please log in.';
        return;
    }

    const newUser = createFreshUserData(name, email, password, program);
    users[email] = newUser;
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, email);

    currentUser = newUser;
    signupForm.reset();
    errorEl.textContent = '';
    enterWorkspace(`Welcome to StudentHub, ${currentUser.profile.name}!`);
});

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim().toLowerCase();
    const password = $('#loginPassword').value;
    const errorEl = $('#loginError');

    const users = getUsers();
    const user = users[email];

    if (!user || user.profile.password !== password) {
        errorEl.textContent = 'Invalid email or password. Please try again.';
        return;
    }

    localStorage.setItem(SESSION_KEY, email);
    currentUser = user;
    loginForm.reset();
    errorEl.textContent = '';
    enterWorkspace(`Welcome back, ${currentUser.profile.name}!`);
});

function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    if ($('#modal')?.open) $('#modal').close();
    appShell.classList.add('hidden');
    authScreen.classList.remove('hidden');
    toast('Logged out safely');
}

function enterWorkspace(welcomeToast) {
    authScreen.classList.add('hidden');
    appShell.classList.remove('hidden');
    refreshEntireDashboard();
    if (welcomeToast) toast(welcomeToast);
}

/**
 * ============================================================================
 * 3. DASHBOARD RENDERING (STATS, TASKS, NOTES, DEADLINES)
 * ============================================================================
 */
function getGreeting() {
    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return `${salutation}, ${currentUser ? currentUser.profile.name : 'Student'}`;
}

function refreshEntireDashboard() {
    if (!currentUser) return;
    const initial = (currentUser.profile.name[0] || 'S').toUpperCase();

    $('#sidebarAvatar').textContent = initial;
    $('#topAvatar').textContent = initial;
    $('#sidebarUserName').textContent = currentUser.profile.name;
    $('#sidebarUserProgram').textContent = currentUser.profile.program;
    $('#aiGreeting').textContent = `Hey ${currentUser.profile.name}! What are we learning today?`;

    updateHeaderView('overview');
    renderStats();
    renderTasks();
    renderResourcesPanel();
    renderDeadlinesPanel();
}

function updateHeaderView(view) {
    const titles = {
        overview: [getGreeting(), 'Your personal dashboard updates live as you study.'],
        study: ['AI Study Assistant', 'Break down concepts, generate study plans, and save notes.'],
        notes: ['Notes Library', 'Organize and search your personal study notes.'],
        planner: ['Study Planner', 'Add tasks and stay focused on today’s priorities.'],
        attendance: ['Attendance Tracker', 'Track every class and stay above your attendance target.'],
        assignments: ['Assignments', 'Keep upcoming submission deadlines under control.'],
        placement: ['Placement Preparation', 'Practice technical and aptitude questions interactively.'],
        resume: ['Resume Builder', 'Generate a clean resume summary from your skills and projects.'],
        community: ['Student Community', 'Share study tips, questions, and project updates.']
    };
    const [title, sub] = titles[view] || titles.overview;
    $('#breadcrumbTitle').textContent = view === 'overview' ? 'Overview' : title;
    $('#pageTitle').textContent = title;
    $('#pageSubtitle').textContent = sub;
}

function renderStats() {
    // 1. Attendance Stat
    const totals = currentUser.attendance.reduce(
        (acc, item) => ({ attended: acc.attended + item.attended, total: acc.total + item.total }),
        { attended: 0, total: 0 }
    );
    const attPct = totals.total > 0 ? Math.round((totals.attended / totals.total) * 100) : 0;
    $('#statAttendanceVal').innerHTML = `${attPct}<span>%</span>`;
    $('#statAttendanceSub').textContent = totals.total > 0
        ? `${totals.attended}/${totals.total} classes attended`
        : 'Click to add subjects';
    $('#statAttendanceBar').style.width = `${attPct}%`;

    // 2. Study Time Stat (Goal: 20 hrs/week)
    const hrs = Number(currentUser.studyHours || 0).toFixed(1).replace(/\.0$/, '');
    const studyPct = Math.min(100, Math.round((currentUser.studyHours / 20) * 100));
    $('#statStudyVal').innerHTML = `${hrs}<span class="unit"> hrs</span>`;
    $('#statStudyBar').style.width = `${studyPct}%`;

    // 3. Tasks Stat
    const totalTasks = currentUser.tasks.length;
    const doneTasks = currentUser.tasks.filter((t) => t.done).length;
    const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    $('#statTasksVal').innerHTML = `${doneTasks}<span class="muted-value">/${totalTasks}</span>`;
    $('#statTasksSub').textContent = `${taskPct}%`;
    $('#statTasksBar').style.width = `${taskPct}%`;

    // 4. Quiz Average Stat
    const scores = currentUser.quizScores || [];
    const quizAvg = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    $('#statQuizVal').innerHTML = `${quizAvg}<span>%</span>`;
    $('#statQuizSub').textContent = scores.length > 0
        ? `Across ${scores.length} quiz(zes)`
        : 'Click to take a quick quiz';
    $('#statQuizBar').style.width = `${quizAvg}%`;

    // Hero floating badges
    $('#heroNoteCount').textContent = `${currentUser.notes.length} saved note(s)`;
    $('#heroTaskStatus').textContent = totalTasks ? `${doneTasks}/${totalTasks} tasks done` : 'Add your first task';
}

function renderTasks() {
    const list = $('#taskList');
    list.innerHTML = '';

    const total = currentUser.tasks.length;
    const done = currentUser.tasks.filter((t) => t.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    $('.progress-ring').style.background = `conic-gradient(#8170e9 0 ${pct}%, #efedfa ${pct}% 100%)`;
    $('#ringCount').textContent = `${done}/${total}`;
    $('#focusHeadline').textContent = pct === 100 && total > 0 ? 'All tasks complete! 🎉' : "Today's progress";
    $('#focusSubtext').textContent = total
        ? `You've completed ${done} of ${total} tasks planned (${pct}%).`
        : 'Your task list is empty. Add a task below to begin!';

    currentUser.tasks.forEach((task) => {
        const label = document.createElement('label');
        label.className = `task ${task.done ? 'done' : ''}`;
        label.innerHTML = `
      <input type="checkbox" ${task.done ? 'checked' : ''} />
      <span class="check"></span>
      <span class="task-name">
        <b>${escapeHTML(task.name)}</b>
        <small>${escapeHTML(task.tag || 'Study task')}</small>
      </span>
      <span class="task-time">${escapeHTML(task.time)}</span>
    `;
        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', () => {
            task.done = checkbox.checked;
            saveCurrentUser();
            renderTasks();
            renderStats();
        });
        list.appendChild(label);
    });
}

function renderResourcesPanel() {
    const container = $('#resourceList');
    if (!currentUser.notes.length) {
        container.innerHTML = `
      <div class="empty-state-box">
        No study notes saved yet.<br/>
        <button type="button" class="inline-link" id="emptyAddNoteBtn" style="margin-top:6px;">+ Create your first note →</button>
      </div>`;
        $('#emptyAddNoteBtn')?.addEventListener('click', () => openFeature('notes'));
        return;
    }

    container.innerHTML = currentUser.notes.slice(0, 3).map((note) => `
    <button class="resource" data-note-id="${note.id}">
      <span class="resource-icon db">▤</span>
      <span><b>${escapeHTML(note.title)}</b><small>${escapeHTML(note.content || 'Personal note')} · ${escapeHTML(note.date)}</small></span>
      <span class="resource-arrow">↗</span>
    </button>
  `).join('');

    $$('.resource[data-note-id]', container).forEach((btn) => {
        btn.addEventListener('click', () => openFeature('notes'));
    });
}

function renderDeadlinesPanel() {
    const container = $('#deadlineList');
    if (!currentUser.assignments.length) {
        container.innerHTML = `
      <div class="empty-state-box">
        No upcoming deadlines.<br/>
        <button type="button" class="inline-link" id="emptyAddAssignBtn" style="margin-top:6px;">+ Add an assignment deadline →</button>
      </div>`;
        $('#emptyAddAssignBtn')?.addEventListener('click', () => openFeature('assignments'));
        return;
    }

    container.innerHTML = currentUser.assignments.slice(0, 3).map((a) => {
        const dateObj = new Date(a.due + 'T00:00:00');
        const day = isNaN(dateObj) ? '—' : String(dateObj.getDate()).padStart(2, '0');
        const month = isNaN(dateObj) ? 'DUE' : dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        return `
      <div class="deadline">
        <div class="date-box date-blue"><b>${day}</b><small>${month}</small></div>
        <div class="deadline-info"><b>${escapeHTML(a.title)}</b><small>${escapeHTML(a.subject || 'Assignment')} · Due ${escapeHTML(a.due)}</small></div>
        <span class="deadline-dot blue-dot"></span>
      </div>`;
    }).join('');
}

/**
 * ============================================================================
 * 4. MODAL, TOAST & INTERACTIVE WORKSPACE TOOLS
 * ============================================================================
 */
const modal = $('#modal');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');

function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function showModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    if (!modal.open) modal.showModal();
    bindModalDynamicEvents();
}

const QUIZ_BANK = [
    { q: 'Which data structure operates on a First-In, First-Out (FIFO) basis?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
    { q: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'System Question Language', 'Standard Query Loop'], answer: 0 },
    { q: 'Which HTTP status code indicates a successful GET request?', options: ['404', '500', '200', '301'], answer: 2 }
];

function openFeature(view) {
    switch (view) {
        case 'study':
            showModal(
                'AI Study Assistant',
                `<p>Enter any concept or subject to generate an active-recall study card.</p>
         <form id="featureChat">
           <label>What topic are you studying?</label>
           <textarea id="featureQuestion" rows="3" required placeholder="e.g. Recursion, ACID Properties in DBMS, Pointers..."></textarea>
           <button type="submit" class="modal-submit">Generate Study Breakdown</button>
         </form>`
            );
            break;

        case 'notes':
            renderNotesModal();
            break;

        case 'planner':
            showModal(
                'Study Planner',
                `<p>Add a task to Today’s focus list.</p>
         <form id="plannerForm">
           <label>Task title</label>
           <input id="plannerTask" required placeholder="e.g. Complete DBMS Unit 1 notes" />
           <label>Scheduled time or duration</label>
           <input id="plannerTime" placeholder="e.g. 6:00 PM · 45 min" />
           <button type="submit" class="modal-submit">Add to Today's Focus</button>
         </form>`
            );
            break;

        case 'attendance':
            renderAttendanceModal();
            break;

        case 'assignments':
            renderAssignmentsModal();
            break;

        case 'placement':
            openQuizModal();
            break;

        case 'resume':
            showModal(
                'Resume Builder',
                `<form id="resumeForm">
           <label>Full Name</label>
           <input id="resumeName" required value="${escapeHTML(currentUser.resume.name || currentUser.profile.name)}" />
           <label>Program / Degree</label>
           <input id="resumeProgram" required value="${escapeHTML(currentUser.profile.program)}" />
           <label>Core Technical Skills</label>
           <input id="resumeSkills" required value="${escapeHTML(currentUser.resume.skills)}" placeholder="e.g. Java, SQL, HTML/CSS, Git" />
           <label>Featured Project</label>
           <input id="resumeProject" required value="${escapeHTML(currentUser.resume.project)}" placeholder="e.g. StudentHub Workspace — Built an interactive web app" />
           <button type="submit" class="modal-submit">Generate &amp; Save Resume Preview</button>
         </form>`
            );
            break;

        case 'community':
            renderCommunityModal();
            break;
    }
}

function renderNotesModal(filter = '') {
    const matches = currentUser.notes.filter((n) =>
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(filter.toLowerCase())
    );

    const listHTML = matches.length
        ? matches.map((n) => `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:8px 0; border-bottom:1px solid #eee; gap:8px;">
          <div>
            <b>📘 ${escapeHTML(n.title)}</b> <small style="opacity:0.65;">(${escapeHTML(n.date)})</small><br/>
            <small>${escapeHTML(n.content)}</small>
          </div>
          <button type="button" class="del-note" data-id="${n.id}" style="border:none;background:none;color:#d9534f;cursor:pointer;">✕</button>
        </div>`).join('')
        : '<em>No notes found. Add your first note below!</em>';

    showModal(
        'Notes Library',
        `<input id="noteSearch" value="${escapeHTML(filter)}" placeholder="Search notes..." style="margin-bottom:10px;" />
     <div class="answer-box" style="max-height:170px; overflow-y:auto; margin-bottom:12px;">${listHTML}</div>
     <form id="addNoteForm">
       <label>Note Title</label>
       <input id="noteTitle" required placeholder="e.g. Operating Systems — Deadlock Conditions" />
       <label>Key Summary / Formula</label>
       <textarea id="noteContent" rows="2" required placeholder="Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait"></textarea>
       <button type="submit" class="modal-submit">Save Note</button>
     </form>`
    );
}

function renderAttendanceModal() {
    const rows = currentUser.attendance.length
        ? currentUser.attendance.map((s) => {
            const pct = s.total ? Math.round((s.attended / s.total) * 100) : 0;
            return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
            <div>
              <b>${escapeHTML(s.subject)}</b><br/>
              <small>${pct}% (${s.attended}/${s.total} classes)</small>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="suggestion att-act" data-id="${s.id}" data-act="present">+ Present</button>
              <button type="button" class="suggestion att-act" data-id="${s.id}" data-act="absent">+ Absent</button>
            </div>
          </div>`;
        }).join('')
        : '<em>No subjects tracked yet. Add your first subject below!</em>';

    showModal(
        'Attendance Tracker',
        `<div class="answer-box" style="max-height:190px; overflow-y:auto; margin-bottom:12px;">${rows}</div>
     <form id="addSubjectForm">
       <label>Add a subject</label>
       <input id="subjectName" required placeholder="e.g. Mathematics, Data Structures, Java" />
       <button type="submit" class="modal-submit">Add Subject</button>
     </form>`
    );
}

function renderAssignmentsModal() {
    const listHTML = currentUser.assignments.length
        ? currentUser.assignments.map((a) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
          <div>
            <b>📌 ${escapeHTML(a.title)}</b><br/>
            <small>${escapeHTML(a.subject)} · Due ${escapeHTML(a.due)}</small>
          </div>
          <button type="button" class="suggestion done-assign" data-id="${a.id}">✓ Complete</button>
        </div>`).join('')
        : '<em>No upcoming deadlines! Add an assignment below.</em>';

    showModal(
        'Assignments & Deadlines',
        `<div class="answer-box" style="max-height:170px; overflow-y:auto; margin-bottom:12px;">${listHTML}</div>
     <form id="assignmentForm">
       <label>Assignment Title</label>
       <input id="assignTitle" required placeholder="e.g. Lab Experiment 4" />
       <label>Subject</label>
       <input id="assignSubject" required placeholder="e.g. Web Technology" />
       <label>Due Date</label>
       <input id="assignDue" type="date" required />
       <button type="submit" class="modal-submit">Save Deadline</button>
     </form>`
    );
}

function openQuizModal() {
    const questionsHTML = QUIZ_BANK.map((item, idx) => `
    <div style="margin-bottom:14px;">
      <b>Q${idx + 1}. ${escapeHTML(item.q)}</b>
      <div style="margin-top:6px; display:grid; gap:4px;">
        ${item.options.map((opt, oIdx) => `
          <label style="font-weight:normal; display:flex; align-items:center; gap:6px;">
            <input type="radio" name="q_${idx}" value="${oIdx}" required style="width:auto;" /> ${escapeHTML(opt)}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

    showModal(
        'Quick Placement & Concept Quiz',
        `<p>Complete this 3-question check to update your dashboard Quiz Average.</p>
     <form id="quizForm">
       <div class="answer-box" style="max-height:240px; overflow-y:auto; margin-bottom:12px;">${questionsHTML}</div>
       <button type="submit" class="modal-submit">Submit Quiz</button>
     </form>`
    );
}

function renderCommunityModal() {
    const postsHTML = currentUser.posts.length
        ? currentUser.posts.map((p) => `
        <div style="padding:8px 0; border-bottom:1px solid #eee;">
          <b>${escapeHTML(p.author)}</b> <small style="opacity:0.65;">· ${escapeHTML(p.time)}</small><br/>
          ${escapeHTML(p.text)}
        </div>`).join('')
        : '<em>No posts yet. Share your first study update or question below!</em>';

    showModal(
        'Student Community',
        `<div class="answer-box" style="max-height:170px; overflow-y:auto; margin-bottom:12px;">${postsHTML}</div>
     <form id="communityForm">
       <label>Your post or question</label>
       <textarea id="communityText" rows="2" required placeholder="Share a tip, milestone, or question..."></textarea>
       <button type="submit" class="modal-submit">Publish Post</button>
     </form>`
    );
}

function buildAIResponseHTML(topic) {
    const clean = escapeHTML(topic);
    return `
    <div class="answer-box">
      <b>✦ Active Study Breakdown: ${clean}</b><br/><br/>
      <b>1. Core Concept in 1 Sentence:</b><br/>
      Define <i>${clean}</i> in your own words as if explaining it to a classmate.<br/><br/>
      <b>2. Key Mechanism / Example:</b><br/>
      Write down one practical example, diagram, or short code snippet that uses <i>${clean}</i>.<br/><br/>
      <b>3. Exam / Interview Check:</b><br/>
      Why do we use <i>${clean}</i> instead of its alternative, and what is its main trade-off?
    </div>
    <div class="suggestions" style="margin-top:12px;">
      <button type="button" class="suggestion" id="aiSaveNote" data-topic="${clean}">📘 Save to Notes Library</button>
      <button type="button" class="suggestion" id="aiAddTask" data-topic="${clean}">＋ Add to Today's Tasks</button>
    </div>
  `;
}

/**
 * ============================================================================
 * 5. DYNAMIC MODAL EVENT LISTENERS
 * ============================================================================
 */
function bindModalDynamicEvents() {
    // AI Study Assistant inside Modal
    $('#featureChat')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = $('#featureQuestion').value.trim();
        if (!topic) return;
        showModal('AI Study Guide', buildAIResponseHTML(topic));
    });

    $('#aiSaveNote')?.addEventListener('click', (e) => {
        const topic = e.currentTarget.dataset.topic;
        currentUser.notes.unshift({
            id: Date.now(),
            title: topic,
            content: 'Saved from AI Study Assistant — Review definition, example, and trade-offs.',
            date: new Date().toLocaleDateString()
        });
        saveCurrentUser();
        refreshEntireDashboard();
        modal.close();
        toast('Saved to your Notes Library!');
    });

    $('#aiAddTask')?.addEventListener('click', (e) => {
        const topic = e.currentTarget.dataset.topic;
        currentUser.tasks.push({ id: Date.now(), name: `Revise: ${topic}`, time: '30 min', done: false, tag: 'AI Study Plan' });
        saveCurrentUser();
        refreshEntireDashboard();
        modal.close();
        toast('Added to Today’s Focus!');
    });

    // Planner Add Task
    $('#plannerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#plannerTask').value.trim();
        const time = $('#plannerTime').value.trim() || 'Today';
        currentUser.tasks.push({ id: Date.now(), name, time, done: false, tag: 'Personal task' });
        saveCurrentUser();
        refreshEntireDashboard();
        modal.close();
        toast('Task added!');
    });

    // Notes Search, Add, Delete
    $('#noteSearch')?.addEventListener('input', (e) => renderNotesModal(e.target.value));

    $('#addNoteForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.notes.unshift({
            id: Date.now(),
            title: $('#noteTitle').value.trim(),
            content: $('#noteContent').value.trim(), date: new Date().toLocaleDateString()
        }); saveCurrentUser(); refreshEntireDashboard(); renderNotesModal(); toast('Note added!');
    }); $$('.del-note', modalBody).forEach((btn) => {
        btn.addEventListener('click', () => {
            currentUser.notes = currentUser.notes.filter((n) => n.id !== Number(btn.dataset.id));
            saveCurrentUser();
            refreshEntireDashboard();
            renderNotesModal();
        });
    });

    // Attendance Add Subject & Mark Present/Absent
    $('#addSubjectForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.attendance.push({
            id: Date.now(),
            subject: $('#subjectName').value.trim(), attended: 0, total: 0
        }); saveCurrentUser(); refreshEntireDashboard(); renderAttendanceModal(); toast('Subject added!');
    }); $$('.att-act', modalBody).forEach((btn) => {
        btn.addEventListener('click', () => {
            const sub = currentUser.attendance.find((s) => s.id === Number(btn.dataset.id));
            if (!sub) return;
            sub.total += 1;
            if (btn.dataset.act === 'present') sub.attended += 1;
            saveCurrentUser();
            refreshEntireDashboard();
            renderAttendanceModal();
        });
    });

    // Assignments Add & Complete
    $('#assignmentForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.assignments.push({
            id: Date.now(),
            title: $('#assignTitle').value.trim(),
            subject: $('#assignSubject').value.trim(),
            due: $('#assignDue').value
        }); saveCurrentUser(); refreshEntireDashboard(); renderAssignmentsModal(); toast('Deadline added!');
    }); $$('.done-assign', modalBody).forEach((btn) => {
        btn.addEventListener('click', () => {
            currentUser.assignments = currentUser.assignments.filter((a) => a.id !== Number(btn.dataset.id));
            saveCurrentUser();
            refreshEntireDashboard();
            renderAssignmentsModal();
            toast('Assignment marked complete!');
        });
    });

    // Quiz Submission
    $('#quizForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let correct = 0;
        QUIZ_BANK.forEach((item, idx) => {
            const selected = $(`input[name="q_${idx}"]:checked`, modalBody);
            if (selected && Number(selected.value) === item.answer) correct += 1;
        });
        const scorePct = Math.round((correct / QUIZ_BANK.length) * 100);
        currentUser.quizScores.push(scorePct);
        saveCurrentUser();
        refreshEntireDashboard();
        showModal(
            'Quiz Results 🎉',
            `<div class="answer-box">
         You scored <b>${scorePct}%</b> (${correct} of ${QUIZ_BANK.length} correct)!<br/><br/>
         Your dashboard Quiz Average has been updated automatically.
       </div>`
        );
    });

    // Study Time Logger
    $('#studyTimeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const added = parseFloat($('#studyHoursInput').value) || 0;
        if (added > 0) {
            currentUser.studyHours = Number((currentUser.studyHours + added).toFixed(1));
            saveCurrentUser();
            refreshEntireDashboard();
            modal.close();
            toast(`Logged ${added} hour(s) of study!`);
        }
    });

    // Resume Builder
    $('#resumeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.profile.program = $('#resumeProgram').value.trim();
        currentUser.resume = {
            name: $('#resumeName').value.trim(),
            skills: $('#resumeSkills').value.trim(),
            project: $('#resumeProject').value.trim()
        };
        saveCurrentUser();
        refreshEntireDashboard();
        showModal(
            'Resume Preview',
            `<div class="answer-box">
         <b style="font-size:1.1rem;">${escapeHTML(currentUser.resume.name)}</b><br/>
         <small>${escapeHTML(currentUser.profile.program)} · ${escapeHTML(currentUser.profile.email)}</small>
         <hr style="margin:8px 0; opacity:0.2;"/>
         <b>Skills:</b> ${escapeHTML(currentUser.resume.skills)}<br/><br/>
         <b>Key Project:</b> ${escapeHTML(currentUser.resume.project)}
       </div>`
        );
    });

    // Community Post
    $('#communityForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.posts.unshift({
            author: currentUser.profile.name,
            text: $('#communityText').value.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        saveCurrentUser();
        renderCommunityModal();
        toast('Posted to Community!');
    });

    // Profile Update & Logout
    $('#profileEditForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.profile.name = $('#editName').value.trim() || currentUser.profile.name;
        currentUser.profile.program = $('#editProgram').value.trim() || currentUser.profile.program;
        saveCurrentUser();
        refreshEntireDashboard();
        modal.close();
        toast('Profile updated!');
    });

    $('#logoutBtn')?.addEventListener('click', logoutUser);
}

/**
 * ============================================================================
 * 6. GLOBAL NAVIGATION & MAIN LISTENERS
 * ============================================================================
 */
$('#closeModal')?.addEventListener('click', () => modal.close());
modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
});

$$('[data-view]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault(); const view = btn.dataset.view; $$
            ('.nav-item').forEach((nav) => nav.classList.toggle('active', nav.dataset.view === view));
        updateHeaderView(view);
        $('#sidebar')?.classList.remove('open');
        if (view !== 'overview') openFeature(view);
    });
});

// Interactive Stat Cards for Study Time & Quiz
$('#cardStudyTime')?.addEventListener('click', () => {
    showModal(
        'Log Study Time ◷',
        `<p>How many hours did you study in your latest session?</p>
     <form id="studyTimeForm">
       <label>Hours studied</label>
       <input id="studyHoursInput" type="number" step="0.5" min="0.5" max="16" required placeholder="e.g. 1.5" />
       <button type="submit" class="modal-submit">Add to Weekly Study Time</button>
     </form>`
    );
});

$('#cardQuiz')?.addEventListener('click', openQuizModal);

// Quick Add Task Buttons
function openQuickTaskModal() {
    openFeature('planner');
}
$('#addTaskButton')?.addEventListener('click', openQuickTaskModal);
$('#addTaskButtonTop')?.addEventListener('click', openQuickTaskModal);

$('#clearCompletedBtn')?.addEventListener('click', () => {
    const before = currentUser.tasks.length;
    currentUser.tasks = currentUser.tasks.filter((t) => !t.done);
    if (currentUser.tasks.length < before) {
        saveCurrentUser();
        refreshEntireDashboard();
        toast('Cleared completed tasks');
    } else {
        toast('No completed tasks to clear');
    }
});

// Dashboard AI Chat Form & Prompt Chips
$('#chatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#chatInput').value.trim();
    if (!q) return;
    $('#chatInput').value = ''; showModal('StudentHub AI · Study Guide', buildAIResponseHTML(q));
}); $$('.suggestion[data-prompt]').forEach((btn) => {
    btn.addEventListener('click', () => {
        $('#chatInput').value = btn.dataset.prompt;
        $('#chatForm').requestSubmit();
    });
});

// Global Search
$('#globalSearch')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentUser) {
        const q = e.target.value.trim().toLowerCase();
        if (!q) return;
        const tasks = currentUser.tasks.filter((t) => t.name.toLowerCase().includes(q));
        const notes = currentUser.notes.filter((n) => n.title.toLowerCase().includes(q));
        const assigns = currentUser.assignments.filter((a) => a.title.toLowerCase().includes(q));

        showModal(
            `Search: “${escapeHTML(e.target.value.trim())}”`,
            `<div class="answer-box">
         <b>☑ Tasks (${tasks.length})</b><br/>
         ${tasks.map((t) => `• ${escapeHTML(t.name)}`).join('<br/>') || '<small>None</small>'}<br/><br/>
         <b>📘 Notes (${notes.length})</b><br/>
         ${notes.map((n) => `• ${escapeHTML(n.title)}`).join('<br/>') || '<small>None</small>'}<br/><br/>
         <b>📌 Deadlines (${assigns.length})</b><br/>
         ${assigns.map((a) => `• ${escapeHTML(a.title)} (${escapeHTML(a.due)})`).join('<br/>') || '<small>None</small>'}
       </div>`
        );
    }
});

// Profile & Logout Modal (Sidebar profile button or top-right avatar)
function openProfileModal() {
    if (!currentUser) return;
    showModal(
        'Account & Student Profile',
        `<form id="profileEditForm">
       <label>Full Name</label>
       <input id="editName" required value="${escapeHTML(currentUser.profile.name)}" />
       <label>Email Address</label>
       <input disabled value="${escapeHTML(currentUser.profile.email)}" style="opacity:0.65;" />
       <label>Course / Program</label>
       <input id="editProgram" required value="${escapeHTML(currentUser.profile.program)}" />
       <button type="submit" class="modal-submit">Save Profile Changes</button>
     </form>
     <hr style="margin:14px 0; opacity:0.2;" />
     <button type="button" id="logoutBtn" class="suggestion" style="width:100%; justify-content:center; color:#d9534f;">Log Out of StudentHub</button>`
    );
}
$('#profileButton')?.addEventListener('click', openProfileModal);
$('#topAvatar')?.addEventListener('click', openProfileModal);

// Notifications & Customize
$('#notificationButton')?.addEventListener('click', () => {
    if (!currentUser) return;
    const pending = currentUser.tasks.filter((t) => !t.done).length;
    showModal(
        'Notifications',
        `<div class="answer-box">
       🎯 <b>Focus:</b> ${pending} task(s) remaining today.<br/><br/>
       📌 <b>Upcoming:</b> ${currentUser.assignments.length} assignment deadline(s).<br/><br/>
       📘 <b>Library:</b> ${currentUser.notes.length} saved study note(s).
     </div>`
    );
});

$('#customizeButton')?.addEventListener('click', () => {
    showModal(
        'Customize Overview Cards',
        `<p>Toggle which stat cards are visible on your dashboard:</p>
     <label><input type="checkbox" data-card="cardAttendance" ${!$('#cardAttendance').classList.contains('hidden') ? 'checked' : ''}/> Attendance</label><br/>
     <label><input type="checkbox" data-card="cardStudyTime" ${!$('#cardStudyTime').classList.contains('hidden') ? 'checked' : ''}/> Study Time</label><br/>
     <label><input type="checkbox" data-card="cardTasks" ${!$('#cardTasks').classList.contains('hidden') ? 'checked' : ''}/> Tasks Completed</label><br/>
     <label><input type="checkbox" data-card="cardQuiz" ${!$('#cardQuiz').classList.contains('hidden') ? 'checked' : ''}/> Quiz Average</label>`
    );
    $$('input[data-card]', modalBody).forEach((cb) => {
        cb.addEventListener('change', () => {
            $(`#${cb.dataset.card}`)?.classList.toggle('hidden', !cb.checked);
        });
    });
});

$('#mobileMenu')?.addEventListener('click', () => $('#sidebar')?.classList.toggle('open'));

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        $('#globalSearch')?.focus();
    }
    if (e.key === 'Escape') $('#sidebar')?.classList.remove('open');
});

/**
 * ============================================================================
 * 7. INITIALIZE SESSION ON PAGE LOAD
 * ============================================================================
 */
(function initSession() {
    const savedEmail = getCurrentEmail();
    const users = getUsers();
    if (savedEmail && users[savedEmail]) {
        currentUser = users[savedEmail];
        enterWorkspace();
    } else {
        authScreen.classList.remove('hidden');
        appShell.classList.add('hidden');
    }
})();
