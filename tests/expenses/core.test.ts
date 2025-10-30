import { describe, expect, it } from 'vitest';
import {
  buildExpenseReport,
  filterExpenses,
  formatExpenseReport,
  normalizeMonth,
  parseExpenses,
  summarizeExpenses,
} from '../../src/expenses/core.js';

const CSV_SAMPLE = `date,category,amount\n2025-01-01,Groceries,10\n2025-02-03,Transport,12.5\n2025-02-10,Groceries,20`;

describe('normalizeMonth', () => {
  it('accepts numeric month strings', () => {
    expect(normalizeMonth('2')).toBe(2);
    expect(normalizeMonth('12')).toBe(12);
  });

  it('accepts month names', () => {
    expect(normalizeMonth('Feb')).toBe(2);
    expect(normalizeMonth('December')).toBe(12);
  });

  it('rejects invalid values', () => {
    expect(() => normalizeMonth('')).toThrow('Month cannot be empty');
    expect(() => normalizeMonth('nope')).toThrow('Invalid month value');
  });
});

describe('parseExpenses', () => {
  it('parses CSV input with header', () => {
    const records = parseExpenses(CSV_SAMPLE, 'csv');
    expect(records).toHaveLength(3);
    expect(records[1].category).toBe('Transport');
    expect(records[2].amount).toBe(20);
  });

  it('parses JSON input', () => {
    const json = JSON.stringify([
      { date: '2025-01-02', category: 'Food', amount: 5 },
      { date: '2025-01-03', category: 'Bills', amount: '7.20' },
    ]);
    const records = parseExpenses(json, 'json');
    expect(records).toHaveLength(2);
    expect(records[0].amount).toBe(5);
    expect(records[1].amount).toBe(7.2);
  });
});

describe('filter and summarize', () => {
  const records = parseExpenses(CSV_SAMPLE, 'csv');

  it('filters by month', () => {
    const filtered = filterExpenses(records, { month: 'Feb' });
    expect(filtered).toHaveLength(2);
  });

  it('filters by category case-insensitively', () => {
    const filtered = filterExpenses(records, { category: 'groceries' });
    expect(filtered).toHaveLength(2);
  });

  it('summarizes totals by category', () => {
    const summary = summarizeExpenses(records);
    expect(summary.total).toBeCloseTo(42.5, 2);
    expect(summary.totalsByCategory.find((item) => item.category === 'Groceries')?.amount).toBeCloseTo(30, 2);
  });

  it('builds full reports with formatting', () => {
    const report = buildExpenseReport(records, { month: 'Feb' });
    expect(report.entries).toHaveLength(2);
    const formatted = formatExpenseReport(report);
    expect(formatted).toContain('Total: $32.50');
    expect(formatted).toContain('Transport');
  });
});
