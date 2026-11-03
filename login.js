// const loginForm = document.getElementById("loginForm");
// const message = document.getElementById("message");
// const loginButton = document.getElementById("loginButton");

// loginForm.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     message.textContent = "";
//     loginButton.disabled = true;
//     loginButton.textContent = "Checking...";

//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value;

//     try {
//         const response = await fetch(
//             "https://studenthub-backend-4wyn.onrender.com",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({ email, password })
//             }
//         );

//         const data = await response.json();

//         if (response.ok) {
//             message.textContent =
//                 "Credentials verified! Dashboard setup is the next step.";
//             message.style.color = "green";
//         } else {
//             message.textContent =
//                 data.message || "Login failed. Check your credentials.";
//             message.style.color = "red";
//         }
//     } catch (error) {
//         message.textContent =
//             "Cannot connect to the server. Check that the backend is running.";
//         message.style.color = "red";
//     } finally {
//         loginButton.disabled = false;
//         loginButton.textContent = "Log In";
//     }
// });
const API_URL =
    "https://studenthub-backend-4wyn.onrender.com";

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
        const response = await fetch(
            `${API_URL}/api/students/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

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

        // Dashboard navigation will be added
        // after confirming your login response structure.

    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log In";
    }
});
