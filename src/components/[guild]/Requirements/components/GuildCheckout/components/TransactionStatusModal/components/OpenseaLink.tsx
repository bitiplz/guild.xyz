import { Icon, Img, Text } from "@chakra-ui/react"
import { Chains } from "chains"
import Link from "components/common/Link"
import { ArrowSquareOut } from "phosphor-react"
import { GUILD_PIN_CONTRACTS, openseaBaseUrl } from "utils/guildCheckout/constants"
import { useChainId } from "wagmi"
import { useMintGuildPinContext } from "../../../MintGuildPinContext"

const OpenseaLink = (): JSX.Element => {
  const chainId = useChainId()
  const { mintedTokenId } = useMintGuildPinContext()

  if (!mintedTokenId || !openseaBaseUrl[Chains[chainId]]) return null

  return (
    <Text mb={6} colorScheme="gray">
      <Link
        isExternal
        href={`${openseaBaseUrl[Chains[chainId]]}/${
          GUILD_PIN_CONTRACTS[Chains[chainId]].address
        }/${mintedTokenId}`}
      >
        <Img src={"/requirementLogos/opensea.svg"} boxSize={"1em"} mr="1.5" />
        View on OpenSea
        <Icon ml={1.5} as={ArrowSquareOut} />
      </Link>
    </Text>
  )
}

export default OpenseaLink
