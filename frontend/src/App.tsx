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
  // Stores the profiles fetched from the backend
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Tracks whether profiles are loading and whether an error occurred
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState("");
  const [profileActionError, setProfileActionError] = useState("");

  // Stores the ID of the currently selected profile
  const [activeProfileId, setActiveProfileId] = useState<number | null>(() => {
    const savedProfileId = localStorage.getItem("activeProfileId");
    return savedProfileId ? Number(savedProfileId) : null;
  });

  // Controls the visibility of the create-profile modal
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  // Stores tasks and tracks their loading and error states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [taskActionError, setTaskActionError] = useState("");

  // Controls the completion message and the period selected for a new task
  const [showFinishedMessage, setShowFinishedMessage] = useState(false);
  const [addTaskPeriod, setAddTaskPeriod] = useState<TaskPeriod | null>(null);

  // Fetch the profiles from the backend API.
  // Parse the response as JSON and update the profiles state.
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

  // Fetch the tasks from the backend API.
  // Parse the response as JSON and update the tasks state.
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

  // Update the active profile ID state with the selected profile ID.
  // Save the active profile ID in local storage.
  const handleSelectProfile = (profileId: number) => {
    setActiveProfileId(profileId);
    localStorage.setItem("activeProfileId", String(profileId));
    setShowFinishedMessage(false);
    setShowCreateProfile(false);
    setProfileActionError("");
  };

  // Send a POST request to the backend API to create a new profile.
  // Set the content type to JSON and send the profile name and avatar in the request body.
  // Add the new profile to the profiles state and close the create profile form.
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

  // Find the profile that matches the selected profile ID.
  // Stop the function if the profile does not exist.
  const handleDeleteProfile = (profileId: number) => {
    const profileToDelete = profiles.find(
      (profile) => profile.id === profileId,
    );

    if (!profileToDelete) {
      return;
    }

    // Send a DELETE request to the backend API to remove the profile.
    // Remove the deleted profile and its associated tasks from their respective states.
    // If the deleted profile is active, reset the active profile and remove it from local storage.
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

  // Find the currently active profile.
  const activeProfile = profiles.find(
    (profile) => profile.id === activeProfileId,
  );

  // Filter the tasks to include only those belonging to the active profile.
  const profileTasks = tasks.filter(
    (task) => task.profileId === activeProfileId,
  );

  // Define the task sections and their corresponding periods.
  const taskSections: { title: string; period: TaskPeriod }[] = [
    { title: "🌅 Morgon", period: "morning" },
    { title: "☀️ Under dagen", period: "day" },
    { title: "🌙 Kväll", period: "evening" },
  ];

  // Check if the active profile has at least one task and all tasks are marked as done for every period.
  const allTasksDone =
    profileTasks.length > 0 &&
    profileTasks.every((task) =>
      task.period.every((period) => task.statusByPeriod[period] === "done"),
    );

  // Hide the finished message if not all tasks are done.
  // Run the effect whenever allTasksDone changes.
  useEffect(() => {
    if (!allTasksDone) {
      setShowFinishedMessage(false);
    }
  }, [allTasksDone]);

  // Send a PATCH request to the backend API to update the task status for the specified period.
  // Parse the response as JSON and update the task in the tasks state.
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

  // Mark the task as done for the specified period.
  const handleComplete = (taskId: number, period: TaskPeriod) => {
    updateTaskStatus(taskId, period, "done");
  };

  // Mark the task as not done for the specified period.
  const handleUndo = (taskId: number, period: TaskPeriod) => {
    updateTaskStatus(taskId, period, "todo");
  };

  // Send a PATCH request to the backend API to start a new day for the active profile.
  // Parse the response as JSON to get the updated tasks.
  // Replace the active profile's tasks with the updated tasks.
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

  // Ask the user to confirm the task deletion.
  // Send a DELETE request to the backend API to remove the task.
  // Remove the deleted task from the tasks state.
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

  // Send a POST request to the backend API to create a new task for the active profile.
  // Set the content type to JSON and send the profile ID, title, image, and periods in the request body.
  // Parse the response as JSON and add the new task to the tasks state.
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
