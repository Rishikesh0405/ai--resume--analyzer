declare global {
  interface Window {
    puter: {
      auth: {
        signIn(): Promise<void>;
        signOut(): Promise<void>;
        isSignedIn(): boolean;
        getUser(): Promise<{ username: string; email: string; uuid: string }>;
      };
      fs: {
        upload(files: File[]): Promise<{ name: string; path: string }[]>;
        read(path: string): Promise<Blob>;
        readdir(path: string): Promise<{ name: string; path: string; is_dir: boolean }[]>;
        delete(path: string): Promise<void>;
      };
      ai: {
        chat(
          messages: Array<{ role: string; content: any }>,
          options?: { model?: string }
        ): Promise<{ message: { content: Array<{ type: string; text: string }> } }>;
      };
      kv: {
        set(key: string, value: string): Promise<void>;
        get(key: string): Promise<string | null>;
        del(key: string): Promise<void>;
        list(pattern?: string): Promise<string[]>;
      };
    };
  }
}

export {};
