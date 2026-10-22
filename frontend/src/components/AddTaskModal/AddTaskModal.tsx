import { useState } from "react";
import type { FormEvent } from "react";
import type { TaskPeriod } from "../../types";
import "./AddTaskModal.css";

interface AddTaskModalProps {
  defaultPeriod: TaskPeriod;
  onAddTask: (title: string, image: string, period: TaskPeriod[]) => void;
  onCancel: () => void;
}

const taskSuggestions = [
  { title: "Borsta tänderna", image: "🪥" },
  { title: "Klä på mig", image: "👕" },
  { title: "Äta frukost", image: "🍳" },
  { title: "Packa väskan", image: "🎒" },
  { title: "Göra läxan", image: "📚" },
  { title: "Plocka undan", image: "🧹" },
];

const periodOptions: { value: TaskPeriod; label: string }[] = [
  { value: "morning", label: "🌅 Morgon" },
  { value: "day", label: "☀️ Under dagen" },
  { value: "evening", label: "🌙 Kväll" },
];

function AddTaskModal({
  defaultPeriod,
  onAddTask,
  onCancel,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [customPeriods, setCustomPeriods] = useState<TaskPeriod[]>([
    defaultPeriod,
  ]);

  const [selectedSuggestion, setSelectedSuggestion] = useState<
    (typeof taskSuggestions)[number] | null
  >(null);
  const [suggestionPeriods, setSuggestionPeriods] = useState<TaskPeriod[]>([
    defaultPeriod,
  ]);

  const handlePeriodChange = (
    period: TaskPeriod,
    currentPeriods: TaskPeriod[],
    setPeriods: (periods: TaskPeriod[]) => void,
  ) => {
    setPeriods(
      currentPeriods.includes(period)
        ? currentPeriods.filter((item) => item !== period)
        : [...currentPeriods, period],
    );
  };

  const renderPeriodOptions = (
    periods: TaskPeriod[],
    setPeriods: (periods: TaskPeriod[]) => void,
    section: string,
  ) => (
    <fieldset className="add-task-periods">
      <legend>Välj tidpunkt</legend>
      {periodOptions.map((option) => (
        <label key={`${section}-${option.value}`}>
          <input
            type="checkbox"
            checked={periods.includes(option.value)}
            onChange={() =>
              handlePeriodChange(option.value, periods, setPeriods)
            }
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );

  const handleCustomSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || customPeriods.length === 0) return;

    onAddTask(title.trim(), "", customPeriods);
  };

  const handleSuggestionSubmit = () => {
    if (!selectedSuggestion || suggestionPeriods.length === 0) return;

    onAddTask(
      selectedSuggestion.title,
      selectedSuggestion.image,
      suggestionPeriods,
    );
  };

  return (
    <div className="add-task-modal">
      <h3 className="add-task-title">Lägg till en uppgift</h3>

      <section className="add-task-section">
        <h4>Skapa en egen uppgift</h4>

        <form className="add-task-form" onSubmit={handleCustomSubmit}>
          <div className="task-title-field">
            <label htmlFor="task-title">Vad ska göras?</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Skriv en uppgift..."
              required
            />
          </div>

          {renderPeriodOptions(customPeriods, setCustomPeriods, "custom")}

          <button
            className="add-task-action"
            type="submit"
            disabled={!title.trim() || customPeriods.length === 0}
          >
            Lägg till egen uppgift
          </button>
        </form>
      </section>

      <section className="add-task-section">
        <h4>Välj bland förslag</h4>

        <p>Välj en uppgift och bestäm när den ska göras.</p>

        <div className="task-suggestions">
          {taskSuggestions.map((suggestion) => {
            const isSelected =
              selectedSuggestion?.title === suggestion.title;

            return (
              <button
                key={suggestion.title}
                className={
                  isSelected
                    ? "task-suggestion-button task-suggestion-button--selected"
                    : "task-suggestion-button"
                }
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedSuggestion(suggestion)}
              >
                {suggestion.image} {suggestion.title}
              </button>
            );
          })}
        </div>

        {renderPeriodOptions(
          suggestionPeriods,
          setSuggestionPeriods,
          "suggestion",
        )}

        <button
          className="add-task-action"
          type="button"
          disabled={!selectedSuggestion || suggestionPeriods.length === 0}
          onClick={handleSuggestionSubmit}
        >
          Lägg till valt förslag
        </button>
      </section>

      <button
        className="add-task-cancel"
        type="button"
        onClick={onCancel}
      >
        Avbryt
      </button>
    </div>
  );
}

export default AddTaskModal;
