import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { CHAIN_CONFIG, Chain, Chains } from "chains"
import { useAddRewardContext } from "components/[guild]/AddRewardContext"
import useGuildFee from "components/[guild]/collect/hooks/useGuildFee"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import Button from "components/common/Button"
import FormErrorMessage from "components/common/FormErrorMessage"
import Link from "components/common/Link"
import StyledSelect from "components/common/StyledSelect"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import { ArrowSquareOut, Plus, TrashSimple } from "phosphor-react"
import {
  FormProvider,
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import ChainPicker from "requirements/common/ChainPicker"
import { ADDRESS_REGEX } from "utils/guildCheckout/constants"
import { formatUnits } from "viem"
import { useAccount, useChainId } from "wagmi"
import ImagePicker from "./components/ImagePicker"
import RichTextDescriptionEditor from "./components/RichTextDescriptionEditor"
import useCreateNft, { CreateNFTResponse } from "./hooks/useCreateNft"

type Props = {
  onSuccess: (newGuildPlatform: CreateNFTResponse["guildPlatform"]) => void
}

export type CreateNftFormType = {
  chain: Chain
  tokenTreasury: `0x${string}`
  name: string
  symbol: string
  price: number
  description?: string
  richTextDescription?: string
  image: File
  attributes: { name: string; value: string }[]
}

const CONTRACT_CALL_SUPPORTED_CHAINS = [
  "ETHEREUM",
  "BASE_MAINNET",
  "OPTIMISM",
  "POLYGON",
  "POLYGON_MUMBAI",
] as const

export type ContractCallSupportedChain =
  (typeof CONTRACT_CALL_SUPPORTED_CHAINS)[number]

const CreateNftForm = ({ onSuccess }: Props) => {
  const { address } = useAccount()
  const chainId = useChainId()
  const { requestNetworkChange, isNetworkChangeInProgress } =
    useWeb3ConnectionManager()

  const methods = useForm<CreateNftFormType>({
    mode: "all",
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  const chain = useWatch({
    control,
    name: "chain",
  })
  const shouldSwitchChain = Chains[chainId] !== chain

  const {
    field: {
      ref: priceFieldRef,
      value: priceFieldValue,
      onChange: priceFieldOnChange,
      onBlur: priceFieldOnBlur,
    },
  } = useController({
    control,
    name: "price",
    defaultValue: 0,
    rules: {
      min: {
        value: 0,
        message: "Amount must be positive",
      },
    },
  })

  const { guildFee } = useGuildFee(chain)
  const formattedGuildFee =
    guildFee && chain
      ? Number(formatUnits(guildFee, CHAIN_CONFIG[chain].nativeCurrency.decimals))
      : undefined

  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  })

  const {
    field: { onChange: onDescriptionChange },
  } = useController({ control, name: "richTextDescription" })

  const { setShouldShowCloseAlert, setIsBackButtonDisabled } =
    useAddRewardContext() ?? {}
  const { onSubmit, isLoading, loadingText } = useCreateNft((newGuildPlatform) => {
    setShouldShowCloseAlert?.(false)
    onSuccess(newGuildPlatform)
  })

  const metadataBgColor = useColorModeValue("white", "blackAlpha.300")

  return (
    <FormProvider {...methods}>
      <Stack spacing={8}>
        <Text colorScheme="gray" fontWeight="semibold">
          Create an NFT that members will be able to mint if they satisfy the
          requirements you'll set. Claiming can take place through your Guild page or
          a fancy auto-generated minting page!
        </Text>

        <Grid w="full" templateColumns="repeat(3, 1fr)" gap={8}>
          <GridItem colSpan={{ base: 3, sm: 1 }}>
            <ImagePicker />
          </GridItem>

          <GridItem colSpan={{ base: 3, sm: 2 }}>
            <Stack spacing={6}>
              <HStack alignItems="start">
                <FormControl isInvalid={!!errors?.name}>
                  <FormLabel>Name</FormLabel>

                  <Input
                    {...register("name", { required: "This field is required" })}
                  />

                  <FormErrorMessage>{errors?.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!errors?.symbol}
                  maxW={{ base: 24, md: 36 }}
                >
                  <FormLabel>Symbol</FormLabel>

                  <Input
                    {...register("symbol", { required: "This field is required" })}
                  />

                  <FormErrorMessage>{errors?.symbol?.message}</FormErrorMessage>
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors?.richTextDescription}>
                <FormLabel>Reward description</FormLabel>

                <RichTextDescriptionEditor onChange={onDescriptionChange} />

                <FormErrorMessage>
                  {errors?.richTextDescription?.message}
                </FormErrorMessage>

                <FormHelperText>
                  This description will be shown on the minting page. You can use
                  markdown syntax here.
                </FormHelperText>
              </FormControl>

              <FormControl isInvalid={!!errors?.description}>
                <FormLabel>Metadata description</FormLabel>

                <Textarea {...register("description")} />

                <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>

                <FormHelperText>
                  This description will be included in the NFT metadata.
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Metadata</FormLabel>

                <Stack spacing={2}>
                  {fields?.map((field, index) => (
                    <Box
                      key={field.id}
                      p={2}
                      bgColor={metadataBgColor}
                      borderRadius="xl"
                      borderWidth={"1px"}
                    >
                      <Grid templateColumns="1fr 0.5rem 1fr 2.5rem" gap={1}>
                        <FormControl isInvalid={!!errors?.attributes?.[index]?.name}>
                          <Input
                            placeholder="Name"
                            variant={"filled"}
                            {...register(`attributes.${index}.name`, {
                              required: "This field is required",
                            })}
                          />
                          <FormErrorMessage>
                            {errors?.attributes?.[index]?.name?.message}
                          </FormErrorMessage>
                        </FormControl>

                        <Flex justifyContent="center">
                          <Text as="span" mt={2}>
                            :
                          </Text>
                        </Flex>

                        <FormControl
                          isInvalid={!!errors?.attributes?.[index]?.value}
                        >
                          <Input
                            placeholder="Value"
                            variant={"filled"}
                            {...register(`attributes.${index}.value`, {
                              required: "This field is required",
                            })}
                          />
                          <FormErrorMessage>
                            {errors?.attributes?.[index]?.value?.message}
                          </FormErrorMessage>
                        </FormControl>

                        <Flex justifyContent="end">
                          <IconButton
                            aria-label="Remove attribute"
                            icon={<TrashSimple />}
                            colorScheme="red"
                            size="sm"
                            rounded="full"
                            variant="ghost"
                            onClick={() => remove(index)}
                            mt={1}
                          />
                        </Flex>
                      </Grid>
                    </Box>
                  ))}

                  <Button
                    leftIcon={<Icon as={Plus} />}
                    onClick={() =>
                      append({
                        name: "",
                        value: "",
                      })
                    }
                  >
                    Add attribute
                  </Button>
                </Stack>
              </FormControl>

              <Divider />

              <HStack>
                <ChainPicker
                  controlName="chain"
                  supportedChains={[...CONTRACT_CALL_SUPPORTED_CHAINS]}
                  showDivider={false}
                />
                <FormControl>
                  <FormLabel>Supply</FormLabel>
                  <StyledSelect
                    value={{
                      label: "Unlimited",
                      value: "UNLIMITED",
                    }}
                    options={[
                      {
                        label: "Unlimited",
                        value: "UNLIMITED",
                      },
                      {
                        label: "Fixed",
                        value: "FIXED",
                        isDisabled: true,
                        details: "Coming soon",
                      },
                    ]}
                    filterOption={() => true}
                  />
                </FormControl>
              </HStack>

              <FormControl isInvalid={!!errors?.price}>
                <FormLabel>Price</FormLabel>

                <InputGroup w="full">
                  <NumberInput
                    w="full"
                    ref={priceFieldRef}
                    value={priceFieldValue}
                    onChange={(newValue) => {
                      if (/^[0-9]*\.0*$/i.test(newValue))
                        return priceFieldOnChange(newValue)

                      const valueAsNumber = parseFloat(newValue)

                      priceFieldOnChange(!isNaN(valueAsNumber) ? newValue : "")
                    }}
                    onBlur={priceFieldOnBlur}
                    min={0}
                    sx={{
                      "> input": {
                        borderRightRadius: 0,
                      },
                      "div div:first-of-type": {
                        borderTopRightRadius: 0,
                      },
                      "div div:last-of-type": {
                        borderBottomRightRadius: 0,
                      },
                    }}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>

                  {chain && (
                    <InputRightAddon>
                      {CHAIN_CONFIG[chain].nativeCurrency.symbol}
                    </InputRightAddon>
                  )}
                </InputGroup>

                <FormHelperText>
                  {`Collectors will pay an additional `}
                  <Skeleton display="inline" h={3} isLoaded={!!formattedGuildFee}>
                    {formattedGuildFee ?? "..."}
                  </Skeleton>
                  {` ${
                    chain ? CHAIN_CONFIG[chain].nativeCurrency.symbol : "COIN"
                  } Guild minting fee. `}
                  <Link
                    href="https://help.guild.xyz/en/articles/8193498-guild-base-fee"
                    isExternal
                    textDecoration="underline"
                  >
                    Learn more
                    <Icon as={ArrowSquareOut} ml={0.5} />
                  </Link>
                </FormHelperText>

                <FormErrorMessage>{errors?.price?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors?.tokenTreasury}>
                <FormLabel>Payout address</FormLabel>

                <Input
                  {...register("tokenTreasury", {
                    required: "This field is required.",
                    pattern: {
                      value: ADDRESS_REGEX,
                      message:
                        "Please input a 42 characters long, 0x-prefixed hexadecimal address.",
                    },
                  })}
                  defaultValue={address}
                  placeholder={`e.g. ${address}`}
                />

                <FormHelperText>
                  When users pay for minting the NFT, you'll receive the funds on
                  this wallet address.
                </FormHelperText>

                <FormErrorMessage>{errors?.tokenTreasury?.message}</FormErrorMessage>
              </FormControl>
            </Stack>
          </GridItem>
        </Grid>

        <HStack justifyContent="end">
          {chain && Chains[chainId] !== chain && (
            <Button
              data-test="create-nft-switch-network-button"
              isLoading={isNetworkChangeInProgress}
              loadingText="Check your wallet"
              onClick={() => requestNetworkChange(Chains[chain])}
            >{`Switch to ${CHAIN_CONFIG[chain].name}`}</Button>
          )}
          <Tooltip
            label="Please switch to a supported chain"
            isDisabled={!shouldSwitchChain}
          >
            <Button
              data-test="create-nft-button"
              colorScheme="indigo"
              isDisabled={shouldSwitchChain || isLoading}
              isLoading={isLoading}
              loadingText={loadingText}
              onClick={(e) => {
                setShouldShowCloseAlert?.(true)
                setIsBackButtonDisabled?.(true)
                return handleSubmit(onSubmit)(e)
              }}
            >
              Create NFT & continue setup
            </Button>
          </Tooltip>
        </HStack>
      </Stack>

      <DynamicDevTool control={control} />
    </FormProvider>
  )
}

export default CreateNftForm
