/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches errors in child components and displays
 * a user-friendly error message instead of crashing the entire application.
 * 
 * @component
 * @example
 * ```tsx
 * import { ErrorBoundary } from 'sorokit-ui';
 * import { MyComponent } from './MyComponent';
 * 
 * export function App() {
 *   return (
 *     <ErrorBoundary>
 *       <MyComponent />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * @param props - Component props
 * @param props.children - Child components to protect
 * @param props.fallback - Optional custom fallback UI (default: error message)
 * @param props.onError - Optional callback when error occurs
 * 
 * @returns The rendered ErrorBoundary or fallback UI on error
 * 
 * @remarks
 * - Only catches errors in child component render and lifecycle
 * - Event handlers should use try/catch
 * - Async errors won't be caught (use Promise catch blocks)
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export function ErrorBoundary({ 
  children, 
  fallback, 
  onError 
}: ErrorBoundaryProps) {
  // Component implementation
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}
