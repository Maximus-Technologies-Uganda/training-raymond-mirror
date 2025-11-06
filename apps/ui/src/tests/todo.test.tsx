/**
 * ToDo Page Unit Tests
 *
 * Validates todo functionality with deterministic clock injection:
 * - Due date classification (yesterday/today/tomorrow boundaries)
 * - Duplicate title prevention
 * - Completion of non-existent IDs
 * - Filter behavior (priority, due today)
 * - User feedback for success/error states
 *
 * @module tests/todo
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToDo from '../pages/ToDo';
import { createTestClock } from './helpers';

describe('ToDo page', () => {
  describe('due date classification with deterministic clock', () => {
    it('categorizes tasks by due date relative to the injected clock', () => {
      // Fix clock to November 3, 2025 at 9am UTC
      const clock = createTestClock('2025-11-03T09:00:00Z');
      render(<ToDo clock={clock} />);

      // Task 1: Due Nov 2 (yesterday relative to clock)
      expect(screen.getByTestId('todo-due-1')).toHaveTextContent(/1 days? overdue|Due yesterday/i);

      // Task 2: Due Nov 3 (today relative to clock)
      expect(screen.getByTestId('todo-due-2')).toHaveTextContent('Due today');

      // Task 3: Due Nov 4 (tomorrow relative to clock)
      expect(screen.getByTestId('todo-due-3')).toHaveTextContent('Due tomorrow');
    });

    it('correctly identifies overdue tasks with multiple days past', () => {
      // Fix clock to November 10, 2025 (7 days after task 1 due date)
      const clock = createTestClock('2025-11-10T09:00:00Z');
      render(<ToDo clock={clock} />);

      expect(screen.getByTestId('todo-due-1')).toHaveTextContent('8 days overdue');
    });
  });

  describe('due today filter', () => {
    it('filters to only show tasks due today when requested', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      // Initially all tasks visible
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('todo-item-3')).toBeInTheDocument();

      // Enable "due today" filter
      const dueTodayToggle = screen.getByTestId('todo-filter-due-today');
      await user.click(dueTodayToggle);

      // Only task 2 (due today) should be visible
      expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-item-3')).not.toBeInTheDocument();
    });
  });

  describe('priority filter', () => {
    it('filters tasks by priority level', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      const prioritySelect = screen.getByTestId('todo-filter-priority');

      // Filter to high priority only
      await user.selectOptions(prioritySelect, 'high');

      // Only task 1 (high priority) should be visible
      expect(screen.getByTestId('todo-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-item-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('todo-item-3')).not.toBeInTheDocument();

      // Filter to medium priority
      await user.selectOptions(prioritySelect, 'med');

      expect(screen.queryByTestId('todo-item-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('todo-item-2')).toBeInTheDocument();
      expect(screen.queryByTestId('todo-item-3')).not.toBeInTheDocument();
    });
  });

  describe('adding tasks', () => {
    it('adds a new task and displays success feedback', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      const titleInput = screen.getByTestId('todo-title-input');
      await user.type(titleInput, 'Draft release notes');
      await user.click(screen.getByTestId('todo-submit'));

      // Verify task appears in list
      expect(await screen.findByText('Draft release notes')).toBeInTheDocument();

      // Verify success feedback
      const feedback = screen.getByTestId('todo-success');
      expect(feedback).toHaveTextContent('Added "Draft release notes"');
      expect(feedback).toHaveTextContent('#5'); // Should be ID 5 (nextId after seeded tasks)
    });

    it('shows duplicate error inline when adding an existing title', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      const titleInput = screen.getByTestId('todo-title-input');
      await user.type(titleInput, 'Prepare sprint review deck'); // Existing title
      await user.click(screen.getByTestId('todo-submit'));

      // Verify error feedback
      const errorFeedback = await screen.findByTestId('todo-error');
      expect(errorFeedback).toHaveTextContent('A todo with the same title already exists.');

      // Verify success feedback is NOT shown
      expect(screen.queryByTestId('todo-success')).not.toBeInTheDocument();
    });

    it('adds task with priority and due date', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      await user.type(screen.getByTestId('todo-title-input'), 'Submit Q4 reports');
      await user.selectOptions(screen.getByTestId('todo-priority-select'), 'high');
      await user.type(screen.getByTestId('todo-due-date-input'), '2025-11-15');
      await user.click(screen.getByTestId('todo-submit'));

      const newTask = await screen.findByText('Submit Q4 reports');
      const listItem = newTask.closest('li');
      expect(listItem).toBeInTheDocument();

      if (listItem) {
        expect(within(listItem as HTMLElement).getByText('HIGH')).toBeInTheDocument();
        expect(within(listItem as HTMLElement).getByText('Due in 12 days')).toBeInTheDocument();
      }
    });
  });

  describe('completing tasks', () => {
    it('marks a task complete via list action', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      const task1 = screen.getByTestId('todo-item-1');
      const completeButton = within(task1).getByRole('button', { name: /Mark.*complete/i });

      await user.click(completeButton);

      // Verify button is disabled
      expect(completeButton).toBeDisabled();
      expect(completeButton).toHaveTextContent('Done');

      // Verify success feedback
      expect(screen.getByTestId('todo-success')).toHaveTextContent(
        'Marked "Prepare sprint review deck" as complete.'
      );

      // Verify status indicator appears
      expect(screen.getByTestId('todo-status-1')).toHaveTextContent('Completed');
    });

    it('completes a task via ID form', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      await user.type(screen.getByTestId('todo-complete-input'), '2');
      await user.click(screen.getByTestId('todo-complete-submit'));

      // Verify success feedback
      expect(await screen.findByTestId('todo-success')).toHaveTextContent(
        'Marked "Reconcile October expenses" as complete.'
      );

      // Verify input is cleared
      expect(screen.getByTestId('todo-complete-input')).toHaveValue('');
    });

    it('surfaces error when completing an unknown id', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      await user.type(screen.getByTestId('todo-complete-input'), '999');
      await user.click(screen.getByTestId('todo-complete-submit'));

      const errorFeedback = await screen.findByTestId('todo-error');
      expect(errorFeedback).toHaveTextContent('Todo not found.');
      expect(screen.queryByTestId('todo-success')).not.toBeInTheDocument();
    });

    it('handles completing an already-completed task gracefully', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      // Complete task 1
      const task1 = screen.getByTestId('todo-item-1');
      await user.click(within(task1).getByRole('button', { name: /Mark.*complete/i }));

      // Try to complete again via form
      await user.type(screen.getByTestId('todo-complete-input'), '1');
      await user.click(screen.getByTestId('todo-complete-submit'));

      // Should show informative message, not error
      expect(await screen.findByTestId('todo-success')).toHaveTextContent(
        'Task "Prepare sprint review deck" was already complete.'
      );
    });
  });

  describe('summary metrics', () => {
    it('displays correct summary counts', () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      render(<ToDo clock={clock} />);

      expect(screen.getByTestId('todo-summary-total')).toHaveTextContent('4');
      expect(screen.getByTestId('todo-summary-pending')).toHaveTextContent('3'); // 3 incomplete
      expect(screen.getByTestId('todo-summary-completed')).toHaveTextContent('1'); // 1 complete
      expect(screen.getByTestId('todo-summary-due-today')).toHaveTextContent('1'); // Task 2
    });

    it('updates summary after adding a task', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      await user.type(screen.getByTestId('todo-title-input'), 'New task');
      await user.click(screen.getByTestId('todo-submit'));

      expect(await screen.findByTestId('todo-summary-total')).toHaveTextContent('5');
      expect(screen.getByTestId('todo-summary-pending')).toHaveTextContent('4');
    });

    it('updates summary after completing a task', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      const task1 = screen.getByTestId('todo-item-1');
      await user.click(within(task1).getByRole('button', { name: /Mark.*complete/i }));

      expect(await screen.findByTestId('todo-summary-pending')).toHaveTextContent('2');
      expect(screen.getByTestId('todo-summary-completed')).toHaveTextContent('2');
    });
  });

  describe('empty state', () => {
    it('shows empty state when all tasks filtered out', async () => {
      const clock = createTestClock('2025-11-03T09:00:00Z');
      const user = userEvent.setup();
      render(<ToDo clock={clock} />);

      // Filter to priority that doesn't exist
      // Since we only have high, med, low in seeded data, filter low and then also due today
      await user.selectOptions(screen.getByTestId('todo-filter-priority'), 'low');
      await user.click(screen.getByTestId('todo-filter-due-today'));

      // Should show empty state
      expect(await screen.findByTestId('todo-empty')).toHaveTextContent(
        'All caught up! Adjust filters or add a new task to get started.'
      );
    });
  });
});
