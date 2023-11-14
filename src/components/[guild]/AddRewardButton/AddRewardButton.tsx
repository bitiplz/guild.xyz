import {
  HStack,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import PlatformsGrid from "components/create-guild/PlatformsGrid"
import useCreateRole from "components/create-guild/hooks/useCreateRole"
import useToast from "hooks/useToast"
import dynamic from "next/dynamic"
import { ArrowLeft, Info, Plus } from "phosphor-react"
import SelectRoleOrSetRequirements from "platforms/components/SelectRoleOrSetRequirements"
import platforms from "platforms/platforms"
import { useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { Visibility } from "types"
import getRandomInt from "utils/getRandomInt"
import {
  AddRewardProvider,
  RoleTypeToAddTo,
  useAddRewardContext,
} from "../AddRewardContext"
import { CreatePoapProvider } from "../CreatePoap/components/CreatePoapContext"
import { useIsTabsStuck } from "../Tabs/Tabs"
import { useThemeContext } from "../ThemeContext"
import useGuild from "../hooks/useGuild"
import useAddReward from "./hooks/useAddReward"

// temporary until POAPs are real rewards
const DynamicAddPoapPanel = dynamic(() => import("components/[guild]/CreatePoap"), {
  ssr: false,
})

const defaultValues = {
  requirements: [],
  roleIds: [],
  visibility: Visibility.PUBLIC,
}

const AddRewardButton = (): JSX.Element => {
  const { roles } = useGuild()

  const {
    modalRef,
    selection,
    setSelection,
    step,
    setStep,
    activeTab,
    isOpen,
    onOpen,
    onClose: onAddRewardModalClose,
    isBackButtonDisabled,
  } = useAddRewardContext()

  const methods = useForm({
    defaultValues,
  })

  const { isStuck } = useIsTabsStuck()
  const { textColor, buttonColorScheme } = useThemeContext()

  const goBack = () => {
    if (step === "SELECT_ROLE") {
      setStep("HOME")
      methods.reset(defaultValues)
    } else {
      setSelection(null)
    }
  }

  const requirements = useWatch({ name: "requirements", control: methods.control })
  const roleIds = useWatch({ name: "roleIds", control: methods.control })
  const isAddRewardButtonDisabled =
    activeTab === RoleTypeToAddTo.NEW_ROLE ? !requirements?.length : !roleIds?.length

  const toast = useToast()

  const onCloseAndClear = () => {
    methods.reset(defaultValues)
    onAddRewardModalClose()
  }

  const { onSubmit: onAddRewardSubmit, isLoading: isAddRewardLoading } =
    useAddReward({ onSuccess: onCloseAndClear })
  const { onSubmit: onCreateRoleSubmit, isLoading: isCreateRoleLoading } =
    useCreateRole({
      onSuccess: () => {
        toast({ status: "success", title: "Reward successfully added" })
        onCloseAndClear()
      },
    })

  const isLoading = isAddRewardLoading || isCreateRoleLoading

  const [saveAsDraft, setSaveAsDraft] = useState(false)

  const onSubmit = (data: any, saveAs: "DRAFT" | "PUBLIC" = "PUBLIC") => {
    if (data.requirements?.length > 0) {
      const visibility = saveAs === "DRAFT" ? Visibility.HIDDEN : Visibility.PUBLIC
      onCreateRoleSubmit({
        ...data,
        name: data.name || `New ${platforms[selection].name} role`,
        imageUrl: data.imageUrl || `/guildLogos/${getRandomInt(286)}.svg`,
        visibility,
        rolePlatforms: data.rolePlatforms.map((rp) => ({ ...rp, visibility })),
      })
    } else if (data.roleIds?.length) {
      onAddRewardSubmit({
        ...data.rolePlatforms[0].guildPlatform,
        rolePlatforms: data.roleIds
          ?.filter((roleId) => !!roleId)
          .map((roleId) => ({
            // We'll be able to send additional params here, like capacity & time
            roleId: +roleId,
            visibility:
              saveAs === "DRAFT"
                ? Visibility.HIDDEN
                : roles.find((role) => role.id === +roleId).visibility,
          })),
      })
    }
  }

  const { AddPlatformPanel, PlatformPreview } = platforms[selection] ?? {}

  const lightModalBgColor = useColorModeValue("white", "gray.700")

  return (
    <>
      <Button
        data-test="add-reward-button"
        leftIcon={<Plus />}
        onClick={onOpen}
        variant="ghost"
        size="sm"
        {...(!isStuck && {
          color: textColor,
          colorScheme: buttonColorScheme,
        })}
      >
        Add reward
      </Button>

      <FormProvider {...methods}>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            methods.reset(defaultValues)
            onAddRewardModalClose()
          }}
          size={step === "HOME" ? "4xl" : "2xl"}
          scrollBehavior="inside"
          colorScheme="dark"
        >
          <ModalOverlay />
          {/* TODO: this is a temporary solution, we should remove this from here when POAPs become real rewards */}
          <CreatePoapProvider>
            <ModalContent minH="550px">
              <ModalCloseButton />
              <ModalHeader
                {...(step === "SELECT_ROLE"
                  ? {
                      bgColor: lightModalBgColor,
                      boxShadow: "sm",
                      zIndex: 1,
                    }
                  : {})}
              >
                <Stack spacing={8}>
                  <HStack>
                    {selection && (
                      <IconButton
                        isDisabled={isBackButtonDisabled}
                        rounded="full"
                        aria-label="Back"
                        size="sm"
                        mb="-3px"
                        icon={<ArrowLeft size={20} />}
                        variant="ghost"
                        onClick={goBack}
                      />
                    )}
                    <Text>
                      {selection
                        ? `Add ${platforms[selection].name} reward`
                        : "Add reward"}
                    </Text>
                  </HStack>

                  {step === "SELECT_ROLE" && <PlatformPreview />}
                </Stack>
              </ModalHeader>

              <ModalBody ref={modalRef} className="custom-scrollbar">
                {selection === "POAP" ? (
                  <DynamicAddPoapPanel />
                ) : selection && step === "SELECT_ROLE" ? (
                  <SelectRoleOrSetRequirements selectedPlatform={selection} />
                ) : AddPlatformPanel ? (
                  <AddPlatformPanel
                    onSuccess={() => setStep("SELECT_ROLE")}
                    skipSettings
                  />
                ) : (
                  <PlatformsGrid onSelection={setSelection} showPoap pb="4" />
                )}
              </ModalBody>

              {selection !== "POAP" && step === "SELECT_ROLE" && (
                <ModalFooter pt="6" pb="8" gap={2}>
                  <Button
                    isDisabled={isAddRewardButtonDisabled}
                    onClick={methods.handleSubmit((data) => {
                      setSaveAsDraft(true)
                      onSubmit(data, "DRAFT")
                    })}
                    isLoading={saveAsDraft && isLoading}
                    rightIcon={
                      <Tooltip
                        label={
                          activeTab === RoleTypeToAddTo.EXISTING_ROLE
                            ? "The reward will be added to the role you select with hidden visibility, so users won't see it yet. You can edit & activate it later"
                            : "The role will be created with hidden visibility, so user's won't see it yet. You can edit & activate it later"
                        }
                      >
                        <Info />
                      </Tooltip>
                    }
                  >
                    Save as draft
                  </Button>
                  <Button
                    isDisabled={isAddRewardButtonDisabled}
                    colorScheme="green"
                    onClick={methods.handleSubmit((data) => {
                      setSaveAsDraft(false)
                      onSubmit(data)
                    })}
                    isLoading={!saveAsDraft && isLoading}
                  >
                    Save
                  </Button>
                </ModalFooter>
              )}
            </ModalContent>
          </CreatePoapProvider>
        </Modal>
      </FormProvider>
    </>
  )
}

const AddRewardButtonWrapper = (): JSX.Element => (
  <AddRewardProvider>
    <AddRewardButton />
  </AddRewardProvider>
)

export default AddRewardButtonWrapper
