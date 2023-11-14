import { ToastId } from "@chakra-ui/react"
import useUser from "components/[guild]/hooks/useUser"
import { useToastWithButton } from "hooks/useToast"
import { ArrowRight } from "phosphor-react"
import { useEffect, useRef } from "react"

const useNewSharedSocialsToast = (openAccountModal) => {
  const { sharedSocials } = useUser()
  const toastWithButton = useToastWithButton()
  const toastIdRef = useRef<ToastId>()

  const onClick = () => {
    openAccountModal()
    setTimeout(() => {
      document.getElementById("sharedSocialsButton").focus()
    }, 300)
    toastIdRef.current = null
  }

  useEffect(() => {
    if (!sharedSocials || !!toastIdRef.current) return
    if (sharedSocials?.some((sharedSocial) => sharedSocial.isShared === null))
      toastIdRef.current = toastWithButton({
        status: "info",
        title: "New privacy settings",
        description:
          "Some guilds could access your connected accounts from now on. See & manage them in account settings!",
        buttonProps: {
          children: "Open account modal",
          onClick,
          rightIcon: <ArrowRight />,
        },
        secondButtonProps: {
          children: "Later",
          variant: "ghost",
        },
        duration: null,
        isClosable: false,
      })
  }, [sharedSocials])
}

export default useNewSharedSocialsToast
