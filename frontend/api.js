const API_BASE_URL =
    "https://studenthub-backend-4wyn.onrender.com";

// General public/student API requests.
// No administrator credentials are requested.
async function studentApiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(
            data?.message || `API error: ${response.status}`
        );
    }

    return data;
}

// Admin API requests.
// Call this function only from the admin dashboard.
async function adminApiRequest(endpoint, username, password, options = {}) {
    const credentials = btoa(`${username}:${password}`);

    const response = await fetch(`${API_BASE_URL}/api/admin${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            "Authorization": `Basic ${credentials}`
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(
            data?.message || `Admin API error: ${response.status}`
        );
    }

    return data;
}
