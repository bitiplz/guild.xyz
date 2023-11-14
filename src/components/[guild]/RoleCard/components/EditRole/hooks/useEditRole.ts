import useAccess from "components/[guild]/hooks/useAccess"
import useGuild from "components/[guild]/hooks/useGuild"
import { usePostHogContext } from "components/_app/PostHogProvider"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit/useSubmit"
import { useSWRConfig } from "swr"
import { OneOf, Visibility } from "types"
import { useFetcherWithSign } from "utils/fetcher"
import replacer from "utils/guildJsonReplacer"
import preprocessRequirements from "utils/preprocessRequirements"
import { RoleEditFormData } from "../EditRole"

const mapToObject = <T extends { id: number }>(array: T[], by: keyof T = "id") =>
  Object.fromEntries(array.map((item) => [item[by], item]))

const useEditRole = (roleId: number, onSuccess?: () => void) => {
  const { id, urlName, roles, memberCount, mutateGuild } = useGuild()
  const currentRole = roles.find((role) => role.id === roleId)
  const { captureEvent } = usePostHogContext()
  const postHogOptions = { guild: urlName, memberCount }

  const { mutate } = useSWRConfig()
  const { mutate: mutateAccess } = useAccess()

  const errorToast = useShowErrorToast()
  const showErrorToast = useShowErrorToast()
  const fetcherWithSign = useFetcherWithSign()

  const submit = async (data: RoleEditFormData) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { requirements, rolePlatforms, id: _id, ...baseRoleData } = data

    const roleUpdate: Promise<
      OneOf<
        Omit<RoleEditFormData, "requirements" | "rolePlatforms">,
        { error: string; correlationId: string }
      >
    > =
      Object.keys(baseRoleData ?? {}).length > 0
        ? fetcherWithSign([
            `/v2/guilds/${id}/roles/${roleId}`,
            { method: "PUT", body: baseRoleData },
          ]).catch((error) => error)
        : new Promise((resolve) => resolve(undefined))

    const requirementUpdates = Promise.all(
      (requirements ?? [])
        .filter((reqirement) => "id" in reqirement)
        .map((requirement) =>
          fetcherWithSign([
            `/v2/guilds/${id}/roles/${roleId}/requirements/${requirement.id}`,
            { method: "PUT", body: requirement },
          ]).catch((error) => error)
        )
    )

    const requirementCreations = Promise.all(
      (requirements ?? [])
        .filter((reqirement) => !("id" in reqirement))
        .map((requirement) =>
          fetcherWithSign([
            `/v2/guilds/${id}/roles/${roleId}/requirements`,
            { method: "POST", body: requirement },
          ]).catch((error) => error)
        )
    )

    const rolePlatformUpdates = Promise.all(
      (rolePlatforms ?? [])
        .filter((rolePlatform) => "id" in rolePlatform)
        .map((rolePlatform) =>
          fetcherWithSign([
            `/v2/guilds/${id}/roles/${roleId}/role-platforms/${rolePlatform.id}`,
            { method: "PUT", body: rolePlatform },
          ]).catch((error) => error)
        )
    )

    const rolePlatformCreations = Promise.all(
      (rolePlatforms ?? [])
        .filter((rolePlatform) => !("id" in rolePlatform))
        .map((rolePlatform) =>
          fetcherWithSign([
            `/v2/guilds/${id}/roles/${roleId}/role-platforms`,
            { method: "POST", body: rolePlatform },
          ]).catch((error) => error)
        )
    )

    const [
      updatedRole,
      updatedRequirements,
      createdRequirements,
      updatedRolePlatforms,
      createdRolePlatforms,
    ] = await Promise.all([
      roleUpdate,
      requirementUpdates,
      requirementCreations,
      rolePlatformUpdates,
      rolePlatformCreations,
    ])

    return {
      updatedRole,
      updatedRequirements,
      createdRequirements,
      updatedRolePlatforms,
      createdRolePlatforms,
    }
  }

  const useSubmitResponse = useSubmit(submit, {
    onSuccess: (result) => {
      const {
        updatedRole,
        updatedRequirements,
        createdRequirements,
        updatedRolePlatforms,
        createdRolePlatforms,
      } = result

      const deletedRequirementIds = new Set(
        createdRequirements.flatMap((req) => req.deletedRequirements)
      )

      const [
        failedRequirementUpdatesCount,
        failedRequirementCreationsCount,
        failedRolePlatformUpdatesCount,
        failedRolePlatformCreationsCount,
      ] = [
        updatedRequirements.filter((req) => !!req.error).length,
        createdRequirements.filter((req) => !!req.error).length,
        updatedRolePlatforms.filter((req) => !!req.error).length,
        createdRolePlatforms.filter((req) => !!req.error).length,
      ]

      const [
        successfulRequirementUpdates,
        successfulRequirementCreations,
        successfulRolePlatformUpdates,
        successfulRolePlatformCreations,
      ] = [
        updatedRequirements.filter((res) => !res.error),
        createdRequirements.filter((res) => !res.error),
        updatedRolePlatforms.filter((res) => !res.error),
        createdRolePlatforms.filter((res) => !res.error),
      ]

      const [
        failedRequirementUpdatesCorrelationId,
        failedRequirementCreationsCorrelationId,
        failedRolePlatformUpdatesCorrelationId,
        failedRolePlatformCreationsCorrelationId,
      ] = [
        updatedRequirements.filter((req) => !!req.error)[0]?.correlationId,
        createdRequirements.filter((req) => !!req.error)[0]?.correlationId,
        updatedRolePlatforms.filter((req) => !!req.error)[0]?.correlationId,
        createdRolePlatforms.filter((req) => !!req.error)[0]?.correlationId,
      ]

      if (
        !updatedRole?.error &&
        failedRequirementUpdatesCount <= 0 &&
        failedRequirementCreationsCount <= 0 &&
        failedRolePlatformUpdatesCount <= 0 &&
        failedRolePlatformCreationsCount <= 0
      ) {
        createdRequirements?.forEach((req) => {
          if (req.visibility !== Visibility.PUBLIC) {
            captureEvent(`Created a ${req.visibility} requirement`, {
              ...postHogOptions,
              requirementType: req.type,
            })
          }
        })

        if (
          !!updatedRole &&
          currentRole.visibility === Visibility.PUBLIC &&
          updatedRole.visibility !== Visibility.PUBLIC
        ) {
          captureEvent(
            `Changed role visibility from PUBLIC to ${updatedRole.visibility}`,
            postHogOptions
          )
        }

        onSuccess?.()
      } else {
        if (updatedRole?.error) {
          errorToast({
            error: "Failed to update role",
            correlationId: updatedRole.correlationId,
          })
        }
        if (failedRequirementUpdatesCount > 0) {
          errorToast({
            error: "Failed to update some requirements",
            correlationId: failedRequirementUpdatesCorrelationId,
          })
        }
        if (failedRequirementCreationsCount > 0) {
          errorToast({
            error: "Failed to create some requirements",
            correlationId: failedRequirementCreationsCorrelationId,
          })
        }
        if (failedRolePlatformUpdatesCount > 0) {
          errorToast({
            error: "Failed to update some rewards",
            correlationId: failedRolePlatformUpdatesCorrelationId,
          })
        }
        if (failedRolePlatformCreationsCount > 0) {
          errorToast({
            error: "Failed to create some rewards",
            correlationId: failedRolePlatformCreationsCorrelationId,
          })
        }
      }

      const updatedRequirementsById = mapToObject(successfulRequirementUpdates)
      const updatedRolePlatformsById = mapToObject(successfulRolePlatformUpdates)

      const createdRolePlatformsToMutate = successfulRolePlatformCreations.map(
        ({ createdGuildPlatform: _, ...rest }) => rest
      )

      const createdGuildPlatforms = successfulRolePlatformCreations
        .map(({ createdGuildPlatform }) => createdGuildPlatform)
        .filter(Boolean)

      mutateGuild(
        (prevGuild) => ({
          ...prevGuild,
          guildPlatforms: [...prevGuild.guildPlatforms, ...createdGuildPlatforms],
          roles:
            prevGuild.roles?.map((prevRole) =>
              prevRole.id === roleId
                ? {
                    ...prevRole,
                    ...(updatedRole ?? {}),
                    requirements: [
                      ...(prevRole.requirements
                        ?.filter(
                          (requirement) => !deletedRequirementIds.has(requirement.id)
                        )
                        ?.map((prevReq) => ({
                          ...prevReq,
                          ...(updatedRequirementsById[prevReq.id] ?? {}),
                        })) ?? []),
                      ...successfulRequirementCreations,
                    ],
                    rolePlatforms: [
                      ...(prevRole.rolePlatforms?.map((prevRolePlatform) => ({
                        ...prevRolePlatform,
                        ...(updatedRolePlatformsById[prevRolePlatform.id] ?? {}),
                      })) ?? []),
                      ...createdRolePlatformsToMutate,
                    ],
                  }
                : prevRole
            ) ?? [],
        }),
        { revalidate: false }
      )

      mutateAccess()
      mutate(`/statusUpdate/guild/${id}`)
    },
    onError: (err) => showErrorToast(err),
  })

  return {
    ...useSubmitResponse,
    onSubmit: (data) => {
      data.requirements = preprocessRequirements(data?.requirements)

      if (!!data.logic && data.logic !== "ANY_OF") delete data.anyOfNum

      return useSubmitResponse.onSubmit(JSON.parse(JSON.stringify(data, replacer)))
    },
    isSigning: null,
    signLoadingText: null,
  }
}

export default useEditRole
