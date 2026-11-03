const API_BASE = "https://studenthub-backend-4wyn.onrender.com/api/admin";

let authHeader = null;

const $ = (id) => document.getElementById(id);

function setStatus(message) {
    $("status").textContent = message;
}

async function apiRequest(path, options = {}) {
    if (!authHeader) {
        throw new Error("Please sign in as an administrator first.");
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
            Authorization: authHeader
        }
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error(
            response.status === 401
                ? "Login failed. Check your username and password."
                : "Access denied. Your account may not have ADMIN permission."
        );
    }

    if (!response.ok) {
        // throw new Error(`API request failed: HTTP ${response.status}`);
        const details = await response.text();
        throw new Error(`API request failed: HTTP ${response.status} - ${details}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function showJson(elementId, data) {
    const element = $(elementId);
    element.replaceChildren();

    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(data, null, 2);
    element.appendChild(pre);
}

function setCount(id, value) {
    $(id).textContent = value ?? 0;
}

async function loadDashboard() {
    try {
        setStatus("Loading dashboard...");
        const data = await apiRequest("/dashboard");

        setCount("totalStudents", data.totalStudents);
        setCount("totalFaculty", data.totalFaculty);
        setCount("totalAnnouncements", data.totalAnnouncements);
        setCount("totalNotes", data.totalNotes);
        setCount("pendingNotes", data.pendingNotes);
        setCount("activeUsers", data.activeUsers);

        setStatus("Dashboard data loaded successfully.");
    } catch (error) {
        setStatus(error.message);
    }
}
async function loadSection(section) {
    const routes = {
        students: "/students",
        notes: "/notes",
        announcements: "/announcements",
        "audit-logs": "/audit-logs"
    };

    const outputIds = {
        students: "studentsOutput",
        notes: "notesOutput",
        announcements: "announcementsOutput",
        "audit-logs": "audit-logsOutput"
    };

    if (!routes[section]) return;

    const output = $(outputIds[section]);
    output.textContent = "Loading...";

    try {
        const data = await apiRequest(routes[section]);

        if (section === "students") {
            renderStudents(data);
        } else {
            showJson(outputIds[section], data);
        }
    } catch (error) {
        output.textContent = error.message;
    }
}

function renderStudents(students) {
    const output = $("studentsOutput");
    output.replaceChildren();

    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search students by name or email...";
    search.setAttribute("aria-label", "Search students");

    const list = document.createElement("div");
    list.className = "student-list";

    output.append(search, list);

    function renderList() {
        list.replaceChildren();

        const query = search.value.trim().toLowerCase();

        const filtered = students.filter(student =>
            Object.values(student).some(value =>
                String(value ?? "").toLowerCase().includes(query)
            )
        );

        if (filtered.length === 0) {
            list.textContent = "No matching students found.";
            return;
        }

        filtered.forEach(student => {
            const card = document.createElement("article");
            card.className = "stat";

            const name = document.createElement("h3");
            name.textContent =
                student.fullName ?? `Student #${student.studentId}`;

            const details = document.createElement("p");
            details.textContent =
                `Email: ${student.email ?? "Not provided"}`;

            const status = document.createElement("p");
            status.textContent = `Status: ${student.accountStatus ?? "Unknown"}`;

            card.append(name, details, status);
            if (student.studentId != null) {
                const button = document.createElement("button");
                const isActive = student.accountStatus === "ACTIVE";

                button.textContent = isActive ? "Deactivate" : "Activate";
                button.className = isActive ? "secondary" : "";
                button.disabled = !["ACTIVE", "INACTIVE"].includes(
                    student.accountStatus
                );

                button.addEventListener("click", async () => {
                    const newStatus = isActive ? "INACTIVE" : "ACTIVE";

                    if (!confirm(`Change this student's status to ${newStatus}?`)) {
                        return;
                    }

                    button.disabled = true;
                    button.textContent = "Updating...";

                    try {
                        const updated = await apiRequest(
                            `/students/${encodeURIComponent(student.studentId)}/status`,
                            {
                                method: "PATCH",
                                body: JSON.stringify({ status: newStatus })
                            }
                        );

                        Object.assign(student, updated);
                        renderList();
                        setStatus(`Student status updated to ${newStatus}.`);
                        await loadDashboard();
                    } catch (error) {
                        button.disabled = false;
                        button.textContent = isActive ? "Deactivate" : "Activate";
                        setStatus(error.message);
                        alert(error.message);
                    }
                });

                card.appendChild(button);
            }

            // if (student.studentId != null) {
            //     const button = document.createElement("button");
            //     const isActive = student.accountStatus === "ACTIVE";

            //     button.textContent = isActive ? "Deactivate" : "Activate";
            //     button.className = isActive ? "secondary" : "";
            //     button.disabled = !["ACTIVE", "INACTIVE"].includes(student.accountStatus);

            //     button.addEventListener("click", async () => {
            //         const newStatus = isActive ? "INACTIVE" : "ACTIVE";

            //         if (!confirm(`Change this student's status to ${newStatus}?`)) {
            //             return;
            //         }

            //         button.disabled = true;
            //         button.textContent = "Updating...";

            //         try {
            //             const updated = await apiRequest(
            //                 `/students/${encodeURIComponent(student.id)}/status`,
            //                 {
            //                     method: "PATCH",
            //                     body: JSON.stringify({ status: newStatus })
            //                 }
            //             );

            //             Object.assign(student, updated);
            //             renderList();
            //             setStatus(`Student status updated to ${newStatus}.`);
            //             await loadDashboard();
            //         } catch (error) {
            //             button.disabled = false;
            //             button.textContent = isActive ? "Deactivate" : "Activate";
            //             setStatus(error.message);
            //             alert(error.message);
            //         }
            //     });

            //     card.appendChild(button);
            // }

            list.appendChild(card);
        });
    }

    search.addEventListener("input", renderList);
    renderList();
}

