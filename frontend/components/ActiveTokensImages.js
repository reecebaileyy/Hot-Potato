import React, { useEffect, useState } from 'react';
import { useContractRead, useContractEvent } from 'wagmi';
import TokenImage from './TokenImage';
import { HiArrowCircleDown, HiArrowCircleUp } from "react-icons/hi";


const ActiveTokensImages = ({ ownerAddress, ABI, shouldRefresh, tokenId }) => {

  const [explodedTokens, setExplodedTokens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [sortedTokens, setSortedTokens] = useState([]);

  // Pagination logic
  const indexOfLastToken = currentPage * itemsPerPage;
  const indexOfFirstToken = indexOfLastToken - itemsPerPage;

  // Functions to handle sorting
  const sortTokensAsc = () => {
    const sorted = [...activeTokens].sort((a, b) => Number(a.toString()) - Number(b.toString()));
    setSortedTokens(sorted);
  }

  const sortTokensDesc = () => {
    const sorted = [...activeTokens].sort((a, b) => Number(b.toString()) - Number(a.toString()));
    setSortedTokens(sorted);
  }

  const currentTokens = sortedTokens?.slice(indexOfFirstToken, indexOfLastToken);

  useContractEvent({
    address: '0xAb989B312e6e493c88Ac97b3808855afdf1C359D',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        await refetchImageString({ args: [tokenId] });
        await refetchPotatoTokenId();
        await refetchGetActiveTokens();
      } catch (error) {
        console.error('Error updating mints', error);
      }
    },
  });

  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0xAb989B312e6e493c88Ac97b3808855afdf1C359D',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: true
  });

  const { data: activeTokens, isLoading, refetch: refetchActiveTokens, isError } = useContractRead({
    address: '0xAb989B312e6e493c88Ac97b3808855afdf1C359D',
    abi: ABI,
    functionName: 'getActiveTokensOfOwner',
    args: [ownerAddress],
    enabled: true
  });


  const { data: getImageString, isLoading: loadingImage, refetch: refetchImageString, isError: errorImage } = useContractRead({
    address: '0xAb989B312e6e493c88Ac97b3808855afdf1C359D',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: true
  });

  useEffect(() => {
    refetchActiveTokens({ args: [ownerAddress] });
    refetchGetActiveTokens();
    refetchImageString({ args: [tokenId] });
  }, [ownerAddress, refetchActiveTokens, shouldRefresh]);

  useEffect(() => {
    refetchActiveTokens({ args: [ownerAddress] });
  }, []);

  useEffect(() => {
    setSortedTokens(activeTokens || []);
  }, [activeTokens]);


  const handleTokenExploded = (tokenId) => {
    setExplodedTokens(prevTokens => [...prevTokens, tokenId]);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activeTokens) {
    console.log('Error loading active tokens', isError);
    return (
      <div className='flex flex-col'>
        <p>Error loading active tokens.{' '}</p>
        <button className='border-t-emerald-900 font-bold' onClick={() => refetchActiveTokens({ args: [ownerAddress] })}>
          Try Refreshing
        </button>
      </div>
    );
  }

  if (activeTokens == 0) {
    console.log('Error loading active tokens', isError);
    return (
      <div className='flex flex-col text-center'>
        <h1 className='text-xl'>Mint some hands to join the round!</h1>
      </div>
    );
  }

  return (
    <div>
      <div className='text-2xl sm:text-xl md:text-xl lg:text-xl text-center'>
        <h1 className='underline'>Sort By:</h1>
        <button className='mr-5' onClick={sortTokensAsc}><HiArrowCircleUp /></button>
        <button onClick={sortTokensDesc}><HiArrowCircleDown /></button>
      </div>
      <div className={`grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-4 justify-center items-center`}>
        {currentTokens.filter(tokenId => !explodedTokens.includes(tokenId)).map((tokenId, index) => (
          <div key={index} className="border rounded-lg p-2 text-center justify-center items-center flex flex-col">
            <TokenImage delay={index * 1000} tokenId={Number(tokenId)} onTokenExploded={handleTokenExploded} ABI={ABI} shouldRefresh={shouldRefresh} size={300} />
          </div>
        ))}
      </div>
      <div className='text-center'>
        {/* Implement the pagination buttons here */}
        {Array(Math.ceil(sortedTokens.length / itemsPerPage)).fill().map((_, index) => (
          <button className='justify-items-center mx-4 sm:mx-2 mt-4' key={index} onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
        ))}
      </div>
    </div>
  );

};

export default ActiveTokensImages;
