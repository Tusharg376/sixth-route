/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** agentation-mcp HTTP server, e.g. http://localhost:4747 (dev only). */
  readonly VITE_AGENTATION_ENDPOINT?: string;
  /** Form backend that accepts the contact brief as JSON. */
  readonly VITE_FORM_ENDPOINT?: string;
}
