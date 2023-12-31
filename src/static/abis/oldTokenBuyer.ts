const oldTokenBuyerAbi = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "universalRouter_",
        type: "address",
      },
      { internalType: "address", name: "permit2_", type: "address" },
      {
        internalType: "address payable",
        name: "feeCollector_",
        type: "address",
      },
      { internalType: "uint96", name: "feePercentBps_", type: "uint96" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "FailedToSendEther",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "commandIndex", type: "uint256" },
      { internalType: "bytes", name: "message", type: "bytes" },
    ],
    name: "ExecutionFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientToken",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientETH",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidBips",
    type: "error",
  },
  {
    inputs: [],
    name: "FromAddressIsNotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidReserves",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPath",
    type: "error",
  },
  {
    inputs: [],
    name: "V2TooLittleReceived",
    type: "error",
  },
  {
    inputs: [],
    name: "V2TooMuchRequested",
    type: "error",
  },
  {
    inputs: [],
    name: "V2InvalidPath",
    type: "error",
  },
  {
    inputs: [],
    name: "SliceOutOfBounds",
    type: "error",
  },
  {
    inputs: [],
    name: "V3InvalidSwap",
    type: "error",
  },
  {
    inputs: [],
    name: "V3TooLittleReceived",
    type: "error",
  },
  {
    inputs: [],
    name: "V3TooMuchRequested",
    type: "error",
  },
  {
    inputs: [],
    name: "V3InvalidAmountOut",
    type: "error",
  },
  {
    inputs: [],
    name: "V3InvalidCaller",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAllowedReenter",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "BaseFeeChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "FeeCollectorChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint96",
        name: "newShare",
        type: "uint96",
      },
    ],
    name: "FeePercentBpsChanged",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "TokensBought", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensSweeped",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "baseFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeCollector",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feePercentBps",
    outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "tokenAddress", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct ITokenBuyer.PayToken",
        name: "payToken",
        type: "tuple",
      },
      { internalType: "bytes", name: "uniCommands", type: "bytes" },
      { internalType: "bytes[]", name: "uniInputs", type: "bytes[]" },
    ],
    name: "getAssets",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "hash", type: "bytes32" },
      { internalType: "bytes", name: "signature", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ internalType: "bytes4", name: "magicValue", type: "bytes4" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "permit2",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "newFee", type: "uint256" },
    ],
    name: "setBaseFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "setFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint96", name: "newShare", type: "uint96" }],
    name: "setFeePercentBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address payable", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "sweep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "universalRouter",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export default oldTokenBuyerAbi
