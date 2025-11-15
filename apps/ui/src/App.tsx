/**
 * Main Application Component
 *
 * Root application shell with navigation between tools:
 * - Expenses: Financial tracking and reporting
 * - ToDo: Task management with deterministic clocks
 * - Quote: Motivational quote explorer with filters
 *
 * Uses button-based navigation with proper ARIA attributes for accessibility.
 *
 * @module App
 */

import { useRef, useState, type KeyboardEvent } from 'react';
import './App.css';
import Expenses from './pages/Expenses';
import ToDo from './pages/ToDo';
import Quote from './pages/Quote';

/**
 * Available application tools/pages.
 */
type ActiveTool = 'expenses' | 'todo' | 'quote';

interface TabDefinition {
  id: ActiveTool;
  label: string;
  testId: string;
}

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
  const tabRefs = useRef<Record<ActiveTool, HTMLButtonElement | null>>({
    expenses: null,
    todo: null,
    quote: null,
  });

  const tabs: TabDefinition[] = [
    { id: 'expenses', label: 'Expenses', testId: 'nav-expenses' },
    { id: 'todo', label: 'ToDo', testId: 'nav-todo' },
    { id: 'quote', label: 'Quote', testId: 'nav-quote' },
  ];

  const focusTab = (tool: ActiveTool) => {
    const ref = tabRefs.current[tool];
    if (ref) {
      ref.focus();
    }
  };

  const activateTab = (tool: ActiveTool, shouldFocus = false) => {
    setActiveTool(tool);
    if (shouldFocus) {
      requestAnimationFrame(() => focusTab(tool));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tool: ActiveTool) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tool);
    if (currentIndex === -1) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextTab = tabs[(currentIndex + 1) % tabs.length];
      activateTab(nextTab.id, true);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      activateTab(nextTab.id, true);
    }
  };

  return (
    <div className="App">
      <div className="app-shell">
        <header className="app-header">
          <div className="app-hero">
            <h1 className="app-hero__title" data-testid="welcome-title">
              Training Raymond UI
            </h1>
            <p className="app-hero__subtitle">
              Foundations for the Expenses, ToDo, and Quote experiences.
            </p>
          </div>

          <nav className="app-nav" role="tablist" aria-label="Tool selection">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`panel-${tab.id}`}
              aria-selected={activeTool === tab.id}
              className={`app-nav__button${activeTool === tab.id ? ' app-nav__button--active' : ''}`}
              tabIndex={activeTool === tab.id ? 0 : -1}
              onClick={() => activateTab(tab.id, true)}
              onKeyDown={(event) => handleKeyDown(event, tab.id)}
              data-testid={tab.testId}
            >
              {tab.label}
            </button>
          ))}
          </nav>
        </header>

        <main className="app-content">
          <section
            role="tabpanel"
            id="panel-expenses"
            aria-labelledby="tab-expenses"
            hidden={activeTool !== 'expenses'}
          >
            {activeTool === 'expenses' && <Expenses />}
          </section>
          <section
            role="tabpanel"
            id="panel-todo"
            aria-labelledby="tab-todo"
            hidden={activeTool !== 'todo'}
          >
            {activeTool === 'todo' && <ToDo />}
          </section>
          <section
            role="tabpanel"
            id="panel-quote"
            aria-labelledby="tab-quote"
            hidden={activeTool !== 'quote'}
          >
            {activeTool === 'quote' && <Quote />}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
