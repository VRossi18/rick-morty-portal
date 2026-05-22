export const donationContractAbi = [
   {
      type: 'function',
      name: 'donate',
      stateMutability: 'payable',
      inputs: [],
      outputs: [],
   },
   {
      type: 'event',
      name: 'Donated',
      inputs: [
         { name: 'sender', type: 'address', indexed: true },
         { name: 'amount', type: 'uint256', indexed: false },
      ],
      anonymous: false,
   },
] as const;
