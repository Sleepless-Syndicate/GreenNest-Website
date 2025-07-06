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

// 📝 Editable Profile Fields
document.addEventListener('DOMContentLoaded', () => {
  const fields = ['address', 'dob', 'currentLoc', 'bio'];
  const editBtn = document.getElementById('editBtn');
  const saveBtn = document.getElementById('saveBtn');
  const fileInput = document.getElementById('fileInput');
  const profileImage = document.getElementById('profileImage');

  // 🔁 Load saved field values from localStorage
  fields.forEach(field => {
    const el = document.getElementById(field);
    const saved = localStorage.getItem(field);
    if (el) {
      if (saved) el.value = saved;
      el.disabled = false; // Enable fields by default
    }
  });

  // 🔁 Load saved profile image from localStorage
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage && profileImage) {
    profileImage.src = savedImage;
  }

  // 📸 Handle profile image upload and auto-save
  if (fileInput && profileImage) {
    fileInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const base64Image = e.target.result;
          profileImage.src = base64Image;
          localStorage.setItem('profileImage', base64Image);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 🔘 Initial button state
  if (saveBtn) saveBtn.disabled = false;
  if (editBtn) editBtn.disabled = true;

  // 💾 Save profile fields and send to backend
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const data = {
        Address: document.getElementById('address').value,
        DOB: document.getElementById('dob').value,
        CurrentLocation: document.getElementById('currentLoc').value,
        Bio: document.getElementById('bio').value,
        ProfileImage: document.getElementById('profileImage').src
      };

      // Save to localStorage and disable fields
      fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) {
          localStorage.setItem(field, el.value);
          el.disabled = true;
        }
      });

      saveBtn.disabled = true;
      editBtn.disabled = false;
      showSavedMessage();

      // Send to backend
      try {
        const res = await fetch('/api/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log(result.message || result.error);
      } catch (err) {
        console.error('❌ Failed to update profile:', err);
      }
    });
  }

  // ✏️ Enable editing
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) el.disabled = false;
      });
      saveBtn.disabled = false;
      editBtn.disabled = true;
    });
  }

  // ✅ Show "Profile saved!" message
  function showSavedMessage() {
    const msg = document.getElementById('savedMsg');
    if (!msg) return;
    msg.style.display = 'block';
    clearTimeout(msg.timeout);
    msg.timeout = setTimeout(() => {
      msg.style.display = 'none';
    }, 1500);
  }
});

// 👤 Profile Dropdown Toggle
document.addEventListener('DOMContentLoaded', () => {
  const profileImg = document.querySelector('.profileImg');
  const dropdown = document.querySelector('.dropdown-menu');
  const profileContainer = document.querySelector('.profile-container');

  if (profileImg && dropdown) {
    profileImg.addEventListener('click', function () {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function (e) {
      if (!profileContainer?.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
});

// 🔐 OTP Contact Handling
document.addEventListener('DOMContentLoaded', () => {
  const contact = sessionStorage.getItem('contact')?.trim().toLowerCase();

  // 📨 Save contact on Send OTP
  const sendOtpForm = document.querySelector('form[action="/send-otp"]');
  if (sendOtpForm) {
    sendOtpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const contactInput = sendOtpForm.querySelector('input[name="contact"]');
      if (contactInput) {
        const value = contactInput.value.trim().toLowerCase();
        sessionStorage.setItem('contact', value);
      }
      sendOtpForm.submit();
    });
  }

  // 📥 Populate hidden fields
  const contactField = document.getElementById('contactField');
  const resendContactField = document.getElementById('resendContactField');
  if (contact) {
    if (contactField) contactField.value = contact;
    if (resendContactField) resendContactField.value = contact;
  }

  // ⏳ Resend OTP Countdown
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

    startCountdown();

    resendForm.addEventListener('submit', () => {
      timeLeft = 59;
      startCountdown();
    });
  }

  // 🔁 Fallback to sync contactField
  if (contact && contactField && !contactField.value) {
    contactField.value = contact;
  }
});

// Profile Load By User Details
document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/profile');
      const user = await res.json();

      if (user.error) {
        console.warn(user.error);
        return;
      }

      // 🧠 Update profile fields if they exist on the page
      const fullNameEl = document.getElementById('fullName');
      const usernameEl = document.getElementById('username');
      const addressEl = document.getElementById('address');
      const dobEl = document.getElementById('dob');
      const currentLocEl = document.getElementById('currentLoc');
      const bioEl = document.getElementById('bio');
      const profileImgEl = document.getElementById('profileImage');

      if (fullNameEl) fullNameEl.innerText = user.FullName;
      if (usernameEl) usernameEl.innerText = user.UserName;
      if (addressEl) addressEl.value = user.Address;
      if (dobEl) dobEl.value = user.DOB;
      if (currentLocEl) currentLocEl.value = user.CurrentLocation;
      if (bioEl) bioEl.value = user.Bio;
      if (profileImgEl) profileImgEl.src = user.ProfileImage;

    } catch (err) {
      console.error('❌ Failed to load profile:', err);
    }
});

// LogOut
document.addEventListener('DOMContentLoaded', () => {
  const logOutBtn = document.getElementById('logOut');
  if (logOutBtn) {
    logOutBtn.addEventListener('click', () => {
      // Optional: clear local/session storage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to logout route
      window.location.href = '/logout';
    });
  }
});