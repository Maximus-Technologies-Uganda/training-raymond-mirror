import ToDo from './ToDo';

/**
 * ToDo page wrapper for router compatibility.
 * This wrapper maintains backward compatibility with existing routing scaffolds
 * while delegating to the new full-featured ToDo component.
 *
 * @deprecated Use ToDo component directly for new implementations
 */
export function ToDoPage(): JSX.Element {
  return <ToDo />;
}
