import React, { useEffect, useState } from 'react';
import { useContractRead, useContractEvent } from 'wagmi';
import Image from 'next/image';

const OptimizedImage = (props) => (
  <Image {...props} unoptimized={true} />
);

const TokenImage = ({ tokenId, ABI, shouldRefresh, size = 500, onTokenExploded }) => {

  useContractEvent({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        await refetchImageString({ args: [tokenId] });
        await refetchGetActiveTokens();
        await refetchPotatoTokenId();
      } catch (error) {
        console.error('Error updating mints', error);
      }
    },
  });

  useContractEvent({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      await refetchGetActiveTokens();
      await refetchPotatoTokenId();
      refetchImageString({ args: [tokenId] });
    },
  });

  useContractEvent({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    eventName: 'PotatoExploded',
    async listener(log) {
      try {
        if (typeof log[0]?.args?.tokenId === 'bigint') {
          const tokenId_ = log[0].args.tokenId.toString();
          if (tokenId_ === tokenId) {
            onTokenExploded(tokenId);
          }
          await refetchGetActiveTokens();
          await refetchPotatoTokenId();
        } else {
          console.error('TokenId is not a BigInt or is not found in log args', log);
        }
      } catch (error) {
        console.log(error)
      }
    },
  });

  useContractEvent({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    eventName: 'PotatoPassed',
    async listener(log) {
      try {
        if (typeof log[0]?.args?.tokenIdFrom === 'bigint' && typeof log[0]?.args?.tokenIdTo === 'bigint') {
          await refetchImageString();
        } else {
          console.error('tokenIdFrom or tokenIdTo is not a BigInt or is not found in log args', log);
        }
      } catch (error) {
        console.log(error)
      }
    },
  });

  const { data: getImageString, isLoading, refetch: refetchImageString, isError } = useContractRead({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: true,
    onError(error) {
      console.log('Error', error)
    },
  });

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: true
  });

  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0x09ED17Ad25F9d375eB24aa4A3C8d23D625D0aF7a',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: true
  });
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  useEffect(() => {
    refetchPotatoTokenId();
    refetchGetActiveTokens();
    refetchImageString({ args: [tokenId] });
  }, [tokenId, shouldRefresh, refetchImageString]);

  useEffect(() => {
    refetchPotatoTokenId();
    refetchGetActiveTokens();
    console.log('refetching image string');
    refetchImageString({ args: [tokenId] });
  }, []);

  useEffect(() => {
      refetchPotatoTokenId();
      refetchGetActiveTokens();
      refetchImageString({ args: [tokenId] });
  }, [tokenId, shouldRefresh, refetchImageString]);


  if (isLoading) {
    return <div>Loading...</div>;
  }


  if (isError) {
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
        width={size}
        height={size}
        alt={`Token ${tokenId} Image`}
      />
      Token ID:
      <span>{tokenId}</span>
      {isError && (
      <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
      )}
    </div>
  );
};

export default TokenImage;
