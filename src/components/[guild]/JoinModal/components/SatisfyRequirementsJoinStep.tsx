import {
  Center,
  Circle,
  Collapse,
  HStack,
  Icon,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import Button from "components/common/Button"
import { ArrowRight, LockSimple, X } from "phosphor-react"

const SatisfyRequirementsJoinStep = ({
  isLoading,
  hasNoAccessResponse,
  onClose,
}) => {
  const { roles } = useGuild()

  const onClick = () => {
    onClose()
    window.location.hash = `role-${roles[0]?.id}`
  }

  return (
    <HStack py="3" alignItems={"flex-start"}>
      {isLoading ? (
        <Circle border={"1px transparent"}>
          <Spinner boxSize="5" opacity=".6" />
        </Circle>
      ) : (
        <Circle
          size="5"
          border={"1px"}
          {...(hasNoAccessResponse
            ? { bg: "gray.500", borderColor: "gray.500" }
            : { bg: "blackAlpha.100", borderColor: "whiteAlpha.100" })}
        >
          {hasNoAccessResponse && (
            <Icon as={X} weight="bold" color={"white"} boxSize="0.7em" />
          )}
        </Circle>
      )}
      <Stack w="full" spacing={0} mt="-1.5px !important">
        <Text fontWeight={"bold"}>Satisfy the requirements</Text>
        <Collapse in={hasNoAccessResponse && !isLoading}>
          <Text pt="2">
            {`You're not eligible with your connected accounts. `}
            <Button
              variant="link"
              rightIcon={<ArrowRight />}
              onClick={onClick}
              iconSpacing={1.5}
            >
              See requirements
            </Button>
          </Text>
        </Collapse>
      </Stack>
      {!hasNoAccessResponse && (
        <Tooltip
          hasArrow
          label="Connect your accounts and check access below to see if you meet the requirements the guild owner has set"
        >
          <Center boxSize={5}>
            <Icon as={LockSimple} weight="bold" />
          </Center>
        </Tooltip>
      )}
    </HStack>
  )
}

export default SatisfyRequirementsJoinStep
