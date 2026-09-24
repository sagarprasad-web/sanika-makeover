// =====================================================
// SANIKA MAKEOVER - MAIN JAVASCRIPT
// =====================================================

// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentOtpEmail = "";
let otpCountdownInterval = null;
let otpResolve = null;
let otpTemporaryExpiry = null;

let emailConfirmResolve = null;

// =====================================================
// DOM ELEMENTS
// =====================================================

// OTP Modal
const otpModal = document.getElementById("otpModal");
const closeOtpModalButton = document.getElementById("closeOtpModal");

const otpMessage = document.getElementById("otpMessage");

const otpCountdown = document.getElementById("otpCountdown");

const otpInput = document.getElementById("otpInput");

const verifyOtpButton = document.getElementById("verifyOtpButton");

const resendOtpButton = document.getElementById("resendOtpButton");

const otpStatus = document.getElementById("otpStatus");

// =====================================================
// EMAIL CONFIRMATION MODAL
// =====================================================

const emailConfirmModal = document.getElementById("emailConfirmModal");

const closeEmailConfirmModalButton = document.getElementById(
  "closeEmailConfirmModal",
);

const emailConfirmAddress = document.getElementById("emailConfirmAddress");

const editEmailButton = document.getElementById("editEmailButton");

const confirmSendOtpButton = document.getElementById("confirmSendOtpButton");

// =====================================================
// HELPER - MASK EMAIL
// =====================================================

function maskEmail(email) {
  if (!email || !email.includes("@")) {
    return email;
  }

  const parts = email.split("@");
  const username = parts[0];
  const domain = parts[1];

  // Very short usernames
  if (username.length <= 4) {
    return username + "@" + domain;
  }

  // Show first 2 + last 2 characters
  const firstTwo = username.substring(0, 2);
  const lastTwo = username.substring(username.length - 2);

  return firstTwo + "***" + lastTwo + "@" + domain;
}

// =====================================================
// EMAIL CONFIRMATION MODAL
// =====================================================

function openEmailConfirmModal(email) {
  if (!emailConfirmModal || !emailConfirmAddress) {
    console.error("Email confirmation modal not found.");

    return Promise.resolve(true);
  }

  emailConfirmAddress.textContent = email;

  emailConfirmModal.classList.add("show");

  return new Promise((resolve) => {
    emailConfirmResolve = resolve;
  });
}

// =====================================================
// CLOSE EMAIL CONFIRMATION MODAL
// =====================================================

function closeEmailConfirmModal(result = false) {
  if (!emailConfirmModal) {
    return;
  }

  emailConfirmModal.classList.remove("show");

  if (emailConfirmResolve) {
    emailConfirmResolve(result);

    emailConfirmResolve = null;
  }
}

// =====================================================
// EMAIL CONFIRMATION BUTTONS
// =====================================================

// SEND OTP
if (confirmSendOtpButton) {
  confirmSendOtpButton.addEventListener("click", () => {
    closeEmailConfirmModal(true);
  });
}

// =====================================================
// EDIT EMAIL
// =====================================================

if (editEmailButton) {
  editEmailButton.addEventListener("click", () => {
    closeEmailConfirmModal(false);

    const contactForm = document.querySelector(".contact-form");

    if (contactForm && contactForm.email) {
      contactForm.email.focus();

      contactForm.email.select();
    }
  });
}

// =====================================================
// CLOSE EMAIL CONFIRMATION
// =====================================================

if (closeEmailConfirmModalButton) {
  closeEmailConfirmModalButton.addEventListener("click", () => {
    closeEmailConfirmModal(false);
  });
}

// =====================================================
// CLOSE EMAIL CONFIRMATION BY CLICKING OUTSIDE
// =====================================================

if (emailConfirmModal) {
  emailConfirmModal.addEventListener("click", (event) => {
    if (event.target === emailConfirmModal) {
      closeEmailConfirmModal(false);
    }
  });
}

// =====================================================
// OPEN OTP MODAL
// =====================================================

