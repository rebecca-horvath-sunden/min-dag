import "./index.css";
import { useEffect, useState } from "react";
import Header from "./components/Header/Header";
import ProfileSelector from "./components/ProfileSelector/ProfileSelector";
import TaskList from "./components/TaskList/TaskList";
import type { Profile, Task, TaskPeriod } from "./types";
import AddTaskModal from "./components/AddTaskModal/AddTaskModal";
import CreateProfileModal from "./components/CreateProfilModal/CreateProfileModal";
import API_URL from "./api";

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState("");
  const [profileActionError, setProfileActionError] = useState("");
  const [activeProfileId, setActiveProfileId] = useState<number | null>(() => {
    const savedProfileId = localStorage.getItem("activeProfileId");
    return savedProfileId ? Number(savedProfileId) : null;
  });
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskActionError, setTaskActionError] = useState("");
  const [showFinishedMessage, setShowFinishedMessage] = useState(false);
  const [addTaskPeriod, setAddTaskPeriod] = useState<TaskPeriod | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/profiles`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta profiler.");
        }
        return response.json();
      })
      .then((data: Profile[]) => {
        setProfiles(data);
        setProfilesError("");
      })
      .catch((error: unknown) => {
        console.error(error);
        setProfilesError("Kunde inte ladda profilerna. Försök igen senare.");
      })
      .finally(() => {
        setProfilesLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/tasks`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta uppgifter.");
        }
        return response.json();
      })
      .then((data: Task[]) => {
        setTasks(data);
        setTasksError("");
      })
      .catch((error: unknown) => {
        console.error(error);
        setTasksError("Kunde inte ladda uppgifterna. Försök igen senare.");
      })
      .finally(() => {
        setTasksLoading(false);
      });
  }, []);

  const handleSelectProfile = (profileId: number) => {
    setActiveProfileId(profileId);
    localStorage.setItem("activeProfileId", String(profileId));
    setShowFinishedMessage(false);
    setShowCreateProfile(false);
    setProfileActionError("");
  };

  const handleCreateProfile = (name: string, avatar: string) => {
    setProfileActionError("");

    fetch(`${API_URL}/api/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, avatar }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte skapa profil.");
        }
        return response.json();
      })
      .then((newProfile: Profile) => {
        setProfiles((currentProfiles) => [...currentProfiles, newProfile]);
        setShowCreateProfile(false);
      })
      .catch((error: unknown) => {
        console.error("Fel vid skapande av profil:", error);
        setProfileActionError("Kunde inte skapa profilen. Försök igen.");
      });
  };

  const handleDeleteProfile = (profileId: number) => {
    const profileToDelete = profiles.find(
      (profile) => profile.id === profileId,
    );

    if (!profileToDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Är du säker på att du vill ta bort profilen ${profileToDelete.name}?`,
    );

    if (!confirmed) {
      return;
    }
    setProfileActionError("");

    fetch(`${API_URL}/api/profiles/${profileId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte ta bort profilen.");
        }

        setProfiles((currentProfiles) =>
          currentProfiles.filter((profile) => profile.id !== profileId),
        );

        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.profileId !== profileId),
        );

        if (activeProfileId === profileId) {
          setActiveProfileId(null);
          localStorage.removeItem("activeProfileId");
          setShowFinishedMessage(false);
        }
      })
      .catch((error: unknown) => {
        console.error("Fel vid borttagning av profil:", error);
        setProfileActionError("Kunde inte ta bort profilen. Försök igen.");
      });
  };

  const activeProfile = profiles.find(
    (profile) => profile.id === activeProfileId,
  );

  const profileTasks = tasks.filter(
    (task) => task.profileId === activeProfileId,
  );

  const taskSections: { title: string; period: TaskPeriod }[] = [
    { title: "🌅 Morgon", period: "morning" },
    { title: "☀️ Under dagen", period: "day" },
    { title: "🌙 Kväll", period: "evening" },
  ];

  const allTasksDone =
    profileTasks.length > 0 &&
    profileTasks.every((task) =>
      task.period.every((period) => task.statusByPeriod[period] === "done"),
    );

  useEffect(() => {
    if (!allTasksDone) {
      setShowFinishedMessage(false);
    }
  }, [allTasksDone]);

  const updateTaskStatus = (
    taskId: number,
    period: TaskPeriod,
    status: "todo" | "done",
  ) => {
    setTaskActionError("");

    fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ period, status }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte uppdatera uppgiften.");
        }

        return response.json();
      })
      .then((updatedTask: Task) => {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        );
      })
      .catch((error: unknown) => {
        console.error("Fel vid uppdatering av uppgift:", error);
        setTaskActionError("Kunde inte uppdatera uppgiften. Försök igen.");
      });
  };

  const handleComplete = (taskId: number, period: TaskPeriod) => {
    updateTaskStatus(taskId, period, "done");
  };

  const handleUndo = (taskId: number, period: TaskPeriod) => {
    updateTaskStatus(taskId, period, "todo");
  };
  const handleNewDay = async () => {
    if (activeProfileId === null) return;

    setTaskActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/profiles/${activeProfileId}/new-day`,
        { method: "PATCH" },
      );

      if (!response.ok) {
        throw new Error("Kunde inte starta en ny dag.");
      }

      const updatedProfileTasks: Task[] = await response.json();

      setTasks((currentTasks) => [
        ...currentTasks.filter((task) => task.profileId !== activeProfileId),
        ...updatedProfileTasks,
      ]);

      setShowFinishedMessage(false);
    } catch (error) {
      console.error("Fel vid start av ny dag:", error);
      setTaskActionError("Kunde inte starta en ny dag. Försök igen.");
    }
  };

  const handleDelete = async (taskId: number) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort uppgiften?",
    );

    if (!confirmed) return;
    setTaskActionError("");

    fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte ta bort uppgiften.");
        }

        setTasks((currentTasks) =>
          currentTasks.filter((task) => task.id !== taskId),
        );
      })
      .catch((error: unknown) => {
        console.error("Fel vid borttagning av uppgift:", error);
        setTaskActionError("Kunde inte ta bort uppgiften. Försök igen.");
      });
  };

  const handleAddTask = (
    title: string,
    image: string,
    periods: TaskPeriod[],
  ) => {
    if (activeProfileId === null) {
      return;
    }

    setTaskActionError("");

    fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileId: activeProfileId,
        title,
        image,
        period: periods,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte skapa uppgiften.");
        }
        return response.json();
      })
      .then((newTask: Task) => {
        setTasks((currentTasks) => [...currentTasks, newTask]);
        setAddTaskPeriod(null);
      })
      .catch((error: unknown) => {
        console.error("Fel vid skapande av uppgift:", error);
        setTaskActionError("Kunde inte skapa uppgiften. Försök igen.");
      });
  };

  return (
    <>
      <Header />

      <main>
        {profilesLoading && <p>Laddar profiler...</p>}

        {profilesError && <p role="alert">{profilesError}</p>}

        {!profilesLoading && !profilesError && (
          <ProfileSelector
            profiles={profiles}
            onSelectProfile={handleSelectProfile}
            onCreateProfile={() => {
              setActiveProfileId(null);
              localStorage.removeItem("activeProfileId");
              setShowFinishedMessage(false);
              setShowCreateProfile(true);
            }}
            onDeleteProfile={handleDeleteProfile}
            activeProfileId={activeProfileId}
          />
        )}

        {profileActionError && <p role="alert">{profileActionError}</p>}

        {showCreateProfile && (
          <CreateProfileModal
            onCreateProfile={handleCreateProfile}
            onCancel={() => {
              setShowCreateProfile(false);
              setProfileActionError("");
            }}
          />
        )}

        {activeProfile && (
          <>
            <p className="profile-greeting">Hej {activeProfile.name}! 👋</p>
            {taskActionError && <p role="alert">{taskActionError}</p>}

            {tasksLoading && <p>Laddar uppgifter...</p>}

            {tasksError && <p role="alert">{tasksError}</p>}

            {!tasksLoading && !tasksError && (
              <>
                {taskSections.map((section) => (
                  <section
                    key={section.period}
                    className={`task-period task-period--${section.period}`}
                  >
                    <h2 className="task-period-title">{section.title}</h2>

                    <TaskList
                      tasks={profileTasks.filter(
                        (task) =>
                          Array.isArray(task.period) &&
                          task.period.includes(section.period),
                      )}
                      period={section.period}
                      onComplete={handleComplete}
                      onUndo={handleUndo}
                      onDelete={handleDelete}
                    />
                  </section>
                ))}

                {addTaskPeriod !== null ? (
                  <AddTaskModal
                    defaultPeriod={addTaskPeriod}
                    onAddTask={handleAddTask}
                    onCancel={() => setAddTaskPeriod(null)}
                  />
                ) : (
                  <button
                    type="button"
                    className="add-task-button"
                    onClick={() => setAddTaskPeriod("morning")}
                  >
                    + Lägg till uppgift
                  </button>
                )}
                {allTasksDone && (
                  <button
                    className="finished-button"
                    type="button"
                    onClick={() => setShowFinishedMessage(true)}
                  >
                    Jag är klar! 🎉
                  </button>
                )}
                {showFinishedMessage && allTasksDone && (
                  <>
                    <p className="finished-message">
                      🎉 Bra jobbat! Du är klar med dagens uppgifter!
                    </p>
                    <button
                      type="button"
                      className="new-day-button"
                      onClick={handleNewDay}
                    >
                      🌅 Ny dag
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
