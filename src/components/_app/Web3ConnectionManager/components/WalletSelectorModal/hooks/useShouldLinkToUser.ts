import { useUserPublic } from "components/[guild]/hooks/useUser"
import {
  deleteKeyPairFromIdb,
  getKeyPairFromIdb,
} from "components/_app/KeyPairProvider"
import { atom, useAtom } from "jotai"
import useSWR, { mutate, unstable_serialize } from "swr"

type AddressLinkParams = {
  userId?: number
  address?: string
}
export const addressLinkParamsAtom = atom<AddressLinkParams>({
  userId: undefined,
  address: undefined,
})

const fetchShouldLinkToUser = async ([_, userId, connectParams]) => {
  const { userId: userIdToConnectTo } = connectParams ?? {}
  if (!userIdToConnectTo) return false

  if (
    typeof userId === "number" &&
    typeof userIdToConnectTo === "number" &&
    userIdToConnectTo !== userId
  ) {
    try {
      await deleteKeyPairFromIdb(userId).then(() =>
        mutate(unstable_serialize(["keyPair", userId]))
      )
    } catch {}
  }

  const keypair = await getKeyPairFromIdb(+userIdToConnectTo)

  return !!keypair
}

const useShouldLinkToUser = () => {
  const { id } = useUserPublic()
  const [addressLinkParams, setAddressLinkParams] = useAtom(addressLinkParamsAtom)

  const { data: shouldLinkToUser } = useSWR(
    addressLinkParams?.userId ? ["shouldLinkToUser", id, addressLinkParams] : null,
    fetchShouldLinkToUser,
    {
      shouldRetryOnError: false,
      onError: () => {
        setAddressLinkParams({ userId: null, address: null })
      },
    }
  )

  return shouldLinkToUser
}

export default useShouldLinkToUser
