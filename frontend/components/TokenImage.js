import React, { useEffect, useState } from 'react';
import { useContractRead, useContractEvent } from 'wagmi';
import Image from 'next/image';
import Modal from 'react-modal';
import { BsXCircle } from "react-icons/bs";

Modal.setAppElement('#__next')


const OptimizedImage = (props) => (
  <Image {...props} unoptimized={true} />
);

const TokenImage = ({ tokenId, ABI, shouldRefresh, size = 500, onTokenExploded, delay }) => {
  const [isModalOpen, setModalOpen] = useState(false);


  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useContractEvent({
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
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
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      await refetchGetActiveTokens();
      await refetchPotatoTokenId();
      refetchImageString({ args: [tokenId] });
    },
  });

  useContractEvent({
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    eventName: 'PotatoExploded',
    async listener(log) {
      try {
        await refetchPotatoTokenId();
        console.log(`PotatoExploded ${log}`);
          const tokenId_ = log[0].args.tokenId.toString();
          if (tokenId_ === tokenId) {
            onTokenExploded(tokenId);
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
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
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
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: true,
    onError(error) {
      console.log('Error', error)
    },
  });

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: true
  });

  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0xb6f6CE3AD79c658645682169C0584664cfEc7908',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: true
  });
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  useEffect(() => {
    const timer = setTimeout(() => {
      refetchPotatoTokenId();
      refetchGetActiveTokens();
      refetchImageString({ args: [tokenId] });
    }, delay);

    // Cleanup function
    return () => clearTimeout(timer);
    
  }, [tokenId, shouldRefresh, refetchImageString, delay]);


  if (isLoading) {
    return <div>Loading...</div>;
  }


  if (isError) {
    return (
      <div>
        Error loading image.{' '}
        <button className='p-10 rounded-lg bg-black text-white' onClick={() => refetchImageString({ args: [tokenId] })}>
          Try Refreshing
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${tokenId == _potatoTokenId ? 'flex flex-col animate-pulse' : 'flex flex-col'}`} key={tokenId}>
      <OptimizedImage
        src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
        width={size}
        height={size}
        alt={`Token ${tokenId} Image`}
        className="border-transparent cursor-pointer"
        onClick={openModal}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={`Token ${tokenId} Image`}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 flex items-center justify-center border-transparent bg-transparent"
      >
        <div className="relative border-transparent rounded flex items-center justify-center">
        <button
            onClick={closeModal}
            className='absolute top-0 right-0 text-3xl mt-2 mr-2'
          >
            <BsXCircle/>
          </button>
          <OptimizedImage
            src={`data:image/svg+xml,${encodeURIComponent(getImageString)}`}
            alt={`Token ${tokenId} Image`}
            width="800"
            height="800"
            className="border-transparent"
          />
        </div>
      </Modal>
      Token ID:
      <span>{tokenId}</span>
      {isError && (
        <button onClick={() => refetchImageString({ args: [tokenId] })}>Refresh Image</button>
      )}
    </div>
  );
};

export default TokenImage;