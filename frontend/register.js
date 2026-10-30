const API_URL = "http://localhost:8080/api/students/register";

const form = document.getElementById("registerForm");
const message = document.getElementById("formMessage");
const registerBtn = document.getElementById("registerBtn");

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (password.length < 8) {
        message.style.color = "#fca5a5";
        message.textContent =
            "Password must contain at least 8 characters.";
        return;
    }

    if (password !== confirmPassword) {
        message.style.color = "#fca5a5";
        message.textContent = "Passwords do not match.";
        return;
    }

    message.textContent = "";
    message.style.color = "#fca5a5";
    registerBtn.disabled = true;
    registerBtn.textContent = "Submitting...";

    const studentData = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim(),
        semester: Number(document.getElementById("semester").value),
        password: password
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.detail ||
                result.message ||
                result.error ||
                "Registration failed. Please try again."
            );
        }

        message.style.color = "#86efac";
        message.textContent =
            "✅ " + result.message +
            " Your Student ID is " + result.studentId + ".";

        form.reset();

    } catch (error) {
        message.style.color = "#fca5a5";

        if (error instanceof TypeError) {
            message.textContent =
                "Cannot connect to the server. Check that your backend is running.";
        } else {
            message.textContent = "❌ " + error.message;
        }

    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = "Create Student Account";
    }
});
