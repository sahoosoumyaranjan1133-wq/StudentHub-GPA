const API_BASE_URL = "https://studenthub-backend-4wyn.onrender.com";

async function apiRequest(endpoint, options = {}) {
    const username = "admin";
    const password = window.prompt("Enter your StudentHub admin password:");

    if (password === null) {
        throw new Error("Login cancelled.");
    }

    const credentials = btoa(`${username}:${password}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 401) {
        throw new Error("Invalid username or password.");
    }

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

async function loadDashboard() {
    try {
        const data = await apiRequest("/dashboard");
        console.log("Dashboard data:", data);

        // Display the response on your page.
        const output = document.getElementById("dashboard-data");
        if (output) {
            output.textContent = JSON.stringify(data, null, 2);
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}
