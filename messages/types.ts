import type en from './en.json';

export type Messages = typeof en;

export type TranslationKey = keyof Messages;

// Helper type to get nested keys
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

export type MessageKey = NestedKeyOf<Messages>;
