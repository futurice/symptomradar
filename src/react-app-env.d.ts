/// <reference types="react-scripts" />

// Allow tsc to build our codebase even without webpack-specific tweaks
// See https://github.com/microsoft/TypeScript-React-Starter/issues/12
declare module '*.svg';

// We can't import the whole "iframe-resizer" library, so its typings aren't useful to us, either.
// See the import "iframe-resizer/js/iframeResizer" for details.
declare module 'iframe-resizer/js/iframeResizer';
