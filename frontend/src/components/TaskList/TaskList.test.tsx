import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import TaskList from "./TaskList";
import type { TaskPeriod } from "../../types";

describe("TaskList", () => {
  it("visar ett meddelande när listan är tom", () => {
    render(
      <TaskList
        tasks={[]}
        period="morning"
        onComplete={jest.fn()}
        onUndo={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Inga uppgifter ännu.")).toBeInTheDocument();
  });

  it("visar uppgiftens titel när listan innehåller en uppgift", () => {
    const task = {
      id: 1,
      profileId: 1,
      title: "Borsta tänderna",
      image: "🪥",
      period: ["morning"] as TaskPeriod[],
      statusByPeriod: {
        morning: "todo" as const,
      },
    };

    render(
      <TaskList
        tasks={[task]}
        period="morning"
        onComplete={jest.fn()}
        onUndo={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Borsta tänderna")).toBeInTheDocument();
  });

  it("anropar onComplete när användaren klickar på Klar", () => {
    const onComplete = jest.fn();

    const task = {
      id: 1,
      profileId: 1,
      title: "Borsta tänderna",
      image: "🪥",
      period: ["morning"] as TaskPeriod[],
      statusByPeriod: {
        morning: "todo" as const,
      },
    };

    render(
      <TaskList
        tasks={[task]}
        period="morning"
        onComplete={onComplete}
        onUndo={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Markera Borsta tänderna som klar",
      }),
    );

    expect(onComplete).toHaveBeenCalledWith(1, "morning");
  });
});
