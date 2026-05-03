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

async function loadActivityHeatmap() {
  try {
    const res = await fetch(`${SERVER_URL}/activities/${username}`);
    const activities = await res.json();

    const activityMap = {};
    activities.forEach(a => activityMap[a.date] = a.count);

    const today = new Date();
    const year = today.getFullYear();
    // Start from May 1st
    const mayFirst = new Date(year, 4, 1); // Month is 0-indexed
    // End at Dec 31st
    const decLast = new Date(year, 11, 31);
    // Find the Sunday on or before May 1st
    const startDate = new Date(mayFirst);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    // End at the Saturday on or after Dec 31st
    const endDate = new Date(decLast);
    const endDayOfWeek = endDate.getDay();
    if (endDayOfWeek !== 6) endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
    const heatmap = document.getElementById('heatmap');
    const heatmapMonths = document.getElementById('heatmap-months');
    heatmap.innerHTML = '';
    heatmapMonths.innerHTML = '';

    const DAY_SIZE = 12;
    const GAP = 6;
    const WEEK_WIDTH = DAY_SIZE + GAP;

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthPositions = [];
    for (let month = 4; month < 12; month++) { // May (4) to Dec (11)
      const monthStart = new Date(year, month, 1);
      if (monthStart > endDate) break;
      const diffWeeks = Math.floor((monthStart - startDate) / (7 * 24 * 60 * 60 * 1000));
      monthPositions.push({ label: monthLabels[month], left: diffWeeks });
    }

    let currentDate = new Date(startDate);
    let weekIndex = 0;
    let prevMonth = null;
    const weekMonthIndexes = [];
    // First, collect which week starts which month
    while (currentDate <= endDate) {
      const weekStartMonth = currentDate.getMonth();
      weekMonthIndexes.push(weekStartMonth);
      for (let day = 0; day < 7; day++) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    // Now, render the grid
    currentDate = new Date(startDate);
    for (let week = 0; week < weekMonthIndexes.length; week++) {
      // Only render weeks that are in the May-Dec range
      const weekStartDate = new Date(startDate);
      weekStartDate.setDate(startDate.getDate() + week * 7);
      if (weekStartDate > endDate) break;
      const isMonthStart = week === 0 || weekMonthIndexes[week] !== weekMonthIndexes[week - 1];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;
        const level = Math.min(count, 4);
        const div = document.createElement('div');
        div.className = `day${level > 0 ? ` active-${level}` : ''}${isMonthStart && day === 0 ? ' month-gap' : ''}`;
        div.title = `${dateStr}: ${count} activity${count === 1 ? '' : 'ies'}`;
        heatmap.appendChild(div);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    heatmap.style.minWidth = `${weekMonthIndexes.length * WEEK_WIDTH}px`;
    // Month labels
    monthPositions.forEach(({ label, left }, i) => {
      const labelEl = document.createElement('span');
      labelEl.className = 'month-label';
      labelEl.innerText = label;
      // Center label above the first week of the month
      labelEl.style.left = `${left * WEEK_WIDTH + 8}px`;
      heatmapMonths.appendChild(labelEl);
    });
  } catch (err) {
    console.log("Activity heatmap fetch failed", err);
  }
}

async function logActivity() {
  try {
    await fetch(`${SERVER_URL}/log-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    });
  } catch (err) {
    console.log("Failed to log activity", err);
  }
}

loadUser().then(() => {
  logActivity().then(()=>{
    loadActivityHeatmap();
  });
});