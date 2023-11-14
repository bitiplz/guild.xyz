import { useKeyPair } from "components/_app/KeyPairProvider"
import useActiveStatusUpdates from "hooks/useActiveStatusUpdates"
import { useCallback, useMemo } from "react"
import useSWRInfinite from "swr/infinite"
import { PlatformAccountDetails, Visibility } from "types"
import { useFetcherWithSign } from "utils/fetcher"
import useGuild from "../hooks/useGuild"
import { sortAccounts } from "./Identities"

type CrmRole = {
  roleId?: number
  requirementId?: number
  access?: boolean
  amount?: number
}

type Member = {
  userId: number
  addresses: string[]
  platformUsers: PlatformAccountDetails[]
  joinedAt: string
  roles: {
    hidden?: CrmRole[]
    public: CrmRole[]
  }
  areSocialsPrivate: boolean
}

const LIMIT = 50

const useMembers = (queryString: string) => {
  const { id } = useGuild()
  const { keyPair, ready, isValid } = useKeyPair()

  const getKey = useCallback(
    (pageIndex, previousPageData) => {
      if (!id || !keyPair || !ready || !isValid) return null

      if (previousPageData && previousPageData.length < LIMIT) return null

      const pagination = `offset=${pageIndex * LIMIT}&limit=${LIMIT}`

      return `/v2/crm/guilds/${id}/members?${[queryString, pagination].join("&")}`
    },
    [queryString, id, keyPair, ready, isValid]
  )

  const fetcherWithSign = useFetcherWithSign()
  const fetchMembers = useCallback(
    (url: string) =>
      fetcherWithSign([
        url,
        {
          method: "GET",
          body: {},
        },
      ]).then((res) =>
        res.map((user) => {
          const areSocialsPrivate = typeof user.addresses === "string"

          return {
            ...user,
            areSocialsPrivate,
            addresses: areSocialsPrivate ? [user.addresses] : user.addresses,
            platformUsers: user.platformUsers.sort(sortAccounts),
            roles: {
              hidden: user.roles.filter(
                (role) => role.visibility === Visibility.HIDDEN
              ),
              public: user.roles.filter(
                (role) => role.visibility !== Visibility.HIDDEN
              ),
            },
          }
        })
      ),
    [fetcherWithSign]
  )

  const { data, mutate, ...rest } = useSWRInfinite<Member[]>(getKey, fetchMembers, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateFirstPage: false,
    revalidateOnMount: true,
    keepPreviousData: true,
  })

  const flattenedData = useMemo(() => data?.flat(), [data])

  // Mutating the data on successful status update
  useActiveStatusUpdates(null, mutate)

  return {
    data: flattenedData,
    mutate,
    ...rest,
  }
}

export default useMembers
export type { CrmRole, Member }
