declare type BufferEncoding = string;

declare module 'node:fs' {
  import fs = require('fs');
  export = fs;
}

declare module 'fs' {
  export const promises: {
    readFile(path: string | URL, options?: any): Promise<any>;
    writeFile(path: string | URL, data: any, options?: any): Promise<void>;
    mkdir(path: string | URL, options?: any): Promise<void>;
  };
}

declare module 'node:path' {
  import path = require('path');
  export = path;
}

declare module 'path' {
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
}

declare module 'node:url' {
  import url = require('url');
  export = url;
}

declare module 'url' {
  export function pathToFileURL(path: string): URL;
}

declare const process: {
  argv: string[];
  exitCode?: number;
};
