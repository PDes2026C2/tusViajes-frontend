import type { TravelPackage } from "../models/package"

export function handleViewDetails(pkg: TravelPackage) {
  // Connect both package lists to the detail page when its route is available.
  console.info("Visualizando detalle del paquete:", pkg.name, pkg.id)
}
