import { Header } from "../components/layout/header"
import { AgencyPanelLayout } from "../components/agency/AgencyPanelLayout"
import { useAgency } from "../hooks/useAgency"
import { useHeader } from "../hooks/useHeader"

export function AgencyPanelPage() {
  const headerProps = useHeader()
  const agencyProps = useAgency()

  return (
    <AgencyPanelLayout
      header={<Header {...headerProps} />}
      {...agencyProps}
    />
  )
}

export default AgencyPanelPage
