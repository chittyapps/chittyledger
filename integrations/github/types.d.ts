export {}

declare global {
  interface KVNamespace {
    get(key: string): Promise<string | null>
    put(key: string, value: string, options?: { expiration?: number; expirationTtl?: number }): Promise<void>
    delete(key: string): Promise<void>
  }
}