// async function loadSection(section) {
//     const routes = {
//         students: "/students",
//         notes: "/notes",
//         announcements: "/announcements",
//         "audit-logs": "/audit-logs"
//     };

//     const outputIds = {
//         students: "studentsOutput",
//         notes: "notesOutput",
//         announcements: "announcementsOutput",
//         "audit-logs": "audit-logsOutput"
//     };

//     if (!routes[section]) return;

//     const output = $(outputIds[section]);
//     output.textContent = "Loading...";

//     try {
//         const data = await apiRequest(routes[section]);
//         showJson(outputIds[section], data);
//     } catch (error) {
//         output.textContent = error.message;
//     }
// }

$("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = $("username").value.trim();
    const password = $("password").value;

    authHeader = "Basic " + btoa(`${username}:${password}`);
    $("loginMessage").textContent = "Checking credentials...";

    try {
        await loadDashboard();

        const message = $("status").textContent;

        if (message === "Dashboard data loaded successfully.") {
            $("loginMessage").textContent = "Admin login successful.";
            $("password").value = "";
            $("loginPanel").hidden = true;
            await Promise.all([
                loadSection("students"),
                loadSection("notes"),
                loadSection("announcements")
            ]);
        } else {
            authHeader = null;
            $("loginMessage").textContent = message;
        }
    } catch (error) {
        authHeader = null;
        $("loginMessage").textContent = error.message;
    }
});

$("refreshBtn").addEventListener("click", async () => {
    await loadDashboard();
});

$("logoutBtn").addEventListener("click", () => {
    authHeader = null;
    $("loginPanel").hidden = false;
    $("password").value = "";
    $("loginMessage").textContent = "Signed out.";
    setStatus("Sign in to load live data.");

    [
        "studentsOutput",
        "notesOutput",
        "announcementsOutput",
        "audit-logsOutput"
    ].forEach((id) => {
        $(id).textContent = "Sign in first.";
    });

    [
        "totalStudents",
        "totalFaculty",
        "totalAnnouncements",
        "totalNotes",
        "pendingNotes",
        "activeUsers"
    ].forEach((id) => setCount(id, "—"));
});

document.querySelectorAll("[data-load]").forEach((button) => {
    button.addEventListener("click", () => {
        loadSection(button.dataset.load);
    });
});

$("announcementForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = $("announcementTitle").value.trim();
    const content = $("announcementContent").value.trim();

    if (!title || !content) return;

    try {
        const result = await apiRequest("/announcements", {
            method: "POST",
            body: JSON.stringify({ title, content })
        });

        $("announcementForm").reset();
        $("announcementsOutput").textContent =
            "Announcement submitted successfully.";

        showJson("announcementsOutput", result ?? {
            message: "Announcement created."
        });

        await loadDashboard();
        await loadSection("announcements");
    } catch (error) {
        $("announcementsOutput").textContent = error.message;
    }
});

document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener("click", () => {
        document.querySelectorAll("nav a").forEach((item) => {
            item.classList.remove("active");
        });
        link.classList.add("active");
    });
});
