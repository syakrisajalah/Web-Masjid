// /// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    GOOGLE_SCRIPT_URL?: string;
    [key: string]: string | undefined;
  }
}