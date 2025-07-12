import { JSONFetchChannel } from 'https://components.int-t.com/current/core/jsonFetchChannel/jsonFetchChannel.js';

class UserChannel extends JSONFetchChannel {
  async send(data) {
    const token = getBearerToken();
    if (token != null) {
      this.headers['Authorization'] = token;
    }    
    this.url = 'https://api.core-regulus.com/user/auth';
    return await super.send(data);
  }  
}

let gBearerToken = null;
const channel = new UserChannel();
const tokenKey = 'coreRegulusToken';

function getBearerToken() {
  let token = gBearerToken;
  if (token == null) {
    token = window.localStorage[tokenKey];
    gBearerToken = token;
  }
  if (token == null || token == "undefined") return null;
  return `Bearer ${token}`;
}

function setBearerToken(token) {
  gBearerToken = token;
  window.localStorage[tokenKey] = token;
}

function removeBearerToken() {
  gBearerToken = null;
  delete window.localStorage[tokenKey];
}

window.onbeforeunload = function () {
  if (gBearerToken != null) setBearerToken(gBearerToken);
};

async function getUser(data = {}) {  
  data.userAgent = window.navigator.userAgent;
  const res = await channel.send(data);
  setBearerToken(res.token);
}

function onUserChanged(callback) {
  window.document.addEventListener('users.changed', callback);
}

function offUserChanged(callback) {
  window.document.removeEventListener('users.changed', callback);
}

const userReady = getUser();

export default {
  userReady,
  getUser,
  getBearerToken,
  on: {
    userChanged: onUserChanged,
  },
  off: {
    userChanged: offUserChanged,
  },
};
