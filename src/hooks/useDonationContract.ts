import { useCallback } from 'react';
import { parseEther } from 'viem';
import {
   useWaitForTransactionReceipt,
   useWriteContract,
} from 'wagmi';
import { donationContractAbi } from '../abis/donationContract';
import { donationContractAddress } from '../config/donations';

export function useDonationContract() {
   const { mutateAsync, isPending, error, data: hash, reset } = useWriteContract();

   const { isLoading: isConfirming, isSuccess: isConfirmed } =
      useWaitForTransactionReceipt({
         hash,
      });

   const donate = useCallback(
      async (amountMatic: string) => {
         if (!donationContractAddress) {
            throw new Error('CONTRACT_NOT_CONFIGURED');
         }

         const value = parseEther(amountMatic);
         await mutateAsync({
            abi: donationContractAbi,
            address: donationContractAddress,
            functionName: 'donate',
            value,
         });
      },
      [mutateAsync],
   );

   return {
      donate,
      isPending,
      isConfirming,
      isConfirmed,
      hash,
      error,
      reset,
   };
}
