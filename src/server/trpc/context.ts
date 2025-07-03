export async function createContext(req?: Request) {
  return {
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
