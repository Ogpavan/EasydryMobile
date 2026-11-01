export const delay = (ms = 550) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export const mockApi = async <T>(operation: () => T, ms = 550): Promise<T> => {
  await delay(ms);
  return operation();
};
