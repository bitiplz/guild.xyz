import { useCreateGuildContext } from "components/create-guild/CreateGuildContext"
import Pagination from "components/create-guild/Pagination"
import useUser from "components/[guild]/hooks/useUser"
import UniqueTextDataForm, {
  UniqueTextRewardForm,
} from "platforms/UniqueText/UniqueTextDataForm"
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form"
import { GuildFormType } from "types"

const CreateGuildUniqueText = () => {
  const { id: userId } = useUser()

  const { nextStep } = useCreateGuildContext()

  const { setValue } = useFormContext<GuildFormType>()
  const methods = useForm<UniqueTextRewardForm>({ mode: "all" })

  const name = useWatch({ control: methods.control, name: "name" })
  const texts = useWatch({ control: methods.control, name: "texts" })
  const imageUrl = useWatch({ control: methods.control, name: "imageUrl" })

  return (
    <>
      <FormProvider {...methods}>
        <UniqueTextDataForm />
      </FormProvider>

      <Pagination
        nextButtonDisabled={!name?.length}
        nextStepHandler={() => {
          setValue("guildPlatforms.0", {
            platformName: "UNIQUE_TEXT",
            platformGuildId: `unique-text-${userId}-${Date.now()}`,
            platformGuildData: {
              texts: texts?.filter(Boolean) ?? [],
              name,
              imageUrl,
            },
          })
          nextStep()
        }}
      />
    </>
  )
}
export default CreateGuildUniqueText
