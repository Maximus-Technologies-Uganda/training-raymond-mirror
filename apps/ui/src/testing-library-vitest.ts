/**
 * Custom Vitest matchers for DOM testing.
 * Provides a lightweight alternative to @testing-library/jest-dom for common assertions.
 */

import { expect } from 'vitest';

type MatcherResult = {
  pass: boolean;
  message: () => string;
};

type MaybeElement = Node | null | undefined;

/**
 * Ensures the received value is a valid DOM Node.
 */
function ensureNode(value: MaybeElement, matcherName: string): asserts value is Node {
  if (!value) {
    throw new Error(`${matcherName} received a nullish value.`);
  }

  if (typeof Node === 'undefined') {
    throw new Error(`${matcherName} requires a DOM-like environment (jsdom or happy-dom).`);
  }

  if (!(value instanceof Node)) {
    throw new Error(`${matcherName} expects a DOM Node, but received ${typeof value}.`);
  }
}

/**
 * Matcher: toBeInTheDocument()
 * Asserts that an element is present in the document.
 *
 * @example
 * expect(screen.getByRole('button')).toBeInTheDocument();
 */
function toBeInTheDocument(this: unknown, received: MaybeElement): MatcherResult {
  ensureNode(received, 'toBeInTheDocument');

  const ownerDocument = received.ownerDocument ?? null;
  const pass = Boolean(ownerDocument?.documentElement?.contains(received));

  return {
    pass,
    message: () =>
      pass
        ? 'Expected element not to be present in the document.'
        : 'Expected element to be present in the document, but it was not found.',
  };
}

/**
 * Matcher: toHaveTextContent(expected)
 * Asserts that an element's text content matches the expected value (string or regex).
 *
 * @example
 * expect(element).toHaveTextContent('Hello World');
 * expect(element).toHaveTextContent(/Hello/i);
 */
function toHaveTextContent(this: unknown, received: MaybeElement, expected: string | RegExp): MatcherResult {
  ensureNode(received, 'toHaveTextContent');

  const actual = received.textContent ?? '';
  const pass = typeof expected === 'string' ? actual.includes(expected) : expected.test(actual);

  return {
    pass,
    message: () =>
      pass
        ? `Expected element text not to match ${String(expected)}.`
        : `Expected element text to match ${String(expected)}, but received "${actual}".`,
  };
}

/**
 * Matcher: toBeVisible()
 * Asserts that an element is visible (not display: none, not visibility: hidden, has size).
 *
 * @example
 * expect(screen.getByRole('heading')).toBeVisible();
 */
function toBeVisible(this: unknown, received: MaybeElement): MatcherResult {
  ensureNode(received, 'toBeVisible');

  if (!(received instanceof Element)) {
    return {
      pass: false,
      message: () => 'toBeVisible expects an Element.',
    };
  }

  const style = window.getComputedStyle(received);
  const isVisible =
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    received.getBoundingClientRect().width > 0 &&
    received.getBoundingClientRect().height > 0;

  return {
    pass: isVisible,
    message: () => (isVisible ? 'Expected element not to be visible.' : 'Expected element to be visible.'),
  };
}

/**
 * Matcher: toHaveAttribute(name, value?)
 * Asserts that an element has the specified attribute, optionally with a specific value.
 *
 * @example
 * expect(button).toHaveAttribute('disabled');
 * expect(link).toHaveAttribute('href', '/home');
 */
function toHaveAttribute(
  this: unknown,
  received: MaybeElement,
  name: string,
  expectedValue?: string | RegExp,
): MatcherResult {
  ensureNode(received, 'toHaveAttribute');

  if (!(received instanceof Element)) {
    return {
      pass: false,
      message: () => 'toHaveAttribute expects an Element.',
    };
  }

  const hasAttribute = received.hasAttribute(name);
  if (!hasAttribute) {
    return {
      pass: false,
      message: () => `Expected element to have attribute "${name}", but it was not found.`,
    };
  }

  if (expectedValue === undefined) {
    return {
      pass: true,
      message: () => `Expected element not to have attribute "${name}".`,
    };
  }

  const actualValue = received.getAttribute(name) ?? '';
  const pass =
    typeof expectedValue === 'string' ? actualValue === expectedValue : expectedValue.test(actualValue);

  return {
    pass,
    message: () =>
      pass
        ? `Expected attribute "${name}" not to be "${String(expectedValue)}".`
        : `Expected attribute "${name}" to be "${String(expectedValue)}", but received "${actualValue}".`,
  };
}

/**
 * Matcher: toHaveClass(...classNames)
 * Asserts that an element has all the specified CSS classes.
 *
 * @example
 * expect(button).toHaveClass('btn', 'btn-primary');
 */
function toHaveClass(this: unknown, received: MaybeElement, ...classNames: string[]): MatcherResult {
  ensureNode(received, 'toHaveClass');

  if (!(received instanceof Element)) {
    return {
      pass: false,
      message: () => 'toHaveClass expects an Element.',
    };
  }

  const classList = Array.from(received.classList);
  const missingClasses = classNames.filter((className) => !classList.includes(className));

  const pass = missingClasses.length === 0;

  return {
    pass,
    message: () =>
      pass
        ? `Expected element not to have classes: ${classNames.join(', ')}.`
        : `Expected element to have classes: ${classNames.join(', ')}, but missing: ${missingClasses.join(', ')}.`,
  };
}

// Extend Vitest expect with custom matchers
expect.extend({
  toBeInTheDocument,
  toHaveTextContent,
  toBeVisible,
  toHaveAttribute,
  toHaveClass,
});

// TypeScript declaration merging for autocomplete
declare module 'vitest' {
  interface Assertion {
    toBeInTheDocument(): void;
    toHaveTextContent(expected: string | RegExp): void;
    toBeVisible(): void;
    toHaveAttribute(name: string, value?: string | RegExp): void;
    toHaveClass(...classNames: string[]): void;
  }

  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): void;
    toHaveTextContent(expected: string | RegExp): void;
    toBeVisible(): void;
    toHaveAttribute(name: string, value?: string | RegExp): void;
    toHaveClass(...classNames: string[]): void;
  }
}
