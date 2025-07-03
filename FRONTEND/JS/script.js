// 🔐 Validate Password Match
function validatePasswords() {
  const newPass = document.getElementById('newPassword')?.value;
  const confirmPass = document.getElementById('confirmPassword')?.value;

  if (newPass !== confirmPass) {
    alert('❌ Passwords do not match!');
    return false;
  }
  return true;
}

// 👁️ Toggle Password Visibility
function togglePassword(id, icon) {
  const input = document.getElementById(id);
  if (!input || !icon) return;

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  icon.classList.replace(isHidden ? "fa-eye" : "fa-eye-slash", isHidden ? "fa-eye-slash" : "fa-eye");
}

// 🔄 Toggle Between Sign In and Sign Up Forms
function toggleForm(role) {
  const title = document.getElementById(`${role}FormTitle`);
  const extraFields = document.getElementById(`extra${capitalize(role)}Fields`);
  const button = document.querySelector(`#${role}Form button`);
  const toggleText = document.querySelector(`#${role}Form .toggle-link`);

  if (!title || !extraFields || !button || !toggleText) return;

  const isSignIn = title.innerText.includes("Sign In");
  title.innerText = title.innerText.replace(isSignIn ? "Sign In" : "Sign Up", isSignIn ? "Sign Up" : "Sign In");
  extraFields.classList.toggle("hidden", isSignIn);
  button.innerText = isSignIn ? "Register" : "Submit";
  toggleText.innerText = isSignIn ? "Already have an account? Sign in" : "Don't have an account? Sign up";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🚀 DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  const contact = sessionStorage.getItem('contact')?.trim().toLowerCase();
  
  // 📨 Save contact to sessionStorage on Send OTP
  const sendOtpForm = document.querySelector('form[action="/send-otp"]');
  if (sendOtpForm) {
    console.log('Form found'); // Confirm it's selected!
    sendOtpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const contactInput = sendOtpForm.querySelector('input[name="contact"]');
      if (contactInput) {
        const value = contactInput.value.trim().toLowerCase();
        console.log('About to store:', value);
        sessionStorage.setItem('contact', value);
      }
      sendOtpForm.submit();
    });
  } else {
    console.warn('sendOtpForm not found in DOM');
  }

  // 📥 Populate hidden fields for OTP verification and resend
  const contactField = document.getElementById('contactField');
  const resendContactField = document.getElementById('resendContactField');

  if (contact) {
    if (contactField) contactField.value = contact;
    if (resendContactField) resendContactField.value = contact;
  }

  // ⏳ Countdown logic for Resend OTP
  const resendForm = document.getElementById('resendForm');
  const resendBtn = document.getElementById('resendBtn');
  const countdownSpan = document.getElementById('countdown');

  if (resendForm && resendBtn && countdownSpan) {
    let timeLeft = 59;

    const startCountdown = () => {
      resendBtn.style.display = 'none';
      countdownSpan.style.display = 'inline';
      countdownSpan.textContent = `Resend available in ${timeLeft}s`;

      const timer = setInterval(() => {
        timeLeft--;
        countdownSpan.textContent = `Resend available in ${timeLeft}s`;

        if (timeLeft <= 0) {
          clearInterval(timer);
          countdownSpan.style.display = 'none';
          resendBtn.style.display = 'inline-block';
        }
      }, 1000);
    };

    // Start countdown on page load
    startCountdown();

    // Reset countdown on resend
    resendForm.addEventListener('submit', () => {
      timeLeft = 59;
      startCountdown();
    });
  }

  // 🔁 Fallback to ensure contactField is always synced
  if (contact && contactField && !contactField.value) {
    contactField.value = contact;
  }
});