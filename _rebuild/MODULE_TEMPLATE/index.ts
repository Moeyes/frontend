// Public surface of the MODULE_NAME module.
// Only export what other modules actually need to import.
// Keep this minimal — prefer co-location over cross-module imports.

export { ExampleList } from './components/ExampleList'
export { ExampleCreateForm } from './components/ExampleCreateForm'
// Do NOT export hooks or services here — they are internal
