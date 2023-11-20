import {
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react"
import DisplayCard from "components/common/DisplayCard"
import GuildLogo from "components/common/GuildLogo"
import Link from "components/common/Link"
import VerifiedIcon from "components/common/VerifiedIcon"
import image from "next/image"
import { Users } from "phosphor-react"
import { GuildBase } from "types"
import pluralize from "utils/pluralize"

type Props = {
  guildData: GuildBase
}

const GuildCardLayout = ({ guildData }: Props): JSX.Element => (
  <SimpleGrid
    templateColumns={image ? "3rem calc(100% - 5.25rem)" : "1fr"}
    gap={4}
    alignItems="center"
    w="full"
  >
    {image && <GuildLogo imageUrl={guildData.imageUrl} />}
    <VStack spacing={2} alignItems="start" w="full" maxW="full" mb="0.5" mt="-1">
      <HStack spacing={1}>
        <Text
          as="span"
          fontFamily="display"
          fontSize="lg"
          fontWeight="bold"
          letterSpacing="wide"
          maxW="full"
          noOfLines={1}
          wordBreak="break-all"
        >
          {guildData.name}
        </Text>
        {guildData.tags?.includes("VERIFIED") && <VerifiedIcon size={5} />}
      </HStack>

      <Wrap zIndex="1">
        <Tag as="li">
          <TagLeftIcon as={Users} />
          <TagLabel>
            {new Intl.NumberFormat("en", { notation: "compact" }).format(
              guildData.memberCount ?? 0
            )}
          </TagLabel>
        </Tag>
        <Tag as="li">
          <TagLabel>{pluralize(guildData.rolesCount ?? 0, "role")}</TagLabel>
        </Tag>
      </Wrap>
    </VStack>
    {/* {guildData.tags?.includes("FEATURED") && (
        <Tooltip label="This guild is featured by Guild.xyz" hasArrow>
          <ColorCardLabel
            fallbackColor="white"
            backgroundColor={"purple.500"}
            label={
              <Icon
                as={PushPin}
                display={"flex"}
                alignItems={"center"}
                m={"2px"}
              />
            }
            top="0"
            left="0"
            borderBottomRightRadius="xl"
            borderTopLeftRadius="2xl"
            labelSize="xs"
            px="3"
          />
        </Tooltip>
      )} */}
  </SimpleGrid>
)

const GuildCard = ({ guildData }: Props): JSX.Element => (
  <Link
    href={`/${guildData.urlName}`}
    prefetch={false}
    _hover={{ textDecor: "none" }}
    borderRadius="2xl"
    w="full"
    h="full"
  >
    <DisplayCard h="auto">
      <GuildCardLayout guildData={guildData} />
    </DisplayCard>
  </Link>
)

const GuildSkeletonCard = () => (
  <DisplayCard h="auto">
    <SimpleGrid
      templateColumns={image ? "3rem calc(100% - 4.25rem)" : "1fr"}
      gap={4}
      alignItems="center"
    >
      <SkeletonCircle size={"48px"} />
      <VStack spacing={3} alignItems="start" w="full" maxW="full">
        <Skeleton h="6" w="80%" />
        <HStack>
          <Skeleton h="5" w="12" />
          <Skeleton h="5" w="16" />
        </HStack>
      </VStack>
    </SimpleGrid>
  </DisplayCard>
)

export default GuildCard
export { GuildCardLayout, GuildSkeletonCard }
