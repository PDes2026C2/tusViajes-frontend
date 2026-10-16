import { useState } from "react"
import type { TravelPackage } from "../models/package"

export function usePackageDetailsModal() {
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null)

  const openDetails = (pkg: TravelPackage) => setSelectedPackage(pkg)
  const closeDetails = () => setSelectedPackage(null)

  return { selectedPackage, openDetails, closeDetails }
}
