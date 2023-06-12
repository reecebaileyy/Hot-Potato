import React, { useEffect } from 'react';
import { useContractRead, useContractEvent } from 'wagmi';
import Image from 'next/image';
import ABI from '../src/abi/UNKNOWN.json'

const OptimizedImage = (props) => (
  <Image {...props} unoptimized={true} />
);



const TokenImage = ({ tokenId, ABI, shouldRefresh }) => {

  useContractEvent({
    address: '0xAA065769Df8AFb40dbD7d987f6ec6B35Db18b303',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        console.log('PotatoMinted event detected', log);
        refetchGetActiveTokens();
        refetchImageString();
      } catch (error) {
        console.error('Error updating mints', error);
      }
    },
  });

  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0xAA065769Df8AFb40dbD7d987f6ec6B35Db18b303',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: true
  });

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0xAA065769Df8AFb40dbD7d987f6ec6B35Db18b303',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: true
  });
  const _activeTokens = parseInt(getActiveTokens, 10);

  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0xAA065769Df8AFb40dbD7d987f6ec6B35Db18b303',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: true
  });
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  useEffect(() => {
    refetchImageString();
    refetchGetActiveTokens();
    refetchPotatoTokenId();
  }, [_activeTokens, shouldRefresh, refetchPotatoTokenId, refetchGetActiveTokens, refetchImageString]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !getImageString) {
    console.log('Error loading image', isError);
    return (
      <div>
        Error loading image.{' '}
        <button onClick={() => refetchImageString({ args: [tokenId] })}>
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className={`${tokenId == _potatoTokenId ? ' flex flex-col animate-pulse' : 'flex flex-col'}`} key={tokenId}>
      <OptimizedImage
        src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
        width={500}
        height={500}
        alt={`Token ${tokenId} Image`}
      />
      Token ID: 
      <span>{tokenId}</span>
      <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
    </div>
  );
};

export default TokenImage;
