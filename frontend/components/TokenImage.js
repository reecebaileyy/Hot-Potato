import React, { useEffect, useState } from 'react';
import { useContractRead, useContractEvent } from 'wagmi';
import Image from 'next/image';

const OptimizedImage = (props) => (
  <Image {...props} unoptimized={true} />
);

const TokenImage = ({ tokenId, ABI, shouldRefresh }) => {

  const [exploded, setExploded] = useState(false);

  useContractEvent({
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        await refetchGetExplosionTime();
        await refetchGetActiveTokens();
        await refetchPotatoTokenId();
        console.log('PotatoMinted event detected', log);
      } catch (error) {
        console.error('Error updating mints', error);
      }
    },
  });

  useContractEvent({
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      await refetchGetExplosionTime();
      await refetchGetActiveTokens();
      await refetchPotatoTokenId();
    },
  });

  useContractEvent({
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    eventName: 'PotatoExploded',
    async listener(log) {
      try {
        if (typeof log[0]?.args?.tokenId === 'bigint') {
          const tokenId_ = log[0].args.tokenId.toString();
          if (tokenId_ === tokenId) {
            setExploded(true);
          }
          await refetchGetExplosionTime();
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
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
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
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: false
  });

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: true
  });
  const _activeTokens = parseInt(getActiveTokens, 10);

  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0xe5Fa08a23727Eb8274b60CF093f46f6466dAAEB8',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: true
  });
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  useEffect(() => {
    refetchImageString({ args: [tokenId] });
  }, [tokenId, shouldRefresh, refetchImageString]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (exploded) {
    return <div>EXPLODED</div>  // Don't render anything if the token has exploded
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
