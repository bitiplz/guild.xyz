import { CHAIN_CONFIG, Chains } from "chains"
import { NFTDetails } from "components/[guild]/collect/hooks/useNftDetails"
import useGuild from "components/[guild]/hooks/useGuild"
import { usePostHogContext } from "components/_app/PostHogProvider"
import pinFileToIPFS from "hooks/usePinata/utils/pinataUpload"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useState } from "react"
import guildRewardNFTFacotryAbi from "static/abis/guildRewardNFTFactory"
import { mutate } from "swr"
import { GuildPlatform, PlatformType } from "types"
import getEventsFromViemTxReceipt from "utils/getEventsFromViemTxReceipt"
import processViemContractError from "utils/processViemContractError"
import { TransactionReceipt, parseUnits } from "viem"
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi"
import { ContractCallSupportedChain, CreateNftFormType } from "../CreateNftForm"

export const GUILD_REWARD_NFT_FACTORY_ADDRESSES: Record<
  ContractCallSupportedChain,
  string
> = {
  ETHEREUM: "0x6ee2dd02fbfb71f518827042b6adca242f1ba0b2",
  BASE_MAINNET: "0x4205e56a69a0130a9e0828d45d0c84e45340a196",
  OPTIMISM: "0xe6e6b676f94a6207882ac92b6014a391766fa96e",
  POLYGON: "0xc1c23618110277ffe6d529816eb23de42b24cc33",
  POLYGON_MUMBAI: "0xf14249947c6de788c61f8ac5db0495ee2663ec1b",
}

type NftMetadata = {
  name: string
  description?: string
  image: string
  attributes: { trait_type: string; value: string }[] // TODO: maybe add display_type too?
}

export enum ContractCallFunction {
  SIMPLE_CLAIM = "function claim(address payToken, address receiver, bytes calldata signature) payable",
}

export const CONTRACT_CALL_ARGS_TO_SIGN: Record<ContractCallFunction, string[]> = {
  [ContractCallFunction.SIMPLE_CLAIM]: [],
}

export type CreateNFTResponse = {
  // returning the submitted form too, so we can easily populate the SWR cache with the NFT details (e.g. image, name, etc.)
  formData: CreateNftFormType
  guildPlatform: Omit<GuildPlatform, "id" | "platformGuildName">
}

const useCreateNft = (
  onSuccess: (newGuildPlatform: CreateNFTResponse["guildPlatform"]) => void
) => {
  const { urlName } = useGuild()
  const { captureEvent } = usePostHogContext()
  const postHogOptions = { guild: urlName }

  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [loadingText, setLoadingText] = useState<string>()

  const toast = useToast()
  const showErrorToast = useShowErrorToast()

  const createNft = async (data: CreateNftFormType): Promise<CreateNFTResponse> => {
    setLoadingText("Uploading image")

    const { IpfsHash: imageCID } = await pinFileToIPFS({
      data: [data.image],
    })

    setLoadingText("Uploading metadata")

    const image = `ipfs://${imageCID}`

    const metadata: NftMetadata = {
      name: data.name,
      description: data.description,
      image,
      attributes:
        data.attributes?.map((attr) => ({
          trait_type: attr.name,
          value: attr.value,
        })) ?? [],
    }

    const metadataJSON = JSON.stringify(metadata)

    const { IpfsHash: metadataCID } = await pinFileToIPFS({
      data: [metadataJSON],
      fileNames: ["metadata.json"],
    })

    setLoadingText("Deploying contract")

    const { name, symbol, tokenTreasury, price } = data
    const trimmedName = name.trim()
    const trimmedSymbol = symbol.trim()
    // name, symbol, cid, tokenOwner, tokenTreasury, tokenFee
    const contractCallParams = [
      trimmedName,
      trimmedSymbol,
      metadataCID,
      address,
      tokenTreasury,
      parseUnits(
        price?.toString() ?? "0",
        CHAIN_CONFIG[Chains[chainId]].nativeCurrency.decimals
      ),
    ] as const

    const { request } = await publicClient.simulateContract({
      abi: guildRewardNFTFacotryAbi,
      address: GUILD_REWARD_NFT_FACTORY_ADDRESSES[Chains[chainId]],
      functionName: "deployBasicNFT",
      args: contractCallParams,
    })

    if (process.env.NEXT_PUBLIC_MOCK_CONNECTOR) {
      return Promise.resolve({} as CreateNFTResponse)
    }

    const hash = await walletClient.writeContract({
      ...request,
      account: walletClient.account,
    })

    const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt(
      { hash }
    )

    const events = getEventsFromViemTxReceipt(guildRewardNFTFacotryAbi, receipt)

    const rewardNFTDeployedEvent: {
      eventName: "RewardNFTDeployed"
      args: {
        deployer: `0x${string}`
        tokenAddress: `0x${string}`
      }
    } = events.find((event) => event.eventName === "RewardNFTDeployed")

    if (!rewardNFTDeployedEvent)
      return Promise.reject("Couldn't find RewardNFTDeployed event")

    const createdContractAddress =
      rewardNFTDeployedEvent.args.tokenAddress.toLowerCase() as `0x${string}`

    return {
      formData: data,
      guildPlatform: {
        platformId: PlatformType.CONTRACT_CALL,
        platformName: "CONTRACT_CALL",
        platformGuildId: `${data.chain}-${createdContractAddress}-${Date.now()}`,
        platformGuildData: {
          chain: data.chain,
          contractAddress: createdContractAddress,
          function: ContractCallFunction.SIMPLE_CLAIM,
          argsToSign: CONTRACT_CALL_ARGS_TO_SIGN[ContractCallFunction.SIMPLE_CLAIM],
          name: trimmedName,
          symbol: trimmedSymbol,
          imageUrl: `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${imageCID}`,
          description: data.richTextDescription,
        },
      },
    }
  }

  return {
    ...useSubmit(createNft, {
      onSuccess: (response) => {
        setLoadingText(null)

        toast({
          status: "success",
          title: "Successfully deployed NFT contract",
        })

        const { chain, contractAddress, name, imageUrl } =
          response.guildPlatform.platformGuildData

        captureEvent("Successfully created NFT", {
          ...postHogOptions,
          chain,
          contractAddress,
        })

        mutate<NFTDetails>(
          ["nftDetails", chain, contractAddress],
          {
            creator: address.toLowerCase(),
            name,
            totalCollectors: 0,
            totalCollectorsToday: 0,
            standard: "ERC-721", // TODO: we should use a dynamic value here
            image: imageUrl,
            description: response.formData.description,
            fee: parseUnits(
              response.formData.price.toString() ?? "0",
              CHAIN_CONFIG[response.formData.chain].nativeCurrency.decimals
            ),
          },
          {
            revalidate: false,
          }
        )

        onSuccess(response.guildPlatform)
      },
      onError: (error) => {
        setLoadingText(null)

        const prettyError = processViemContractError(error)

        captureEvent("useCreateNft error", {
          ...postHogOptions,
          prettyError,
          error,
        })

        showErrorToast(prettyError)
      },
    }),
    loadingText,
  }
}

export default useCreateNft
