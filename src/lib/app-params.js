const isNode = typeof window === "undefined";

export const appParams = {
  appId: null,
  token: null,
  functionsVersion: null,
  appBaseUrl: !isNode ? window.location.origin : "",
};
