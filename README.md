# training-raymond

A training project for Raymond implementing three command-line tools during Week 1 of the Foundations + CI Discipline track.

## Quick Start

### Installation
```bash
npm install
```

### Running CLIs
```bash
node src/hello/index.js --name Raymond --shout
```

### Testing
```bash
npm test          # Run tests once
npm run test:watch # Watch mode
```

### Linting
```bash
npm run lint
```

## Project Structure

```
├── src/
│   ├── hello/              # Hello CLI (greeting utility)
│   ├── stopwatch/          # Stopwatch CLI (timing utility)
│   └── temperature/        # Temperature Converter CLI
├── tests/                  # Test suite
├── docs/
│   ├── journals/          # Daily work journals
│   ├── workbooks/         # Workbook references
│   └── review-packet-week1.md
├── package.json
└── README.md
```

## Week 1 CLIs

### 1. Hello CLI
Greets users by name with optional shout mode.

**Usage:**
```bash
node src/hello/index.js                    # Greets "World"
node src/hello/index.js --name Raymond     # Greets Raymond
node src/hello/index.js --name John --shout # Shouts
```

### 2. Stopwatch CLI
Tracks elapsed time with lap functionality.

**Usage:**
```bash
node src/stopwatch/index.js start
node src/stopwatch/index.js lap
node src/stopwatch/index.js stop
```

### 3. Temperature Converter CLI
Converts between Celsius and Fahrenheit.

**Usage:**
```bash
node src/temperature/index.js --from C --to F 32
node src/temperature/index.js --from F --to C 0
```

## Development Notes

- **Branch:** Features branch from `development`, open PRs for review
- **Tests:** Write tests before/alongside implementation (TDD)
- **Commits:** Small, focused commits with clear messages
- **CI:** All PRs must pass checks before merging

## Dependencies

- **vitest** - Testing framework
- **eslint** - Code linting (optional)

## Track Info

- **Track:** Foundations + CI Discipline
- **Mentor:** Paul Mwanje
- **Duration:** Week 1 (5 days)
- **Mirror:** This repo is mirrored to [training-raymond-mirror](https://github.com/Maximus-Technologies-Uganda/training-raymond-mirror)