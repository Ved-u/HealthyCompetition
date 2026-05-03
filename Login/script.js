document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const messageDiv = document.getElementById('message');

  // Toggle forms
  loginBtn.addEventListener('click', () => {
    loginBtn.classList.add('active');
    signupBtn.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    messageDiv.textContent = '';
  });

  signupBtn.addEventListener('click', () => {
    signupBtn.classList.add('active');
    loginBtn.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    messageDiv.textContent = '';
  });

  // Password validation function
  function validatePassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])\S{8,}$/;
    return passwordRegex.test(password);
  }

  // Login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value;
    const password = document.getElementById('login-password').value;

    if (!validatePassword(password)) {
      messageDiv.textContent = 'Invalid password. Must contain 1 uppercase, 1 number, 1 special character, and be at least 8 characters long.';
      messageDiv.style.color = 'red';
      return;
    }

    console.log('Login Details:', { identifier });
    messageDiv.textContent = 'Login details logged to database';
    messageDiv.style.color = 'green';
  });

  // Signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const leetcode = document.getElementById('signup-leetcode').value;
    const gfg = document.getElementById('signup-gfg').value;

    if (password !== confirmPassword) {
      messageDiv.textContent = 'Passwords do not match.';
      messageDiv.style.color = 'red';
      return;
    }
    if (!validatePassword(password)) {
      messageDiv.textContent = 'Invalid password. Must contain 1 uppercase, 1 number, 1 special character, and be at least 8 characters long.';
      messageDiv.style.color = 'red';
      return;
    }

    console.log('Signup Details:', { email, username, leetcode, gfg });
    messageDiv.textContent = 'Signup details logged to database';
    messageDiv.style.color = 'green';
  });
});