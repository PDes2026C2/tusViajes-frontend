import type { TravelPackage } from "../../models/package"
import { usePurchasePackage } from "../../hooks/usePurchasePackage"
import { useAuth } from "../../hooks/useAuth"
import { PackageDetailsModal } from "./PackageDetailsModal"

interface PurchasePackageDetailsModalProps {
  packageData: TravelPackage | null
  onClose: () => void
}

function SelectedPackageDetails({ packageData, onClose }: PurchasePackageDetailsModalProps & { packageData: TravelPackage }) {
  const purchase = usePurchasePackage(packageData, onClose)
  return <PackageDetailsModal packageData={packageData} onClose={onClose} purchase={purchase} />
}

export function PurchasePackageDetailsModal({ packageData, onClose }: PurchasePackageDetailsModalProps) {
  const { user, isAuthenticated } = useAuth()
  const accountKey = isAuthenticated ? user?.id : "guest"
  return packageData ? <SelectedPackageDetails key={`${packageData.id}:${accountKey}`} packageData={packageData} onClose={onClose} /> : null
}
