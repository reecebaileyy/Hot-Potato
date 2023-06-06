import React, { useEffect } from 'react';
import { useContractRead } from 'wagmi';
import Image from 'next/image';

const TokenImage = ({ tokenId, ABI }) => {
  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0xe1670F1D2E071bEeC40a93EB7F5D939065DC7271',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
  });

  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0xe1670F1D2E071bEeC40a93EB7F5D939065DC7271',
    abi: ABI,
    functionName: 'potatoTokenId',
  })
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  // Refetch image whenever tokenId or ABI changes
  useEffect(() => {
    refetchImageString({ args: [tokenId] });
    refetchPotatoTokenId();
  }, [tokenId, ABI, refetchImageString]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !getImageString) {
    return <div>Error loading image. Try Refreshing.</div>;
  }

  return (
    <div className={`${tokenId == _potatoTokenId ? ' flex flex-col animate-pulse' : 'flex flex-col'}`} key={tokenId} >
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
