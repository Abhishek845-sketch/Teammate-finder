const teammates = [
  {
    name: "Aarav Sharma",
    college: "NIT Jamshedpur",
    bio: "Building web apps and exploring AI/ML.",
    skills: ["JavaScript", "Python", "React"]
  },
  {
    name: "Priya Singh",
    college: "NIT Jamshedpur",
    bio: "Interested in competitive programming and web development.",
    skills: ["C++", "JavaScript", "Python"]
  },
  {
    name: "Rohan Mehta",
    college: "NIT Jamshedpur",
    bio: "Love building robots and embedded projects.",
    skills: ["C++", "Embedded"]
  },
  {
    name: "Sneha Verma",
    college: "NIT Durgapur",
    bio: "Designing clean and user-friendly interfaces.",
    skills: ["UI/UX Design", "JavaScript"]
  },
  {
    name: "Kabir Das",
    college: "IIEST Shibpur",
    bio: "Interested in machine learning and AI projects.",
    skills: ["Python", "JavaScript"]
  },
  {
    name: "Ananya Roy",
    college: "NIT Jamshedpur",
    bio: "Building creative frontend experiences.",
    skills: ["React", "JavaScript", "UI/UX Design"]
  }
];

const profileList = document.getElementById("profileList");
const searchInput = document.getElementById("searchInput");
const skillFilter = document.getElementById("skillFilter");
const emptyMessage = document.getElementById("emptyMessage");

function renderProfiles() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedSkill = skillFilter.value.toLowerCase();

  const filtered = teammates.filter(person => {
    const searchableText = [
      person.name,
      person.college,
      person.bio,
      ...person.skills
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesSkill = !selectedSkill ||
      person.skills.some(skill =>
        skill.toLowerCase() === selectedSkill
      );

    return matchesSearch && matchesSkill;
  });

  profileList.innerHTML = filtered.map(person => `
    <article class="profile-card">
      <div class="avatar">
        ${person.name.charAt(0)}
      </div>

      <h3>${person.name}</h3>
      <p class="college">${person.college}</p>
      <p class="bio">${person.bio}</p>

      <div class="skills">
        ${person.skills.map(skill =>
          `<span class="skill">${skill}</span>`
        ).join("")}
      </div>

      <button type="button"
        data-name="${person.name}">
        View Profile
      </button>
    </article>
  `).join("");

  emptyMessage.hidden = filtered.length !== 0;
}

profileList.addEventListener("click", event => {
  const button = event.target.closest("button");

  if (!button) return;

  const person = teammates.find(
    item => item.name === button.dataset.name
  );

  if (person) {
    alert(
      `Name: ${person.name}\n` +
      `College: ${person.college}\n` +
      `Skills: ${person.skills.join(", ")}\n` +
      `About: ${person.bio}`
    );
  }
});

searchInput.addEventListener("input", renderProfiles);
skillFilter.addEventListener("change", renderProfiles);

renderProfiles();