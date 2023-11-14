import useUser from "components/[guild]/hooks/useUser"
import useMemberships from "components/explorer/hooks/useMemberships"
import { createContext, PropsWithChildren, useContext, useEffect } from "react"
import { useAccount } from "wagmi"

const IntercomContext = createContext<{
  addIntercomSettings: (newData: Record<string, string | number>) => void
  triggerChat: () => void
}>({
  addIntercomSettings: () => {},
  triggerChat: () => {},
})

export const addIntercomSettings = (
  newData: Record<string, string | number | boolean>
) => {
  if (typeof window === "undefined" || !newData) return
  const windowAsObject = window as Record<string, any>

  if (!windowAsObject.intercomSettings) windowAsObject.intercomSettings = {}

  const shouldUpdate = Object.entries(newData).some(
    ([key, value]) => windowAsObject.intercomSettings[key] !== value
  )

  if (!shouldUpdate) return

  windowAsObject.intercomSettings = {
    ...windowAsObject.intercomSettings,
    ...newData,
  }

  windowAsObject.Intercom?.("update", windowAsObject.intercomSettings)
}

export const pushToIntercomSetting = (settingName: string, value: string) => {
  if (typeof window === "undefined") return
  const windowAsObject = window as Record<string, any>

  if (!windowAsObject.intercomSettings) windowAsObject.intercomSettings = {}

  if (windowAsObject.intercomSettings[settingName]?.length)
    windowAsObject.intercomSettings[settingName] += `,${value}`
  else windowAsObject.intercomSettings[settingName] = value

  windowAsObject.Intercom?.("update", windowAsObject.intercomSettings)
}

const triggerChat = () => {
  if (typeof window === "undefined") return
  const windowAsObject = window as Record<string, any>

  windowAsObject.Intercom?.("show")
}

const IntercomProvider = ({ children }: PropsWithChildren<unknown>): JSX.Element => {
  const { address, isConnected } = useAccount()
  const user = useUser()

  const { memberships } = useMemberships()

  useEffect(() => {
    if (!isConnected || !user || !memberships) return

    const connectedPlatforms = user.platformUsers
      ?.map((pu) => pu.platformName)
      .join(", ")

    const managedGuilds = memberships
      .filter((ms) => ms.isAdmin)
      .map((ms) => ms.guildId)
      .join(", ")

    addIntercomSettings({
      userId: user.id,
      address: address.toLowerCase(),
      connectedPlatforms,
      managedGuilds,
    })
  }, [address, isConnected, user, memberships])

  return (
    <IntercomContext.Provider
      value={{
        addIntercomSettings,
        triggerChat,
      }}
    >
      {children}
    </IntercomContext.Provider>
  )
}

const useIntercom = () => useContext(IntercomContext)

export default IntercomProvider
export { useIntercom }
