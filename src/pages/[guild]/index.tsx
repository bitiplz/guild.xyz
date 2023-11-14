import {
  Box,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  Link,
  Spinner,
  Stack,
  Tag,
  TagLeftIcon,
  Text,
  Wrap,
} from "@chakra-ui/react"
import AccessHub from "components/[guild]/AccessHub"
import { useAccessedGuildPlatforms } from "components/[guild]/AccessHub/AccessHub"
import CollapsibleRoleSection from "components/[guild]/CollapsibleRoleSection"
import PoapRoleCard from "components/[guild]/CreatePoap/components/PoapRoleCard"
import { EditGuildDrawerProvider } from "components/[guild]/EditGuild/EditGuildDrawerContext"
import useAccess from "components/[guild]/hooks/useAccess"
import useAutoStatusUpdate from "components/[guild]/hooks/useAutoStatusUpdate"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import useIsMember from "components/[guild]/hooks/useIsMember"
import JoinButton from "components/[guild]/JoinButton"
import { isAfterJoinAtom } from "components/[guild]/JoinModal/hooks/useJoin"
import JoinModalProvider from "components/[guild]/JoinModal/JoinModalProvider"
import LeaveButton from "components/[guild]/LeaveButton"
import Members from "components/[guild]/Members"
import OnboardingProvider from "components/[guild]/Onboarding/components/OnboardingProvider"
import { MintGuildPinProvider } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPinContext"
import { RequirementErrorConfigProvider } from "components/[guild]/Requirements/RequirementErrorConfigContext"
import RoleCard from "components/[guild]/RoleCard/RoleCard"
import SocialIcon from "components/[guild]/SocialIcon"
import GuildTabs from "components/[guild]/Tabs/GuildTabs"
import { ThemeProvider, useThemeContext } from "components/[guild]/ThemeContext"
import GuildLogo from "components/common/GuildLogo"
import Layout from "components/common/Layout"
import BackButton from "components/common/Layout/components/BackButton"
import LinkPreviewHead from "components/common/LinkPreviewHead"
import Section from "components/common/Section"
import VerifiedIcon from "components/common/VerifiedIcon"
import useScrollEffect from "hooks/useScrollEffect"
import useUniqueMembers from "hooks/useUniqueMembers"
import { useAtom } from "jotai"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import ErrorPage from "pages/_error"
import { Info, Users } from "phosphor-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { SWRConfig } from "swr"
import { Guild, SocialLinkKey, Visibility } from "types"
import fetcher from "utils/fetcher"
import parseDescription from "utils/parseDescription"

const BATCH_SIZE = 10

const DynamicEditGuildButton = dynamic(() => import("components/[guild]/EditGuild"))
const DynamicAddAndOrderRoles = dynamic(
  () => import("components/[guild]/AddAndOrderRoles")
)
const DynamicAddRewardButton = dynamic(
  () => import("components/[guild]/AddRewardButton")
)
const DynamicAddRewardAndCampaign = dynamic(
  () => import("components/[guild]/AddRewardAndCampaign")
)
const DynamicMembersExporter = dynamic(
  () => import("components/[guild]/Members/components/MembersExporter")
)
const DynamicOnboarding = dynamic(() => import("components/[guild]/Onboarding"))
const DynamicNoRolesAlert = dynamic(() => import("components/[guild]/NoRolesAlert"))
const DynamicActiveStatusUpdates = dynamic(
  () => import("components/[guild]/ActiveStatusUpdates")
)
const DynamicResendRewardButton = dynamic(
  () => import("components/[guild]/ResendRewardButton")
)

