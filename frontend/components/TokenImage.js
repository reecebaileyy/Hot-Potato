import React, { useEffect } from 'react';
import { useContractRead } from 'wagmi';
import Image from 'next/image';

const TokenImage = ({ tokenId, ABI }) => {
  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0x59730d6837bcE4Cd74a798cf0fC75257f4494299',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
  });

  const { data: potatoTokenId } = useContractRead({
    address: '0x59730d6837bcE4Cd74a798cf0fC75257f4494299',
    abi: ABI,
    functionName: 'potatoTokenId',
  });

  const _potatoTokenId = parseInt(potatoTokenId, 10);

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

  return (
    <div key={tokenId}>
      <div className={`relative ${tokenId === _potatoTokenId ? 'animate-pulse' : ''}`}>
        <Image
          src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
          width={500}
          height={500}
          alt={`Token ${tokenId} Image`}
        />
        {tokenId === _potatoTokenId && (
          <div className="absolute inset-0 bg-yellow-200 opacity-50"></div>
        )}
      </div>
      Token ID: {tokenId}
      <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
    </div>
  );
};

export default TokenImage;
