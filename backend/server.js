const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Profiler
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

// Uppgifter
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

// Hämta alla profiler
app.get("/api/profiles", (req, res) => {
  res.json(profiles);
});

// Skapa en profil
app.post("/api/profiles", (req, res) => {
  const { name, avatar } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Profilen måste ha ett namn.",
    });
  }

  const newProfile = {
    id: Date.now(),
    name: name.trim(),
    avatar: avatar || "",
  };

  profiles.push(newProfile);

  res.status(201).json(newProfile);
});

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

  // Ta bort profilen.
  profiles.splice(profileIndex, 1);

  // Ta bort alla uppgifter som tillhör profilen.
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].profileId === profileId) {
      tasks.splice(i, 1);
    }
  }

  res.status(204).send();
});

// Hämta alla uppgifter
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const { profileId, title, image, period } = req.body;

  // Kontrollera att profilen finns.
  const profileExists = profiles.some(
    (profile) => profile.id === Number(profileId),
  );

  if (!profileExists) {
    return res.status(400).json({
      message: "Profilen finns inte.",
    });
  }

  // Kontrollera att alla tidsperioder är giltiga.
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

// Uppdatera status för en viss tidsperiod
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

// Starta en ny dag för en profil
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

// Testa att backend fungerar
app.get("/", (req, res) => {
  res.json({
    message: "Backend fungerar!",
  });
});

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