const GuildPage = (): JSX.Element => {
  const {
    id: guildId,
    name,
    description,
    imageUrl,
    admins,
    showMembers,
    memberCount,
    roles: allRoles,
    isLoading,
    onboardingComplete,
    socialLinks,
    poaps,
    tags,
    featureFlags,
    isDetailed,
  } = useGuild()
  useAutoStatusUpdate()

  const roles = allRoles.filter((role) => !role.groupId)

  // temporary, will order roles already in the SQL query in the future
  const sortedRoles = useMemo(() => {
    if (roles?.every((role) => role.position === null)) {
      const byMembers = roles?.sort(
        (role1, role2) => role2.memberCount - role1.memberCount
      )
      return byMembers
    }

    return (
      roles?.sort((role1, role2) => {
        if (role1.position === null) return 1
        if (role2.position === null) return -1
        return role1.position - role2.position
      }) ?? []
    )
  }, [roles])

  const publicRoles = sortedRoles.filter(
    (role) => role.visibility !== Visibility.HIDDEN
  )
  const hiddenRoles = sortedRoles.filter(
    (role) => role.visibility === Visibility.HIDDEN
  )

  // TODO: we use this behaviour in multiple places now, should make a useScrollBatchedRendering hook
  const [renderedRolesCount, setRenderedRolesCount] = useState(BATCH_SIZE)
  const rolesEl = useRef(null)
  useScrollEffect(() => {
    if (
      !rolesEl.current ||
      rolesEl.current.getBoundingClientRect().bottom > window.innerHeight ||
      roles?.length <= renderedRolesCount
    )
      return

    setRenderedRolesCount((prevValue) => prevValue + BATCH_SIZE)
  }, [roles, renderedRolesCount])

  const renderedRoles = publicRoles?.slice(0, renderedRolesCount) || []

  const { isAdmin } = useGuildPermission()
  const isMember = useIsMember()
  const { hasAccess } = useAccess()

  // Passing the admin addresses here to make sure that we render all admin avatars in the members list
  const members = useUniqueMembers(
    roles,
    admins?.map((admin) => admin.address)
  )

  const { textColor, localThemeColor, localBackgroundImage } = useThemeContext()
  const [isAddRoleStuck, setIsAddRoleStuck] = useState(false)

  /**
   * Temporary to show "You might need to wait a few minutes to get your roles" on
   * the Discord reward card until after join we implement queues generally
   */
  const [isAfterJoin, setIsAfterJoin] = useAtom(isAfterJoinAtom)
  useEffect(() => {
    setIsAfterJoin(false)
  }, [])

  // not importing it dynamically because that way the whole page flashes once when it loads
  const DynamicOnboardingProvider =
    isAdmin && !onboardingComplete ? OnboardingProvider : React.Fragment

  const showOnboarding = isAdmin && !onboardingComplete

  const currentTime = Date.now() / 1000
  const { activePoaps, expiredPoaps } =
    poaps
      ?.sort((poapA, poapB) => poapB.expiryDate - poapA.expiryDate)
      .reduce(
        (acc, currPoap) => {
          if (!currPoap.activated && !isAdmin) return acc

          if (currPoap.expiryDate > currentTime) acc.activePoaps.push(currPoap)
          else acc.expiredPoaps.push(currPoap)

          return acc
        },
        { activePoaps: [], expiredPoaps: [] }
      ) ?? {}

  const accessedGuildPlatforms = useAccessedGuildPlatforms()

  return (
    <DynamicOnboardingProvider>
      <Head>
        <meta name="theme-color" content={localThemeColor} />
      </Head>

      <Layout
        title={name}
        textColor={textColor}
        ogDescription={description}
        description={
          <>
            {description && parseDescription(description)}
            {Object.keys(socialLinks ?? {}).length > 0 && (
              <Wrap w="full" spacing={3} mt="3">
                {Object.entries(socialLinks).map(([type, link]) => {
                  const prettyLink = link
                    .replace(/(http(s)?:\/\/)*(www\.)*/i, "")
                    .replace(/\/+$/, "")

                  return (
                    <HStack key={type} spacing={1.5} maxW="full">
                      <SocialIcon type={type as SocialLinkKey} size="sm" />
                      <Link
                        href={link?.startsWith("http") ? link : `https://${link}`}
                        isExternal
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textColor}
                        noOfLines={1}
                      >
                        {prettyLink}
                      </Link>
                    </HStack>
                  )
                })}
              </Wrap>
            )}
          </>
        }
        image={
          <GuildLogo
            imageUrl={imageUrl}
            size={{ base: "56px", lg: "72px" }}
            mt={{ base: 1, lg: 2 }}
            bgColor={textColor === "primary.800" ? "primary.800" : "transparent"}
          />
        }
        imageUrl={imageUrl}
        background={localThemeColor}
        backgroundImage={localBackgroundImage}
        action={isAdmin && isDetailed && <DynamicEditGuildButton />}
        backButton={<BackButton />}
        titlePostfix={
          tags?.includes("VERIFIED") && (
            <VerifiedIcon size={{ base: 5, lg: 6 }} mt={-1} />
          )
        }
      >
        {showOnboarding ? (
          <DynamicOnboarding />
        ) : (
          <GuildTabs
            activeTab="HOME"
            rightElement={
              <HStack>
                {isMember && !isAdmin && <DynamicResendRewardButton />}
                {!isMember && (isAdmin ? hasAccess : true) ? (
                  <JoinButton />
                ) : !isAdmin ? (
                  <LeaveButton />
                ) : isAddRoleStuck ? (
                  <DynamicAddAndOrderRoles />
                ) : featureFlags.includes("ROLE_GROUPS") ? (
                  <DynamicAddRewardAndCampaign />
                ) : (
                  <DynamicAddRewardButton />
                )}
              </HStack>
            }
          />
        )}

        <AccessHub />

        <Section
          title={
            (isAdmin || isMember || !!accessedGuildPlatforms?.length) && "Roles"
          }
          titleRightElement={
            isAdmin && (
              <Box my="-2 !important" ml="auto !important">
                <DynamicAddAndOrderRoles setIsStuck={setIsAddRoleStuck} />
              </Box>
            )
          }
          mb="10"
        >
          {renderedRoles.length ? (
            <RequirementErrorConfigProvider>
              <Stack ref={rolesEl} spacing={4}>
                {/* Custom logic for Chainlink */}
                {(isAdmin || guildId !== 16389) &&
                  activePoaps.map((poap) => (
                    <PoapRoleCard key={poap?.id} guildPoap={poap} />
                  ))}
                {renderedRoles.map((role) => (
                  <RoleCard key={role.id} role={role} />
                ))}
              </Stack>
            </RequirementErrorConfigProvider>
          ) : (
            <DynamicNoRolesAlert />
          )}

          {roles?.length > renderedRolesCount && (
            <Center pt={6}>
              <Spinner />
            </Center>
          )}

          {!!hiddenRoles?.length && (
            <CollapsibleRoleSection
              id="hiddenRoles"
              roleCount={hiddenRoles.length}
              label="hidden"
              defaultIsOpen
            >
              {hiddenRoles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </CollapsibleRoleSection>
          )}
          {!!expiredPoaps?.length && (
            <CollapsibleRoleSection
              roleCount={expiredPoaps.length}
              label="expired"
              unmountOnExit
            >
              {expiredPoaps.map((poap) => (
                <PoapRoleCard key={poap?.id} guildPoap={poap} />
              ))}
            </CollapsibleRoleSection>
          )}
        </Section>
        {(showMembers || isAdmin) && (
          <>
            <Divider my={10} />
            <Section
              title="Members"
              titleRightElement={
                <HStack justifyContent="space-between" w="full" my="-2 !important">
                  <Tag maxH={6} pt={0.5}>
                    <TagLeftIcon as={Users} />
                    {isLoading ? (
                      <Spinner size="xs" />
                    ) : (
                      new Intl.NumberFormat("en", {
                        notation: "compact",
                      }).format(memberCount ?? 0) ?? 0
                    )}
                  </Tag>
                  {isAdmin && <DynamicMembersExporter />}
                </HStack>
              }
            >
              <Box>
                {isAdmin && <DynamicActiveStatusUpdates />}
                {showMembers ? (
                  <>
                    <Members members={members} />
                    {/* Temporary until the BE returns members again  */}
                    <Text mt="6" colorScheme={"gray"}>
                      <Icon as={Info} mr="2" mb="-2px" />
                      Members are temporarily hidden, only admins are shown
                    </Text>
                  </>
                ) : (
                  <Text>Members are hidden</Text>
                )}
              </Box>
            </Section>
          </>
        )}
      </Layout>
    </DynamicOnboardingProvider>
  )
}

