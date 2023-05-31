import React, { useEffect } from 'react';
import { useContractRead } from 'wagmi';
import Image from 'next/image';

const TokenImage = ({ tokenId, ABI, potatoTokenId }) => {
  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0x59730d6837bcE4Cd74a798cf0fC75257f4494299',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
  });

  // Refetch image whenever tokenId or ABI changes
  useEffect(() => {
    refetchImageString({ args: [tokenId] });
  }, [tokenId, ABI, refetchImageString]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !getImageString) {
    return <div>Error loading image. Try Refreshing.</div>;
  }

  const divStyle = {
    backgroundColor: tokenId === potatoTokenId ? 'red' : 'transparent',
  };

  return (
    <div key={tokenId} style={divStyle}>
      <Image 
        src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
        width={500}  
        height={500}
        alt={`Token ${tokenId} Image`} 
      />
      Token ID: {tokenId}
      <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
    </div>
  );
};

export default TokenImage;
