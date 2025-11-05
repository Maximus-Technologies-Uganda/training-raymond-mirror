/**
 * Main Application Component
 *
 * Root application shell with navigation between tools:
 * - Expenses: Financial tracking and reporting
 * - ToDo: Task management with deterministic clocks
 *
 * Uses button-based navigation with proper ARIA attributes for accessibility.
 *
 * @module App
 */

import { useState } from 'react';
import './App.css';
import Expenses from './pages/Expenses';
import ToDo from './pages/ToDo';

/**
 * Available application tools/pages.
 */
type ActiveTool = 'expenses' | 'todo';

/**
 * Root application component with tool navigation.
 * Implements tab-like navigation pattern with ARIA roles for accessibility.
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
function App(): JSX.Element {
  const [activeTool, setActiveTool] = useState<ActiveTool>('expenses');

  return (
    <div className="App">
      <div className="app-shell">
        <nav className="app-nav" role="tablist" aria-label="Tool selection">
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'expenses'}
            className={`app-nav__button${activeTool === 'expenses' ? ' app-nav__button--active' : ''}`}
            onClick={() => setActiveTool('expenses')}
            data-testid="nav-expenses"
          >
            Expenses
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'todo'}
            className={`app-nav__button${activeTool === 'todo' ? ' app-nav__button--active' : ''}`}
            onClick={() => setActiveTool('todo')}
            data-testid="nav-todo"
          >
            ToDo
          </button>
        </nav>

        <main className="app-content">
          {activeTool === 'expenses' ? <Expenses /> : <ToDo />}
        </main>
      </div>
    </div>
  );
}

export default App;
