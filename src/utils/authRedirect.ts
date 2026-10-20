import type { Role } from "../models/auth"

const roleHomePaths: Record<Role, string> = {
  BUYER: "/home",
  AGENCY: "/agency/panel",
  ADMIN: "/admin/panel",
}

export function getAuthRedirectPath(role: Role, requestedPath?: string | null): string {
  if (role === "BUYER" && requestedPath && ["/", "/home", "/favorites", "/my-trips"].includes(requestedPath)) {
    return requestedPath
  }
  return roleHomePaths[role]
}
