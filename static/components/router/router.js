import { Container } from 'https://components.int-t.com/core/container/container.js';
import loader from 'https://components.int-t.com/core/loader/loader.js';

const ROUTE_CHANGE = "route.change";


function getRouteByName(routes, path) {
  const targetRoute = routes.find((r => r.name == path.name));
  if (targetRoute == null) return null;
  const dr = { ...targetRoute, path: targetRoute.target, matched: [], param: path.param };
  dr.matched.push(dr);
  return dr;
}

function getRoute(routes, path = window.location.pathname) {
  if (path.name != null)
    return getRouteByName(routes, path);
  let defRoute = null;
  for (const route of routes) {
    const mt = match(path, route);
    if (mt == null) continue;
    const dr = { ...route, path, param: mt.groups };
    if (defRoute == null) defRoute = { ...dr, matched: [dr] };
    else defRoute.matched.push(dr);
  }
  return defRoute;
}

function match(path, route) {
  if (route == null) return null;
  if (route.path == null) return { groups: {} };
  return route.path.exec(path);
}

function setHistory(path, params, push) {
  if (push)
    return window.history.pushState(params, null, path);
  else
    return window.history.replaceState(params, null, path);
}

export class Router extends Container {
  _routes = null;

  async #setRoute(path) {    
    const route = getRoute(this._routes, path);
    if (route == null) return null;        
    const cls = route.name;
    if (cls != null) {
      this.className = cls;
    }
    const template = await loader.loadHTML(route.page);
    this.innerHTML =  template;
    const event = new CustomEvent(ROUTE_CHANGE, { detail: route });
    window.dispatchEvent(event);
    return route;
  }
  
  async goto(path, params, push = false) {
    if (this.routes == null) return;    
    const route = await this.#setRoute(path);
    if (route != null)
      setHistory(route.path, params, push);
  }

  async connectedCallback() {
    
  }

  set routes(value) {
    
    import(value).then(async (routes) => {
      this._routes = routes.routes;
      await this.goto(window.location.pathname + window.location.search, null, false);
    })
  }

  get routes() {
    return this._routes;
  }

}

customElements.define('i-router', Router);
