require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

// Test the backend
app.get("/", (req, res) => {
  res.send("Teammate Finder backend is running!");
});

// Fetch teammate profiles from Supabase
app.get("/api/teammates", async (req, res) => {
  const { data, error } = await supabase
    .from("teammates")
    .select("*", { count: "exact" })
    .order("id", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({
      error: error.message
    });
  }

  console.log("Total records returned:", data.length);
  console.log("Names:", data.map(person => person.name));

  res.json(data);
});
app.post("/api/teammates", async (req, res) => {
const { name, college, skills, bio } = req.body;

// Validate the submitted information
if (
typeof name !== "string" ||
typeof college !== "string" ||
typeof bio !== "string" ||
!Array.isArray(skills) ||
!name.trim() ||
!college.trim() ||
!bio.trim() ||
skills.length === 0 ||
!skills.every(skill => typeof skill === "string" && skill.trim())
) {
return res.status(400).json({
error: "Please provide a valid name, college, skills, and bio."
});
}

const cleanSkills = skills.map(skill => skill.trim());

if (
name.trim().length > 100 ||
college.trim().length > 150 ||
bio.trim().length > 500 ||
cleanSkills.length > 15 ||
cleanSkills.some(skill => skill.length > 50)
) {
return res.status(400).json({
error: "One or more fields exceed the allowed length."
});
}

try {
const { data, error } = await supabase
.from("teammates")
.insert([{
name: name.trim(),
college: college.trim(),
skills: cleanSkills,
bio: bio.trim()
}])
.select()
.single();

if (error) {
  console.error("Supabase insert error:", error);

  return res.status(500).json({
    error: "Could not save the profile. Please try again."
  });
}

return res.status(201).json({
  message: "Profile created successfully!",
  teammate: data
});

} catch (error) {
console.error("Profile creation error:", error);

return res.status(500).json({
  error: "An unexpected error occurred."
});

}
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});