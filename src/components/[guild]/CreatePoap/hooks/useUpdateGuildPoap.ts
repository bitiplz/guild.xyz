import useGuild from "components/[guild]/hooks/useGuild"
import useShowErrorToast from "hooks/useShowErrorToast"
import { SignedValdation, useSubmitWithSign } from "hooks/useSubmit"
import { UseSubmitOptions } from "hooks/useSubmit/useSubmit"
import { usePoap } from "requirements/Poap/hooks/usePoaps"
import usePoapEventDetails from "requirements/PoapVoice/hooks/usePoapEventDetails"
import { GuildPoap } from "types"
import fetcher from "utils/fetcher"

const useUpdateGuildPoap = (
  guildPoap: GuildPoap,
  { onSuccess }: UseSubmitOptions = {}
) => {
  const showErrorToast = useShowErrorToast()

  const { mutateGuild, id } = useGuild()
  const { mutatePoap } = usePoap(guildPoap?.fancyId)
  const { mutatePoapEventDetails } = usePoapEventDetails()

  const updateGuildPoap = async (signedValidation: SignedValdation) =>
    fetcher(`/v2/guilds/${id}/poaps/${guildPoap.id}`, {
      method: "PUT",
      ...signedValidation,
    })

  return useSubmitWithSign<GuildPoap>(updateGuildPoap, {
    onError: (error) => showErrorToast(error),
    onSuccess: async (newPoap) => {
      mutatePoapEventDetails({
        ...newPoap,
        contracts: [],
      })

      mutateGuild(
        (oldData) => ({
          ...oldData,
          poaps: oldData.poaps.map((oldPoap) =>
            oldPoap.id === newPoap.id ? newPoap : oldPoap
          ),
        }),
        { revalidate: false }
      )

      /**
       * Actual POAP data (handled by POAP API not ours) is being mutated here, after
       * both updates (one for POAP API, one for our API) has been completed
       */
      mutatePoap()
      onSuccess?.()
    },
  })
}

export default useUpdateGuildPoap
