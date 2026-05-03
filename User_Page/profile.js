const SERVER_URL = "http://localhost:5000";

// get stored username in localStorage after login
const username = localStorage.getItem("username");

async function loadUser() {
  const res = await fetch(`${SERVER_URL}/user/${username}`);
  const data = await res.json();

  document.getElementById("username").innerText = data.username;
  document.getElementById("email").innerText = data.email;
  document.getElementById("user").innerText = data.username;
  document.getElementById("leetcode-link").href = data.leetcode;
  document.getElementById("status-select").value = data.status;

  // Extract LeetCode username from URL
  const lcUsername = data.leetcode.split("/").filter(Boolean).pop();

  loadLeetCodeStats(lcUsername);
}

const statusSelect = document.getElementById("status-select");

statusSelect.addEventListener("change", async () => {
  const value = statusSelect.value;
  // Send to server
  try {
    await fetch(`${SERVER_URL}/update-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        status: value
      })
    });
  } catch (err) {
    console.log("Failed to update status", err);
  }
});

async function loadLeetCodeStats(username) {
  try {
    const res = await fetch(`${SERVER_URL}/leetcode/${username}`);
    const stats = await res.json();

    document.getElementById("rank").innerText = stats.ranking;
    document.getElementById("solved").innerText = stats.total;
    document.getElementById("easy").innerText = stats.easy;
    document.getElementById("medium").innerText = stats.medium;
    document.getElementById("hard").innerText = stats.hard;

  } catch (err) {
    console.log("LeetCode fetch failed", err);
  }
}

loadUser();