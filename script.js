const profileList = document.getElementById("profileList");
const searchInput = document.getElementById("searchInput");
const skillFilter = document.getElementById("skillFilter");
const emptyMessage = document.getElementById("emptyMessage");

const profileForm = document.getElementById("profileForm");
const formMessage = document.getElementById("formMessage");

let teammates = [];

// Load teammate profiles from the backend
async function loadProfiles() {
  profileList.innerHTML = "<p>Loading teammates...</p>";

  try {
    const response = await fetch("https://teammate-finder-yow8.onrender.com/api/teammates");

    if (!response.ok) {
      throw new Error("Failed to load teammate profiles.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The backend did not return a profile list.");
    }

    teammates = data;
    renderProfiles();

  } catch (error) {
    console.error("Error loading profiles:", error);

    profileList.innerHTML =
      "<p>Could not load profiles. Make sure the backend is running.</p>";

    emptyMessage.hidden = true;
  }
}

// Escape text before inserting it into HTML
function escapeHTML(value) {
  const replacements = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value ?? "").replace(/[&<>"']/g, character => {
    return replacements[character];
  });
}

// Display and filter profiles
function renderProfiles() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedSkill = skillFilter.value.toLowerCase();

  const filtered = teammates.filter(person => {
    const skills = Array.isArray(person.skills) ? person.skills : [];

    const searchableText = [
      person.name || "",
      person.college || "",
      person.bio || "",
      ...skills
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesSkill = !selectedSkill ||
      skills.some(skill =>
        String(skill).toLowerCase() === selectedSkill
      );

    return matchesSearch && matchesSkill;
  });

  profileList.innerHTML = filtered.map(person => {
    const skills = Array.isArray(person.skills) ? person.skills : [];

    return `
      <article class="profile-card">

        <div class="avatar">
          ${escapeHTML(String(person.name || "?").charAt(0))}
        </div>

        <h3>${escapeHTML(person.name || "Unnamed")}</h3>

        <p class="college">
          ${escapeHTML(person.college || "")}
        </p>

        <p class="bio">
          ${escapeHTML(person.bio || "No bio available yet.")}
        </p>

        <div class="skills">
          ${skills.map(skill =>
            `<span class="skill">${escapeHTML(skill)}</span>`
          ).join("")}
        </div>

        <button type="button" data-id="${escapeHTML(person.id)}">
          View Profile
        </button>

      </article>
    `;
  }).join("");

  emptyMessage.hidden = filtered.length !== 0;
}

// Handle View Profile clicks
profileList.addEventListener("click", event => {
  const button = event.target.closest("button[data-id]");

  if (!button) return;

  const person = teammates.find(
    item => String(item.id) === button.dataset.id
  );

  if (!person) return;

  const skills = Array.isArray(person.skills) ? person.skills : [];

  alert(
    `Name: ${person.name || ""}\n` +
    `College: ${person.college || ""}\n` +
    `Skills: ${skills.join(", ")}\n` +
    `About: ${person.bio || "No bio available yet."}`
  );
});

// Search and skill filter
searchInput.addEventListener("input", renderProfiles);
skillFilter.addEventListener("change", renderProfiles);

// Submit a new profile
profileForm.addEventListener("submit", async event => {
  event.preventDefault();

  const submitButton = profileForm.querySelector(
    'button[type="submit"]'
  );

  const name = document.getElementById("profileName").value.trim();
  const college = document.getElementById("profileCollege").value.trim();
  const skillsInput = document.getElementById("profileSkills").value;
  const bio = document.getElementById("profileBio").value.trim();

  const skills = skillsInput
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);

  if (!name || !college || !bio || skills.length === 0) {
    formMessage.textContent =
      "Please fill in all fields, including at least one skill.";

    formMessage.style.color = "red";
    return;
  }

  formMessage.textContent = "Submitting your profile...";
  formMessage.style.color = "";
  submitButton.disabled = true;

  try {
    const response = await fetch(
      "https://teammate-finder-yow8.onrender.com/api/teammates",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          college,
          skills,
          bio
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || "Could not create your profile."
      );
    }

    formMessage.textContent = "Profile created successfully!";
    formMessage.style.color = "green";

    profileForm.reset();
    searchInput.value = "";
    skillFilter.value = "";

    await loadProfiles();

    document.getElementById("teammates").scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {
    console.error("Error creating profile:", error);

    formMessage.textContent =
      error.message || "Something went wrong. Please try again.";

    formMessage.style.color = "red";

  } finally {
    submitButton.disabled = false;
  }
});

// Start the application
loadProfiles();