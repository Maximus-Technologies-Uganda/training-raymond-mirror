import './App.css';
import Expenses from './pages/Expenses';

/**
 * Main application component for Phase 3 Expenses UI implementation.
 * Displays the Expenses overview with filtering and totals.
 */
function App(): JSX.Element {
  return (
    <div className="App">
      <Expenses />
    </div>
  );
}

export default App;
