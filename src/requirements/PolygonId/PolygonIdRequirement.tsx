import {
  Box,
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import DataBlock from "components/[guild]/Requirements/components/DataBlock"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import { CaretDown } from "phosphor-react"
import formatRelativeTimeFromNow from "utils/formatRelativeTimeFromNow"
import ConnectPolygonID from "./components/ConnectPolygonID"

const PolygonIDRequirement = (props: RequirementProps) => {
  const bg = useColorModeValue("blackAlpha.100", "blackAlpha.300")
  const requirement = useRequirementContext()

  const proofAge =
    requirement.data?.maxAmount > 0 &&
    formatRelativeTimeFromNow(requirement.data.maxAmount)

  if (requirement?.data?.query)
    return (
      <Popover placement="bottom">
        <Requirement
          image={`/requirementLogos/polygonId.svg`}
          footer={<ConnectPolygonID />}
          {...props}
        >
          <Text as="span">{`Satisfy the `}</Text>
          <DataBlock>{requirement.data.query[0]?.query?.type}</DataBlock>
          <Text as="span">{` PolygonID `}</Text>
          <PopoverTrigger>
            <Button
              variant="link"
              rightIcon={<Icon as={CaretDown} />}
              iconSpacing={1}
            >
              query
            </Button>
          </PopoverTrigger>
        </Requirement>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody
              p={2}
              bgColor={bg}
              borderRadius={"xl"}
              maxH={"md"}
              overflow={"auto"}
            >
              <Box as="pre" fontSize="sm">
                {JSON.stringify(requirement.data.query, null, 2)}
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    )

  return (
    <Requirement
      image={`/requirementLogos/polygonId.svg`}
      footer={<ConnectPolygonID />}
      {...props}
    >
      {`Authenticate with PolygonID`}
      {requirement.chain === "POLYGON_MUMBAI" && " (on Mumbai)"}
      {proofAge && (
        <>
          {` (valid until `}
          <DataBlock>{proofAge}</DataBlock>
          {`)`}
        </>
      )}
    </Requirement>
  )
}

export default PolygonIDRequirement
