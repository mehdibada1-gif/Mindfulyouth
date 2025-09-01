import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    window.addEventListener("resize", checkSize)
    checkSize(); // Initial check
    return () => window.removeEventListener("resize", checkSize)
  }, [])

  return isMobile
}
