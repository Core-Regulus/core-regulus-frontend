const ROUTE_CHANGE = "route.change";

function routeHandler(event) {
  const link = event.currentTarget;
  if (!link.classList.contains("route")) return;
  event.preventDefault();
  const disA = this.getAttribute('disabled');
  if (disA != null) return;
  matchRoute(gMountPoint, gRouterPoint, this, gRoutes);
}

function getRouteLinks(mountPoint) {
  return mountPoint?.querySelectorAll("a.route") || [];
}

function getRouteByName(routes, path) {
  const targetRoute = routes.find((r => r.name == path.name));
  if (targetRoute == null) return null;
  const dr = { ...targetRoute, path: targetRoute.target, matched: [], param: path.param };
  dr.matched.push(dr);
  return dr;
}


function getRoute(routes = gRoutes, path = window.location.pathname) {
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


function getLocalPath(path) {
  const origin = window.location.origin;
  const pArr = path.split(origin);
  if (pArr.length > 1) return pArr[1];
  return path;
}

function setRouteLinkActive(routeLinks, routes, path) {
  const route = getRoute(routes, path);
  for (const link of routeLinks) {
    const lPath = getLocalPath(link.href);
    if (route == null) {
      link.classList.remove("active");
      continue;
    }
    if (route?.matched.find((m) => m.path == lPath))
      link.classList.add("active");
    else
      link.classList.remove("active");
  }
}

function match(path, route) {
  if (route == null) return null;
  if (route.path == null) return { groups: {} };
  return route.path.exec(path);
}

function matchRoute(mountPoint, routerPoint, link, routes) {
  const lPath = getLocalPath(link.href);
  setRoute(mountPoint, routerPoint, routes, lPath);
  setHistory(link.href, null, true);
}

let gCurrent = null;
let initResolver = null;

const routerInitP = new Promise((resolve) => {
  initResolver = resolve;
});

async function current() {
  await routerInitP;
  return gCurrent;
}

async function setRoute(mountPoint, routerPoint, routes, path) {
  const route = getRoute(routes, path);
  if (route == null) return null;
  gCurrent = route;
  initResolver();
  const cls = route.name;
  if (cls != null) {
    mountPoint.className = cls;
  }
  setTimeout(() => {
    route.component.render(routerPoint, route);
  }, 0);
  updateRouteLinks(mountPoint, routes, path);
  const event = new CustomEvent(ROUTE_CHANGE, { detail: route });
  window.dispatchEvent(event);
  return route;
}

function setHistory(path, params, push) {
  if (push)
    return window.history.pushState(params, null, path);
  else
    return window.history.replaceState(params, null, path);
}

let gRoutes = [];
let gMountPoint = null;
let gRouterPoint = null;

function updateRouteLinks(mountPoint = gMountPoint, routes = gRoutes, path = getLocalPath(window.location.href)) {
  const routeLinks = getRouteLinks(mountPoint);
  for (const link of routeLinks) {
    link.removeEventListener("click", routeHandler);
    link.addEventListener("click", routeHandler);
  }
  setRouteLinkActive(routeLinks, routes, path);
}


function update(
  mountPoint = gMountPoint,
  routerPoint = gRouterPoint,
  routes = gRoutes
) {
  gMountPoint = mountPoint;
  gRouterPoint = routerPoint;
  gRoutes = routes;
  updateRouteLinks(mountPoint);
  setRoute(mountPoint, routerPoint, routes);
}

window.onpopstate = function () {
  update(gMountPoint, gRouterPoint, gRoutes);
};



export class Router extends HTMLElement {
  async goto(path, params, push = false) {
    await routerInitP;
    const route = await setRoute(gMountPoint, gRouterPoint, gRoutes, path);
    if (route != null)
      setHistory(route.path, params, push);
  }

}

customElements.define('i-router', Router);