function openOtpModal(email) {
  if (!otpModal) {
    console.error("OTP modal not found.");
    return;
  }

  currentOtpEmail = email;

  // =====================================================
  // OPEN OTP MODAL IMMEDIATELY
  // =====================================================

  otpModal.classList.add("show");

  // =====================================================
  // RESET OTP INPUT
  // =====================================================

  otpInput.value = "";

  // =====================================================
  // CLEAR PREVIOUS STATUS
  // =====================================================

  otpStatus.textContent = "";

  // =====================================================
  // SHOW SENDING MESSAGE
  // =====================================================

  otpMessage.textContent =
    `Sending a verification code to ${maskEmail(email)}...`;

  // =====================================================
  // START TEMPORARY 5-MINUTE COUNTDOWN
  // =====================================================

  otpTemporaryExpiry = Date.now() + 5 * 60 * 1000;

  startOtpCountdown(
    new Date(otpTemporaryExpiry).toISOString()
  );

  // =====================================================
  // OTP INPUT IS AVAILABLE IMMEDIATELY
  // =====================================================

  otpInput.disabled = false;

  // Automatically place cursor in OTP box
  setTimeout(() => {
    if (otpInput && !otpInput.disabled) {
      otpInput.focus();
    }
  }, 50);

  // =====================================================
  // VERIFY MUST WAIT UNTIL OTP IS SENT
  // =====================================================

  verifyOtpButton.disabled = true;

  // =====================================================
  // PREVENT RESEND WHILE FIRST OTP IS BEING SENT
  // =====================================================

  resendOtpButton.disabled = true;
}

// =====================================================
// CLOSE OTP MODAL
// =====================================================

function closeOtpModal() {
  if (!otpModal) {
    return;
  }

  otpModal.classList.remove("show");

  clearOtpCountdown();

  if (otpResolve) {
    otpResolve(false);

    otpResolve = null;
  }
}

// =====================================================
// CLOSE OTP BUTTON
// =====================================================

if (closeOtpModalButton) {
  closeOtpModalButton.addEventListener("click", () => {
    closeOtpModal();
  });
}

// =====================================================
// CLICK OUTSIDE OTP MODAL
// =====================================================

if (otpModal) {
  otpModal.addEventListener("click", (event) => {
    if (event.target === otpModal) {
      closeOtpModal();
    }
  });
}

// =====================================================
// CLEAR OTP COUNTDOWN
// =====================================================

function clearOtpCountdown() {
  if (otpCountdownInterval) {
    clearInterval(otpCountdownInterval);

    otpCountdownInterval = null;
  }
}

// =====================================================
// START OTP COUNTDOWN
// =====================================================

function startOtpCountdown(expiresAt) {
  clearOtpCountdown();

  const expiryTime = new Date(expiresAt).getTime();

  function updateCountdown() {
    const remaining = expiryTime - Date.now();

    if (remaining <= 0) {
      otpCountdown.textContent = "00:00";

      clearOtpCountdown();

      verifyOtpButton.disabled = true;

      otpStatus.textContent =
        "OTP expired. Please request a new OTP.";

      return;
    }

    const totalSeconds = Math.ceil(
      remaining / 1000
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    otpCountdown.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  updateCountdown();

  otpCountdownInterval =
    setInterval(updateCountdown, 250);
}

// =====================================================
// SHOW OTP SENT INFORMATION
// =====================================================

function showOtpSentInformation(expiresAt) {
  otpMessage.textContent =
    `A 6-digit verification code was sent to ${maskEmail(currentOtpEmail)}.`;

  otpStatus.textContent = "";

  otpInput.disabled = false;
  verifyOtpButton.disabled = false;

  // Synchronize the timer with the server's real expiry time
  const serverExpiry = new Date(expiresAt).getTime();

  if (
    otpTemporaryExpiry &&
    Math.abs(serverExpiry - otpTemporaryExpiry) < 10000
  ) {
    // Keep the current countdown running.
    // Do NOT restart it.
  } else {
    // If the server expiry is significantly different,
    // use the server's actual expiry time.
    startOtpCountdown(expiresAt);
  }

  setTimeout(() => {
    if (otpInput) {
      otpInput.focus();
    }
  }, 100);
}

// =====================================================
// WAIT FOR OTP VERIFICATION
// =====================================================

function waitForOtpVerification() {
  return new Promise((resolve) => {
    otpResolve = resolve;
  });
}

// =====================================================
// VERIFY OTP BUTTON
// =====================================================

if (verifyOtpButton) {
  verifyOtpButton.addEventListener("click", async () => {
    const otp = otpInput.value.trim();

    if (!otp) {
      otpStatus.textContent = "Please enter the OTP.";

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      otpStatus.textContent = "Please enter the 6-digit OTP.";

      return;
    }

    verifyOtpButton.disabled = true;

    otpStatus.textContent = "Verifying OTP...";

    try {
      const response = await fetch("https://sanika-makeover-backend.onrender.com/api/otp/verify", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: currentOtpEmail,
          otp: otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid OTP.");
      }

      otpStatus.textContent = "Email verified successfully.";

      clearOtpCountdown();

      if (otpResolve) {
        otpResolve(true);

        otpResolve = null;
      }

      // Close OTP modal immediately after successful verification
      if (otpModal) {
        otpModal.classList.remove("show");
      }

      clearOtpCountdown();

      if (otpResolve) {
        otpResolve(true);
        otpResolve = null;
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      otpStatus.textContent = error.message || "Invalid OTP. Please try again.";

      verifyOtpButton.disabled = false;
    }
  });
}

// =====================================================
// OTP INPUT - ONLY NUMBERS
// =====================================================

if (otpInput) {
  otpInput.addEventListener("input", () => {
    otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
  });
}

// =====================================================
// OTP INPUT - ENTER KEY
// =====================================================

if (otpInput) {
  otpInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !verifyOtpButton.disabled) {
      verifyOtpButton.click();
    }
  });
}

