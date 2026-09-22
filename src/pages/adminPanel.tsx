import { Header } from "../components/layout/header"
import { AdminPanelLayout } from "../components/admin/AdminPanelLayout"
import { useHeader } from "../hooks/useHeader"
import { useAdmin } from "../hooks/useAdmin"

export function AdminPanelPage() {
  const headerProps = useHeader()
  const adminAgenciesProps = useAdmin()

  return (
    <AdminPanelLayout
      header={<Header {...headerProps} />}
      {...adminAgenciesProps}
    />
  )
}

export default AdminPanelPage
