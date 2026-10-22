// Initialize the Express server and configure the port.
// Enable CORS and JSON request body parsing.
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Define the initial profiles with their IDs, names, and avatars
const profiles = [
  {
    id: 1,
    name: "Ines",
    avatar: "👧",
  },
  {
    id: 2,
    name: "Neo",
    avatar: "👦",
  },
  {
    id: 3,
    name: "Sammie",
    avatar: "👦",
  },
];

// Define the initial tasks for each profile, including their periods and statuses.
const tasks = [
  // Ines
  {
    id: 1,
    profileId: 1,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },
  {
    id: 2,
    profileId: 1,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["evening"],
    statusByPeriod: { evening: "todo" },
  },
  {
    id: 3,
    profileId: 1,
    title: "Klä på mig",
    image: "👕",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },

  // Neo
  {
    id: 4,
    profileId: 2,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },
  {
    id: 5,
    profileId: 2,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["evening"],
    statusByPeriod: { evening: "todo" },
  },
  {
    id: 6,
    profileId: 2,
    title: "Packa väskan",
    image: "🎒",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },

  // Sammie
  {
    id: 7,
    profileId: 3,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },
  {
    id: 8,
    profileId: 3,
    title: "Borsta tänderna",
    image: "🪥",
    period: ["evening"],
    statusByPeriod: { evening: "todo" },
  },
  {
    id: 9,
    profileId: 3,
    title: "Packa väskan",
    image: "🎒",
    period: ["morning"],
    statusByPeriod: { morning: "todo" },
  },
];

// Return all profiles as JSON.
app.get("/api/profiles", (req, res) => {
  res.json(profiles);
});

// Create a new profile and validate the required name.
app.post("/api/profiles", (req, res) => {
  const { name, avatar } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Profilen måste ha ett namn.",
    });
  }

  // Create a new profile, add it to the profiles array, and return it as JSON.
  const newProfile = {
    id: Date.now(),
    name: name.trim(),
    avatar: avatar || "",
  };

  profiles.push(newProfile);

  res.status(201).json(newProfile);
});

// Find the profile by ID and return an error if it does not exist.
// Remove the profile and all tasks associated with it.
// Return a 204 status code to indicate successful deletion.
app.delete("/api/profiles/:id", (req, res) => {
  const profileId = Number(req.params.id);

  const profileIndex = profiles.findIndex(
    (profile) => profile.id === profileId,
  );

  if (profileIndex === -1) {
    return res.status(404).json({
      message: "Profilen hittades inte.",
    });
  }

  
  profiles.splice(profileIndex, 1);

  
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].profileId === profileId) {
      tasks.splice(i, 1);
    }
  }

  res.status(204).send();
});

// Return all tasks as JSON.
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

// Validate the profile, task title, and selected periods.
// Initialize the task status for each selected period.
// Create the new task, add it to the tasks array, and return it as JSON.
app.post("/api/tasks", (req, res) => {
  const { profileId, title, image, period } = req.body;

  
  const profileExists = profiles.some(
    (profile) => profile.id === Number(profileId),
  );

  if (!profileExists) {
    return res.status(400).json({
      message: "Profilen finns inte.",
    });
  }

  
  const validPeriods = ["morning", "day", "evening"];

  if (
    !Array.isArray(period) ||
    period.length === 0 ||
    !period.every((item) => validPeriods.includes(item))
  ) {
    return res.status(400).json({
      message: "Välj minst en giltig tidsperiod.",
    });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Uppgiften måste ha en titel.",
    });
  }

  const statusByPeriod = Object.fromEntries(
    period.map((item) => [item, "todo"]),
  );

  const newTask = {
    id: Date.now(),
    profileId,
    title: title.trim(),
    ...(image ? { image } : {}),
    period,
    statusByPeriod,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// Validate the requested period and status, then find the task.
// Check that the task belongs to the selected period.
// Update the task status and return the updated task as JSON.
app.patch("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  const { period, status } = req.body;

  const validPeriods = ["morning", "day", "evening"];
  const validStatuses = ["todo", "done"];

  if (!validPeriods.includes(period)) {
    return res.status(400).json({
      message: "Ogiltig tidsperiod.",
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Ogiltig status.",
    });
  }

  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: "Uppgiften hittades inte.",
    });
  }

  if (!task.period.includes(period)) {
    return res.status(400).json({
      message: "Uppgiften tillhör inte den valda tidsperioden.",
    });
  }

  task.statusByPeriod[period] = status;

  res.json(task);
});

// Reset all task statuses for the selected profile and return the updated tasks.
app.patch("/api/profiles/:id/new-day", (req, res) => {
  const profileId = Number(req.params.id);

  const profileExists = profiles.some((profile) => profile.id === profileId);

  if (!profileExists) {
    return res.status(404).json({
      message: "Profilen hittades inte.",
    });
  }

  tasks
    .filter((task) => task.profileId === profileId)
    .forEach((task) => {
      task.statusByPeriod = Object.fromEntries(
        task.period.map((period) => [period, "todo"]),
      );
    });

  const profileTasks = tasks.filter((task) => task.profileId === profileId);

  res.json(profileTasks);
});

// Find the task by ID and return an error if it does not exist.
// Remove the task and return a 204 status code to indicate successful deletion.
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      message: "Uppgiften hittades inte.",
    });
  }

  tasks.splice(taskIndex, 1);

  res.status(204).send();
});

// Return a JSON message to confirm that the backend is running.
app.get("/", (req, res) => {
  res.json({
    message: "Backend fungerar!",
  });
});

// Start the server on the configured port.
app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