// =====================================================
// RESEND OTP
// =====================================================

if (resendOtpButton) {
  resendOtpButton.addEventListener("click", async () => {
    if (!currentOtpEmail) {
      return;
    }

    resendOtpButton.disabled = true;

    verifyOtpButton.disabled = true;

    otpStatus.textContent = "";

    otpMessage.textContent = `Sending a new verification code to ${maskEmail(currentOtpEmail)}...`;

    otpCountdown.textContent = "--:--";

    clearOtpCountdown();

    try {
      const response = await fetch("https://sanika-makeover-backend.onrender.com/api/otp/send", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: currentOtpEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to resend OTP.");
      }

      showOtpSentInformation(result.expiresAt);
    } catch (error) {
      console.error("Resend OTP error:", error);

      otpStatus.textContent =
        error.message || "We couldn't resend the OTP. Please try again.";

      resendOtpButton.disabled = false;
    }
  });
}

// =====================================================
// MAIN CONTACT FORM
// =====================================================

async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;

  // ===================================================
  // GET FORM DATA
  // ===================================================

  const formData = {
    name: form.name.value.trim(),

    email: form.email.value.trim().toLowerCase(),

    phone: form.phone.value.trim(),

    eventDate: form.date.value,

    message: form.message.value.trim(),
  };

  // ===================================================
  // VALIDATE NAME
  // ===================================================

  if (!formData.name) {
    alert("Please enter your name.");

    form.name.focus();

    return;
  }

  // ===================================================
  // VALIDATE EMAIL
  // ===================================================

  if (!formData.email) {
    alert("Please enter your email address.");

    form.email.focus();

    return;
  }

  // ===================================================
  // ONLY GMAIL ALLOWED
  // ===================================================

  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if (!gmailRegex.test(formData.email)) {
    alert("Please enter a valid Gmail address.");

    form.email.focus();

    return;
  }

  // ===================================================
  // VALIDATE PHONE
  // ===================================================

  const phoneDigits = formData.phone.replace(/\D/g, "");

  if (phoneDigits.length !== 10) {
    alert("Please enter a valid 10-digit phone number.");

    form.phone.focus();

    return;
  }

  // ===================================================
  // VALIDATE DATE
  // ===================================================

  if (!formData.eventDate) {
    alert("Please select your event date.");

    form.date.focus();

    return;
  }

  // ===================================================
  // CONFIRM EMAIL BEFORE OTP
  // ===================================================

  const emailConfirmed = await openEmailConfirmModal(formData.email);

  // User selected Edit Email
  // or closed the confirmation popup
  if (!emailConfirmed) {
    return;
  }

  // ===================================================
  // OPEN OTP MODAL IMMEDIATELY
  // ===================================================

  openOtpModal(formData.email);

  try {
    // =================================================
    // SEND OTP
    // =================================================

    const otpResponse = await fetch("https://sanika-makeover-backend.onrender.com/api/otp/send", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: formData.email,
      }),
    });

    const otpResult = await otpResponse.json();

    // =================================================
    // CHECK OTP RESPONSE
    // =================================================

    if (!otpResponse.ok) {
      throw new Error(otpResult.message || "Failed to send OTP.");
    }

    // =================================================
    // START REAL TIMER
    // =================================================

    showOtpSentInformation(otpResult.expiresAt);

    // =================================================
    // WAIT FOR USER TO VERIFY OTP
    // =================================================

    const verified = await waitForOtpVerification();

    // =================================================
    // STOP IF USER CLOSED OTP MODAL
    // =================================================

    if (!verified) {
      return;
    }

    // =================================================
    // SAVE INQUIRY TO DATABASE
    // =================================================

    const inquiryResponse = await fetch("https://sanika-makeover-backend.onrender.com/api/inquiries", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(formData),
    });

    const inquiryResult = await inquiryResponse.json();

    // =================================================
    // CHECK INQUIRY RESPONSE
    // =================================================

    if (!inquiryResponse.ok) {
      throw new Error(inquiryResult.message || "Failed to submit inquiry.");
    }

    // =================================================
    // SUCCESS
    // =================================================

    showSuccessMessage();

    // Clear form
    form.reset();
 } catch (error) {
  console.error("Form submission error:", error);

  // Stop fake countdown
  clearOtpCountdown();

  // Reset timer display
  otpCountdown.textContent = "--:--";

  // Disable OTP verification because no OTP was sent
  otpInput.value = "";
  otpInput.disabled = true;
  verifyOtpButton.disabled = true;

  // Allow user to try again
  resendOtpButton.disabled = false;

  if (otpModal && otpModal.classList.contains("show")) {
    otpStatus.textContent = "We couldn't connect to the verification service.";
    otpMessage.textContent = "Please try again in a moment.";
  } else {
    alert("We couldn't connect to the verification service. Please try again.");
  }
}
}

