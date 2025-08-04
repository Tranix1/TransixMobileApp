// Utilities/notificationRoute.ts
let pendingNotificationRoute: string | null = null;

export function setPendingRoute(route: string) {
  pendingNotificationRoute = route;
}

export function consumePendingRoute(): string | null {
  const route = pendingNotificationRoute;
  pendingNotificationRoute = null; // clear after consuming
  return route;
}
