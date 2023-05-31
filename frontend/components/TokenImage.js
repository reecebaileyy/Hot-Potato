import React from 'react';
import { useContractRead } from 'wagmi';
import Image from 'next/image';

const TokenImage = ({ tokenId, ABI }) => {
  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0x59730d6837bcE4Cd74a798cf0fC75257f4494299',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !getImageString) {
    return <div>Error loading image. Try Refreshing.</div>;
  }

  

  return (
    <div key={tokenId}>
      <Image src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
      width={500}  
      height={500}  alt={`Token ${tokenId} Image`} />
      Token ID: {tokenId}
      <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
    </div>
  );
};

export default TokenImage;