type Props = {
  fallback: { string: Guild }
}

const GuildPageWrapper = ({ fallback }: Props): JSX.Element => {
  const guild = useGuild()

  if (!fallback) {
    if (guild.isLoading)
      return (
        <Center h="100vh" w="screen">
          <Spinner />
          <Heading fontFamily={"display"} size="md" ml="4" mb="1">
            Loading guild...
          </Heading>
        </Center>
      )

    if (!guild.id) return <ErrorPage statusCode={404} />
  }

  return (
    <>
      <LinkPreviewHead
        path={fallback ? Object.values(fallback)[0].urlName : guild.urlName}
      />
      <Head>
        <title>{fallback ? Object.values(fallback)[0].name : guild.name}</title>
        <meta
          property="og:title"
          content={fallback ? Object.values(fallback)[0].name : guild.name}
        />
      </Head>
      <SWRConfig value={fallback && { fallback }}>
        <ThemeProvider>
          <MintGuildPinProvider>
            <JoinModalProvider>
              <EditGuildDrawerProvider>
                <GuildPage />
              </EditGuildDrawerProvider>
            </JoinModalProvider>
          </MintGuildPinProvider>
        </ThemeProvider>
      </SWRConfig>
    </>
  )
}

const getStaticProps: GetStaticProps = async ({ params }) => {
  const endpoint = `/v2/guilds/guild-page/${params.guild?.toString()}`

  const data = await fetcher(endpoint).catch((_) => ({}))

  if (!data?.id)
    return {
      props: {},
      revalidate: 300,
    }

  /**
   * Removing members and requirements, so they're not included in the SSG source
   * code, we only fetch them client side. Temporary until we switch to the new API
   * that won't return them on this endpoint anyway
   */
  const filteredData = { ...data }
  filteredData.roles?.forEach((role) => {
    role.members = []
    role.requirements = []
  })
  filteredData.isFallback = true

  return {
    props: {
      fallback: {
        [endpoint]: filteredData,
      },
    },
    revalidate: 300,
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  const mapToPaths = (_: Guild[]) =>
    Array.isArray(_)
      ? _.map(({ urlName: guild }) => ({
          params: { guild },
        }))
      : []

  const paths = await fetcher(`/v2/guilds`).then(mapToPaths)

  return {
    paths,
    fallback: "blocking",
  }
}

export { getStaticPaths, getStaticProps }

export default GuildPageWrapper
