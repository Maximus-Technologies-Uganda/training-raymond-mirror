import { TodoPlaceholder } from '../components/index.js';

/**
 * ToDo page for managing actionable tasks with deterministic clocks.
 * This page will eventually handle task entry, completion, and time-based filtering.
 */
export function ToDoPage(): JSX.Element {
  return (
    <section aria-labelledby="todo-heading" className="page">
      <header className="page-header">
        <h2 id="todo-heading">ToDo</h2>
        <p>
          Manage actionable tasks with deterministic clocks. This placeholder keeps routes wired while
          ToDo UI logic is under construction.
        </p>
      </header>
      <TodoPlaceholder />
    </section>
  );
}
