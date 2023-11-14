import useSWR, { SWRConfiguration } from "swr"

const fallbackData = {
  ok: false,
  message: null,
  groupName: "",
  groupIcon: null,
}

type IsTGBotInResponse = {
  ok: boolean
  message?: string
  groupIcon?: string
  groupName?: string
}

const useIsTGBotIn = (groupId: string, swrConfig?: SWRConfiguration) => {
  const shouldFetch = groupId?.length >= 9

  const { data, isValidating } = useSWR<IsTGBotInResponse>(
    shouldFetch
      ? `/v2/telegram/groups/${groupId?.startsWith("-") ? groupId : `-${groupId}`}`
      : null,
    {
      fallbackData,
      revalidateOnFocus: false,
      ...swrConfig,
    }
  )

  return { data, isValidating }
}

export default useIsTGBotIn
