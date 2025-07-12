import { FetchChannel } from 'https://components.int-t.com/current/core/fetchChannel/fetchChannel.js';
import users from '../users/users.js';


class LogsChannel extends FetchChannel {
  async send(data) {
    await waitForUser
    const token = users.getBearerToken();
    this.headers['Content-Type'] = 'application/json';
    if (token != null) {
      this.headers['Authorization'] = token;      
    }    
    this.url = 'https://logs.core-regulus.com';
    return await super.send(JSON.stringify(data));
  }  
}

const channel = new LogsChannel();

async function waitForUser() {
  try {
    return await users.userReady;
  } catch {
    return null;
  }  
}

function createErrorFromReason(reason) {
  if (reason == null) return null;
  return {
    message: reason.message,
    code: reason.code,
    stack: reason.stack,
    request: reason.request || (reason.error && reason.error.request)
  };
}
function gatherErrorData(event) {
  const error = event.error ?? createErrorFromReason(event.reason);
  if (error == null) return null;

  const requestData = error.request || (error.error && error.error.request);

  return {
    message: error.message,
    eventType: event.type,
    href: window.location.href,    
    requestUrl: requestData?.url ?? null,
    requestBody: requestData?.body,
    requestStatus: requestData?.status ?? null,
    requestResponse: requestData?.response,
    settings: JSON.stringify({
      stack: error.stack,
      cause: error.cause,
      errorName: error.name,
      source: error,
      appVersion: window.navigator.appVersion,
      platform: window.navigator.platform,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    })
  };
}

function createLogObject(data) {
  return {
    message: data.message,
    eventType: data.type,
    href: window.location.href,    
    requestUrl: null,
    requestBody: null,
    requestStatus: null,
    requestResponse: null,
    settings: JSON.stringify({
      stack: null,
      appVersion: window.navigator.appVersion,
      platform: window.navigator.platform,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    })
  };
}

export async function send(data) {
  const uData = createLogObject(data);
  return await channel.send(uData);
}

async function handleError(event) {
  try {
    const data = gatherErrorData(event);
    await sendLogData(data);
  } catch (e) {
    console.error(e);
  }
}

send({
  message: 'enter',
  type: 'enter',
});

function onVisibilityChange() {
  setTimeout(() => {
    if (document.visibilityState === 'visible') {
      send({
        message: 'focus',
        type: 'focus',
      });
    } else {
      send({
        message: 'exit',
        type: 'exit',
      });
    }
  }, 0);
}

window.addEventListener('error', (event) => {
  setTimeout(() => {
    handleError(event);
  }, 0);
});

window.addEventListener('unhandledrejection', (event) => {
  setTimeout(() => {
    handleError(event);
  }, 0);
});
window.document.addEventListener('visibilitychange', onVisibilityChange);

export default {
  send,
};
