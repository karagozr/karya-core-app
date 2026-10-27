import type { FetchRemoteServiceOptions } from 'devexpress-dashboard/common/common-interfaces';
import { getAccessToken } from './auth';


const demoEndpoint = 'https://demos.devexpress.com/services/dashboard/api';
const backendEndpoint = import.meta.env.VITE_DASHBOARD_API_URL?.trim();

export const dashboardEndpoint = backendEndpoint || demoEndpoint;

export const dashboardRemoteService: FetchRemoteServiceOptions | undefined = backendEndpoint
  ? {
    async beforeSend(settings) {
      if (new URL(backendEndpoint, window.location.origin).hostname === 'demos.devexpress.com') {
        throw new Error('Application tokens must not be sent to the public Dashboard demo.');
      }

      const token = await getAccessToken();

      const headers = new Headers(settings.headers);
      headers.set('Content-Type', 'application/json; charset=utf-8');
      headers.set('Authorization', `Bearer ${token}`);
      settings.headers = headers;
    },
  }
  : undefined;
