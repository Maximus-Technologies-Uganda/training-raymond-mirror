import './App.css';
import { ExpensesPage, QuotePage, ToDoPage } from './pages/index.js';

/**
 * Main application component integrating all Week 3 UI pages.
 * Displays Expenses, ToDo, and Quote experiences in a single view for Phase 2 demonstration.
 */
function App(): JSX.Element {
  return (
    <div className="App" role="main">
      <header className="App-header">
        <h1 data-testid="welcome-title">Training Raymond UI</h1>
        <p>
          Foundations for the Expenses, ToDo, and Quote experiences are ready. Build out each page and
          its shared components during later phases.
        </p>
      </header>
      <div className="App-content" data-testid="page-placeholders">
        <ExpensesPage />
        <ToDoPage />
        <QuotePage />
      </div>
    </div>
  );
}

export default App;
