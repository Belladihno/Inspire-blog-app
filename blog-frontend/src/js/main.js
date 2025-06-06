import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", function () {
  // Page navigation functions
  window.showLanding = function () {
    window.location.href = "index.html";
  };

  window.showLogin = function () {
    window.location.href = "login.html";
  };

  window.showSignup = function () {
    window.location.href = "signup.html";
  };

  function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll(".page");
    pages.forEach((page) => page.classList.remove("active"));

    // Show selected page
    document.getElementById(pageId).classList.add("active");
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const button = e.target.querySelector('button[type="submit"]');

    try {
      button.classList.add("loading");
      const response = await api.login(email, password);
      showNotification("Login successful!", "success");
      // Store user data or token if needed
      localStorage.setItem("user", JSON.stringify(response.user));
      // Redirect to dashboard
      window.location.href = "/dashboard.html";
    } catch (error) {
      showNotification(error.message || "Login failed", "error");
    } finally {
      button.classList.remove("loading");
    }
  }

  // Form handling
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Password strength indicator
  const signupPassword = document.getElementById("signup-password");
  if (signupPassword) {
    signupPassword.addEventListener("input", updatePasswordStrength);
  }

  // Password confirmation validation
  const confirmPassword = document.getElementById("confirm-password");
  if (confirmPassword) {
    confirmPassword.addEventListener("input", validatePasswordMatch);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    // Basic validation
    if (!email || !password) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Simulate login process
    showNotification("Signing in...", "info");

    setTimeout(() => {
      showNotification("Welcome back! Login successful.", "success");
      // Here you would typically redirect to the dashboard
      console.log("Login successful:", { email, rememberMe });
    }, 1500);
  }

  function handleSignup(e) {
    e.preventDefault();
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPass = document.getElementById("confirm-password").value;
    const newsletter = document.getElementById("newsletter").checked;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPass) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    if (password.length < 8) {
      showNotification("Password must be at least 8 characters long", "error");
      return;
    }

    if (password !== confirmPass) {
      showNotification("Passwords do not match", "error");
      return;
    }

    // Simulate signup process
    showNotification("Creating your account...", "info");

    setTimeout(() => {
      showNotification(
        "Account created successfully! Welcome to Inspire.",
        "success"
      );
      // Here you would typically redirect to onboarding or dashboard
      console.log("Signup successful:", {
        firstName,
        lastName,
        email,
        newsletter,
      });
    }, 2000);
  }

  function updatePasswordStrength() {
    const password = document.getElementById("signup-password").value;
    const strengthBar = document.querySelector(".strength-bar");

    if (!strengthBar) return;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/))
      strength += 25;

    strengthBar.style.width = strength + "%";

    // Change color based on strength
    if (strength < 50) {
      strengthBar.style.background = "#ef4444";
    } else if (strength < 75) {
      strengthBar.style.background = "#f59e0b";
    } else {
      strengthBar.style.background = "#10b981";
    }
  }

  function validatePasswordMatch() {
    const password = document.getElementById("signup-password").value;
    const confirmPass = document.getElementById("confirm-password").value;
    const confirmField = document.getElementById("confirm-password");

    if (confirmPass && password !== confirmPass) {
      confirmField.style.borderColor = "#ef4444";
    } else {
      confirmField.style.borderColor = "rgba(255,255,255,0.2)";
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;

    // Set background color based on type
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      info: "#3b82f6",
    };
    notification.style.background = colors[type] || colors.info;

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });

  // Add loading states to social buttons
  document.querySelectorAll(".btn-social").forEach((button) => {
    button.addEventListener("click", function () {
      const originalText = this.innerHTML;
      this.innerHTML = '<span class="social-icon">⟳</span>Connecting...';
      this.style.opacity = "0.7";

      setTimeout(() => {
        this.innerHTML = originalText;
        this.style.opacity = "1";
        showNotification("Social login feature coming soon!", "info");
      }, 2000);
    });
  });

  // Add keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      // Close any open modals or return to landing page
      showLanding();
    }
  });

  // Add focus management for accessibility
  const focusableElements =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container) {
    const focusableContent = container.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];

    container.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  // Apply focus trapping to auth forms
  const authPages = document.querySelectorAll(".auth-page");
  authPages.forEach((page) => trapFocus(page));

  // Add floating particles animation
  function createParticles() {
    const landingPage = document.getElementById("landing-page");
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "particles-container";
    particlesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                animation: float ${Math.random() * 20 + 10}s infinite linear;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.1};
            `;
      particlesContainer.appendChild(particle);
    }

    landingPage.appendChild(particlesContainer);

    // Add CSS animation for particles
    if (!document.querySelector("#particle-styles")) {
      const style = document.createElement("style");
      style.id = "particle-styles";
      style.textContent = `
                @keyframes float {
                    0% { transform: translateY(100vh) rotate(0deg); }
                    100% { transform: translateY(-100vh) rotate(360deg); }
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Initialize particles on landing page
  createParticles();

  // Add typewriter effect for hero title
  function typewriterEffect(element, text, speed = 100) {
    element.innerHTML = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }

  // Apply typewriter effect when landing page is shown
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        const target = mutation.target;
        if (
          target.id === "landing-page" &&
          target.classList.contains("active")
        ) {
          const heroTitle = target.querySelector(".hero-title");
          if (heroTitle && !heroTitle.dataset.typed) {
            heroTitle.dataset.typed = "true";
            setTimeout(() => {
              typewriterEffect(heroTitle, "Find your inspiration.", 80);
            }, 500);
          }
        }
      }
    });
  });

  // Observe all pages for class changes
  document.querySelectorAll(".page").forEach((page) => {
    observer.observe(page, { attributes: true });
  });

  // Add search functionality
  const searchInput = document.querySelector(".nav-search input");
  const searchBtn = document.querySelector(".search-btn");

  if (searchInput && searchBtn) {
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      showNotification(`Searching for "${query}"...`, "info");
      // Here you would implement actual search functionality
      setTimeout(() => {
        showNotification("Search feature coming soon!", "info");
      }, 1500);
    }
  }

  // Add form validation styling
  function addValidationStyles() {
    const style = document.createElement("style");
    style.textContent = `
            .form-group input.invalid {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
            
            .form-group input.valid {
                border-color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
            
            .validation-message {
                font-size: 0.8rem;
                margin-top: 0.25rem;
                padding-left: 0.5rem;
            }
            
            .validation-message.error {
                color: #ef4444;
            }
            
            .validation-message.success {
                color: #10b981;
            }
        `;
    document.head.appendChild(style);
  }

  addValidationStyles();

  // Real-time form validation
  function addRealTimeValidation() {
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input) => {
      input.addEventListener("blur", validateField);
      input.addEventListener("input", clearValidation);
    });
  }

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();

    // Remove existing validation message
    const existingMessage = field.parentNode.querySelector(
      ".validation-message"
    );
    if (existingMessage) {
      existingMessage.remove();
    }

    let isValid = true;
    let message = "";

    // Validation rules
    switch (field.type) {
      case "email":
        if (value && !isValidEmail(value)) {
          isValid = false;
          message = "Please enter a valid email address";
        }
        break;
      case "password":
        if (field.id === "signup-password" && value && value.length < 8) {
          isValid = false;
          message = "Password must be at least 8 characters long";
        }
        break;
      case "text":
        if (field.hasAttribute("required") && !value) {
          isValid = false;
          message = "This field is required";
        }
        break;
    }

    // Special case for password confirmation
    if (field.id === "confirm-password") {
      const passwordField = document.getElementById("signup-password");
      if (value && passwordField && value !== passwordField.value) {
        isValid = false;
        message = "Passwords do not match";
      }
    }

    // Apply validation styles
    field.classList.remove("valid", "invalid");
    if (value) {
      field.classList.add(isValid ? "valid" : "invalid");

      if (message) {
        const messageEl = document.createElement("div");
        messageEl.className = `validation-message ${
          isValid ? "success" : "error"
        }`;
        messageEl.textContent = message;
        field.parentNode.appendChild(messageEl);
      }
    }
  }

  function clearValidation(e) {
    const field = e.target;
    field.classList.remove("valid", "invalid");
    const message = field.parentNode.querySelector(".validation-message");
    if (message) {
      message.remove();
    }
  }

  addRealTimeValidation();

  // Add progress indicator for forms
  function addFormProgress() {
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
      const progressBar = document.createElement("div");
      progressBar.className = "form-progress";
      progressBar.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0% Complete</div>
            `;

      const progressStyles = `
                .form-progress {
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                    width: 0%;
                    transition: width 0.3s ease;
                }
                
                .progress-text {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.6);
                }
            `;

      if (!document.querySelector("#progress-styles")) {
        const style = document.createElement("style");
        style.id = "progress-styles";
        style.textContent = progressStyles;
        document.head.appendChild(style);
      }

      signupForm.insertBefore(progressBar, signupForm.firstChild);

      // Update progress on input
      const formInputs = signupForm.querySelectorAll("input[required]");
      formInputs.forEach((input) => {
        input.addEventListener("input", updateFormProgress);
      });
    }
  }

  function updateFormProgress() {
    const signupForm = document.getElementById("signup-form");
    const requiredInputs = signupForm.querySelectorAll("input[required]");
    const filledInputs = Array.from(requiredInputs).filter(
      (input) => input.value.trim() !== ""
    );

    const progress = (filledInputs.length / requiredInputs.length) * 100;
    const progressFill = document.querySelector(".progress-fill");
    const progressText = document.querySelector(".progress-text");

    if (progressFill && progressText) {
      progressFill.style.width = progress + "%";
      progressText.textContent = Math.round(progress) + "% Complete";
    }
  }

  addFormProgress();

  // Add smooth page transitions
  function addPageTransitions() {
    const style = document.createElement("style");
    style.textContent = `
            .page {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .page.active {
                opacity: 1;
                transform: translateY(0);
            }
            
            .page.fade-out {
                opacity: 0;
                transform: translateY(-20px);
            }
        `;
    document.head.appendChild(style);
  }

  addPageTransitions();

  // Enhanced page transition function
  const originalShowPage = showPage;
  showPage = function (pageId) {
    const currentPage = document.querySelector(".page.active");
    const targetPage = document.getElementById(pageId);

    if (currentPage) {
      currentPage.classList.add("fade-out");
      setTimeout(() => {
        currentPage.classList.remove("active", "fade-out");
        targetPage.classList.add("active");
      }, 250);
    } else {
      targetPage.classList.add("active");
    }
  };

  // Initialize the page
  console.log("Blog website initialized successfully!");
});
