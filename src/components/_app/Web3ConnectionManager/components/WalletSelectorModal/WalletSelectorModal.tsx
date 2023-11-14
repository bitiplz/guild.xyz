import {
  Box,
  Icon,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import MetaMaskOnboarding from "@metamask/onboarding"

import { useUserPublic } from "components/[guild]/hooks/useUser"
import { useKeyPair } from "components/_app/KeyPairProvider"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import { Error } from "components/common/Error"
import Link from "components/common/Link"
import { Modal } from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import { useRouter } from "next/router"
import { ArrowLeft, ArrowSquareOut } from "phosphor-react"
import { useEffect, useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import useWeb3ConnectionManager from "../../hooks/useWeb3ConnectionManager"
import ConnectorButton from "./components/ConnectorButton"
import DelegateCashButton from "./components/DelegateCashButton"
import useIsWalletConnectModalActive from "./hooks/useIsWalletConnectModalActive"
import useShouldLinkToUser from "./hooks/useShouldLinkToUser"
import processConnectionError from "./utils/processConnectionError"

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

// We don't open the modal on these routes
const ignoredRoutes = ["/_error", "/tgauth", "/oauth", "/googleauth"]

const WalletSelectorModal = ({ isOpen, onClose, onOpen }: Props): JSX.Element => {
  const { connectors, error, connect, pendingConnector, isLoading } = useConnect()

  const { disconnect } = useDisconnect()
  const { isConnected, connector } = useAccount()
  const { captchaVerifiedSince } = useUserPublic()

  // initialize metamask onboarding
  const onboarding = useRef<MetaMaskOnboarding>()
  if (typeof window !== "undefined") {
    onboarding.current = new MetaMaskOnboarding()
  }

  const closeModalAndSendAction = () => {
    onClose()
    setTimeout(() => {
      disconnect()
    }, 200)
  }

  const { ready, set, keyPair } = useKeyPair()

  useEffect(() => {
    if (keyPair) onClose()
  }, [keyPair])

  const router = useRouter()

  useEffect(() => {
    if (
      ready &&
      !keyPair &&
      router.isReady &&
      !ignoredRoutes.includes(router.route)
    ) {
      const activate = connector.connect()
      if (typeof activate !== "undefined") {
        activate.finally(() => onOpen())
      }
    }
  }, [keyPair, ready, router])

  const shouldLinkToUser = useShouldLinkToUser()

  const { isDelegateConnection, setIsDelegateConnection, isInSafeContext } =
    useWeb3ConnectionManager()

  const isConnectedAndKeyPairReady = isConnected && ready

  const isWalletConnectModalActive = useIsWalletConnectModalActive()

  const recaptchaRef = useRef<ReCAPTCHA>()

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModalAndSendAction}
        closeOnOverlayClick={!isConnected || !!keyPair}
        closeOnEsc={!isConnected || !!keyPair}
        trapFocus={!isWalletConnectModalActive}
      >
        <ModalOverlay />
        <ModalContent data-test="wallet-selector-modal">
          <ModalHeader display={"flex"}>
            <Box
              {...((isConnectedAndKeyPairReady && !keyPair) || isDelegateConnection
                ? {
                    w: "10",
                    opacity: 1,
                  }
                : {
                    w: "0",
                    opacity: 0,
                  })}
              transition="width .2s, opacity .2s"
              mt="-1px"
            >
              <IconButton
                rounded={"full"}
                aria-label="Back"
                size="sm"
                icon={<ArrowLeft size={20} />}
                variant="ghost"
                onClick={() => {
                  if (
                    isDelegateConnection &&
                    !(isConnectedAndKeyPairReady && !keyPair)
                  ) {
                    setIsDelegateConnection(false)
                    return
                  }
                  set.reset()
                  disconnect()
                }}
              />
            </Box>
            <Text>
              {shouldLinkToUser
                ? "Link address"
                : isDelegateConnection
                ? "Connect hot wallet"
                : "Connect wallet"}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Error
              {...(set.error
                ? {
                    error: set.error,
                    processError: (err: any) => {
                      if (err?.code === "ACTION_REJECTED") {
                        return {
                          title: "Rejected",
                          description: "Signature request has been rejected",
                        }
                      }

                      return {
                        title: "Error",
                        description:
                          err?.message ??
                          (typeof err === "string" ? err : err?.errors?.[0]?.msg),
                      }
                    },
                  }
                : { error, processError: processConnectionError })}
            />
            {isConnectedAndKeyPairReady && !keyPair && (
              <Text mb="6" animation={"fadeIn .3s .1s both"}>
                Sign message to verify that you're the owner of this address.
              </Text>
            )}
            <Stack spacing="0">
              {connectors
                .filter((conn) => isInSafeContext || conn.id !== "safe")
                .map((conn) => (
                  <CardMotionWrapper key={conn.id}>
                    <ConnectorButton
                      connector={conn}
                      connect={connect}
                      isLoading={isLoading}
                      pendingConnector={pendingConnector}
                      error={error}
                    />
                  </CardMotionWrapper>
                ))}
              {!isDelegateConnection && (
                <CardMotionWrapper>
                  <DelegateCashButton />
                </CardMotionWrapper>
              )}
            </Stack>
            {isConnectedAndKeyPairReady && !keyPair && (
              <>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  size="invisible"
                />
                <Box animation={"fadeIn .3s .1s both"}>
                  <ModalButton
                    data-test="verify-address-button"
                    size="xl"
                    mb="4"
                    colorScheme={"green"}
                    onClick={async () => {
                      const token =
                        !recaptchaRef.current || !!captchaVerifiedSince
                          ? undefined
                          : await recaptchaRef.current.executeAsync()

                      if (token) {
                        recaptchaRef.current.reset()
                      }

                      return set.onSubmit(shouldLinkToUser, undefined, token)
                    }}
                    isLoading={set.isLoading || !ready}
                    isDisabled={!ready}
                    loadingText={
                      !ready
                        ? "Looking for keypairs"
                        : set.signLoadingText || "Check your wallet"
                    }
                  >
                    {shouldLinkToUser ? "Link address" : "Verify address"}
                  </ModalButton>
                </Box>
              </>
            )}
          </ModalBody>
          <ModalFooter mt="-4">
            {!isConnectedAndKeyPairReady ? (
              <Stack textAlign="center" fontSize="sm" w="full">
                <Text colorScheme="gray">
                  New to Ethereum wallets?{" "}
                  <Link
                    colorScheme="blue"
                    href="https://ethereum.org/en/wallets/"
                    isExternal
                  >
                    Learn more
                    <Icon as={ArrowSquareOut} mx="1" />
                  </Link>
                </Text>

                <Text colorScheme="gray">
                  By continuing, you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    fontWeight={"semibold"}
                    onClick={onClose}
                  >
                    Privacy Policy
                  </Link>
                  {` and `}
                  <Link
                    href="/terms-and-conditions"
                    fontWeight={"semibold"}
                    onClick={onClose}
                  >
                    Terms & conditions
                  </Link>
                </Text>
              </Stack>
            ) : (
              <Stack textAlign="center" fontSize="sm" w="full">
                <Text colorScheme={"gray"}>
                  Signing the message doesn't cost any gas
                </Text>
                <Text colorScheme="gray">
                  This site is protected by reCAPTCHA, so the Google{" "}
                  <Link
                    href="https://policies.google.com/privacy"
                    isExternal
                    fontWeight={"semibold"}
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="https://policies.google.com/terms"
                    isExternal
                    fontWeight={"semibold"}
                  >
                    Terms of Service
                  </Link>{" "}
                  apply
                </Text>
              </Stack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default WalletSelectorModal
