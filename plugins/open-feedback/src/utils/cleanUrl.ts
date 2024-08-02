export const cleanUrl = (fullUrl: string) => {
  const url = new URL(fullUrl);
  return url.pathname + url.search + url.hash;
};
