import { UnauthorizedView } from "../components/auth/UnauthorizedView"
import { useHeader } from "../hooks/useHeader"

export default function UnauthorizedPage() {
  const headerProps = useHeader()
  return <UnauthorizedView headerProps={headerProps} />
}
