#!/usr/bin/env node

/**
 * Stopwatch CLI - Track elapsed time with lap functionality
 */

class Stopwatch {
  constructor() {
    this.startTime = null;
    this.laps = [];
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      throw new Error('Stopwatch is already running');
    }
    this.startTime = Date.now();
    this.isRunning = true;
    return 'Stopwatch started';
  }

  lap() {
    if (!this.isRunning) {
      throw new Error('Stopwatch not started. Use "start" command first.');
    }
    const lapTime = Date.now() - this.startTime;
    this.laps.push(lapTime);
    return this.formatTime(lapTime);
  }

  stop() {
    if (!this.isRunning) {
      throw new Error('Stopwatch not running');
    }
    this.isRunning = false;
    const totalTime = Date.now() - this.startTime;
    return this.formatTime(totalTime);
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds}s ${milliseconds}ms`;
  }

  getLaps() {
    return this.laps;
  }
}

const stopwatch = new Stopwatch();

function main() {
  const command = process.argv[2];

  try {
    let result;
    switch (command) {
      case 'start':
        result = stopwatch.start();
        break;
      case 'lap':
        result = stopwatch.lap();
        break;
      case 'stop':
        result = stopwatch.stop();
        break;
      default:
        console.log('Usage: stopwatch <start|lap|stop>');
        process.exit(0);
    }
    console.log(result);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export { Stopwatch };
main();
