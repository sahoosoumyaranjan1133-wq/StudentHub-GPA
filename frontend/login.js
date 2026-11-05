const API_URL =
    "https://studenthub-backend-4wyn.onrender.com/api/students/login";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "Checking...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                "Invalid email or password."
            );
        }

        message.style.color = "green";
        message.textContent =
            data.message || "Login successful!";

        console.log("Login response:", data);

    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message;
        console.error("Login error:", error);

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log In";
    }
});
