import axios, { AxiosInstance } from 'axios';
import { generateProof, buildAccessContext, IdentityData } from 'zwt-access-lib'

interface SetupOptions {
  identity: IdentityData;
  groupMembers: string[];
}

export function setupSemaphoreInterceptor(options: SetupOptions): AxiosInstance {
  const { identity, groupMembers } = options;

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  api.interceptors.request.use(
    async (config) => {
      if (config.url?.startsWith('/protected')) {
        try {
          const { signal, externalNullifier } = buildAccessContext(
            config.url,
            'default',
            3600000
          );

          const proof = await generateProof({
            identity,
            groupMembers,
            signal,
            externalNullifier
          });

          config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
        } catch (error) {
          console.error('Failed to generate proof:', error);
          throw error;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
}