// =====================================================
// SMOOTH SCROLL FOR BOOK NOW BUTTONS
// =====================================================

document.querySelectorAll('[onclick*="scrollIntoView"]').forEach((button) => {
  button.addEventListener("click", () => {
    const contactSection = document.getElementById("contact");

    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// =====================================================
// NAVIGATION / MOBILE MENU
// =====================================================

const menuToggle = document.querySelector(".menu-toggle");

const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// =====================================================
// CLOSE MOBILE MENU AFTER CLICK
// =====================================================

if (navLinks) {
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

// =====================================================
// INITIAL PAGE SETUP
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("Sanika Makeover website loaded successfully.");
});

// =====================================================
// PROFESSIONAL SUCCESS MESSAGE
// =====================================================

function showSuccessMessage() {

  const existing =
    document.getElementById("inquirySuccessMessage");

  if (existing) {
    existing.remove();
  }

  const successBox =
    document.createElement("div");

  successBox.id =
    "inquirySuccessMessage";

  successBox.innerHTML = `
    <div class="success-message-box">

      <button
        type="button"
        class="success-message-close"
        aria-label="Close"
      >
        &times;
      </button>

      <div class="success-message-icon">
        ✓
      </div>

      <h3>Inquiry Submitted</h3>

      <p>
        Your email has been verified and
        your inquiry has been submitted successfully.
      </p>

      <span>
        Our team will contact you soon.
      </span>

      <button
        type="button"
        class="success-message-button"
      >
        Done
      </button>

    </div>
  `;

  document.body.appendChild(
    successBox
  );

  requestAnimationFrame(() => {

    successBox.classList.add(
      "show"
    );

  });

  const closeSuccessMessage = () => {

    successBox.classList.remove(
      "show"
    );

    setTimeout(() => {

      if (
        document.body.contains(
          successBox
        )
      ) {

        successBox.remove();

      }

    }, 250);

  };

  const closeButton =
    successBox.querySelector(
      ".success-message-close"
    );

  const doneButton =
    successBox.querySelector(
      ".success-message-button"
    );

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeSuccessMessage
    );

  }

  if (doneButton) {

    doneButton.addEventListener(
      "click",
      closeSuccessMessage
    );

  }

  setTimeout(() => {

    if (
      document.body.contains(
        successBox
      )
    ) {

      closeSuccessMessage();

    }

  }, 6000);

}


// =====================================================
// SUCCESS MESSAGE STYLES
// =====================================================

function addSuccessMessageStyles() {

  if (
    document.getElementById(
      "success-message-styles"
    )
  ) {

    return;

  }

  const style =
    document.createElement("style");

  style.id =
    "success-message-styles";

  style.textContent = `

    #inquirySuccessMessage {
      position: fixed;
      inset: 0;
      z-index: 10000;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 20px;

      background: rgba(25, 18, 22, 0.55);

      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);

      opacity: 0;
      visibility: hidden;

      transition:
        opacity 0.25s ease,
        visibility 0.25s ease;
    }

    #inquirySuccessMessage.show {
      opacity: 1;
      visibility: visible;
    }

    .success-message-box {
      position: relative;

      width: 100%;
      max-width: 430px;

      padding: 40px 32px 32px;

      background: #ffffff;

      border-radius: 20px;

      text-align: center;

      box-shadow:
        0 25px 70px rgba(0, 0, 0, 0.18),
        0 8px 25px rgba(216, 139, 158, 0.12);

      transform:
        translateY(15px)
        scale(0.97);

      transition:
        transform 0.25s ease;
    }

    #inquirySuccessMessage.show
    .success-message-box {
      transform:
        translateY(0)
        scale(1);
    }

    .success-message-close {
      position: absolute;

      top: 14px;
      right: 16px;

      width: 32px;
      height: 32px;

      border: none;
      background: transparent;

      font-size: 25px;
      line-height: 1;

      color: #777;

      cursor: pointer;
    }

    .success-message-icon {
      width: 74px;
      height: 74px;

      margin: 0 auto 22px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      background: rgba(216, 139, 158, 0.12);

      color: #d88b9e;

      font-size: 44px;
      font-weight: 500;
    }

    .success-message-box h3 {
      margin: 0 0 18px;

      color: #2c1a1f;

      font-family:
        "Playfair Display",
        serif;

      font-size: 1.75rem;
    }

    .success-message-box p {
      margin: 0 auto 10px;

      max-width: 360px;

      color: #6f6467;

      font-size: 1rem;

      line-height: 1.6;
    }

    .success-message-box span {
      display: block;

      margin-bottom: 28px;

      color: #999;

      font-size: 0.95rem;
    }

    .success-message-button {
      width: 100%;

      padding: 14px 20px;

      border: none;

      border-radius: 10px;

      background:
        linear-gradient(
          135deg,
          #d88b9e,
          #d6b57b
        );

      color: #ffffff;

      font-size: 1rem;
      font-weight: 600;

      cursor: pointer;

      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    }

    .success-message-button:hover {
      transform: translateY(-2px);

      box-shadow:
        0 10px 25px
        rgba(216, 139, 158, 0.25);
    }

    @media (max-width: 480px) {

      .success-message-box {
        padding:
          35px 22px 25px;
      }

      .success-message-box h3 {
        font-size: 1.5rem;
      }

    }

  `;

  document.head.appendChild(
    style
  );

}


// =====================================================
// INITIALIZE SUCCESS MESSAGE STYLES
// =====================================================

addSuccessMessageStyles();

// =====================================================
// SCROLL REVEAL ANIMATION
// =====================================================

const revealElements =
  document.querySelectorAll(".reveal");

function revealOnScroll() {

  revealElements.forEach((element) => {

    const windowHeight =
      window.innerHeight;

    const elementTop =
      element.getBoundingClientRect().top;

    const elementVisible = 150;

    if (
      elementTop <
      windowHeight - elementVisible
    ) {

      element.classList.add("visible");

    }

  });

}

window.addEventListener(
  "scroll",
  revealOnScroll
);

revealOnScroll();