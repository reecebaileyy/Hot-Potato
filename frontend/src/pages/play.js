import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useState, useRef, useEffect } from 'react'
import { Web3Button } from '@web3modal/react'
import ABI from '../abi/UNKNOWN.json'
import { useAccount, useBalance, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent, useEnsName, WagmiProvider } from 'wagmi'
import hot from '../../public/assets/images/hot.png'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import Explosion from '../../public/assets/images/Explosion.gif'
import Burning from '../../public/assets/images/Burning.gif'
import blacklogo from '../../public/assets/images/Logo.png'
import TokenImage from '../../components/TokenImage'
import ActiveTokensImages from '../../components/ActiveTokensImages'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { HiArrowCircleDown, HiArrowCircleUp } from "react-icons/hi";
import { providers, Contract, ethers } from 'ethers';


export async function getServerSideProps() {
  const provider = new ethers.providers.JsonRpcBatchProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL);
  const contract = new Contract('0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07', ABI, provider);
  const initalGameState = await contract.getGameState();
  const roundNumber = await contract.currentGeneration();
  const gen = parseInt(roundNumber, 10);
  const _price = await contract._price();
  const price = parseInt(_price, 10);
  const _maxsupplyPerRound = await contract._maxsupplyPerRound();
  const maxSupply = parseInt(_maxsupplyPerRound, 10);

  return { props: { initalGameState, gen, price, maxSupply } };

}


export default function Play({ initalGameState, gen, price, maxSupply }) {

  const [loading, setLoading] = useState(true);
  const [_address, setAddress] = useState("");
  const { address } = useAccount();

  useEffect(() => {
    // check if the props have been loaded
    if (initalGameState && gen && price && maxSupply) {
      setLoading(false); // set loading to false when data is fetched
    }
  }, [initalGameState, gen, price, maxSupply]);

  useEffect(() => {
    if (address) {
      setAddress(address);
      console.log(_address + " address")
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      setAddress(address);
      console.log(_address + " address")
    }
  }, []);

  /* 
    ______  ________  ______  ________ ________      __    __  ______   ______  __    __  ______  
   /      \|        \/      \|        \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  |  ▓▓▓▓▓▓\\▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\\▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓___\▓▓  | ▓▓  | ▓▓__| ▓▓  | ▓▓  | ▓▓__        | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
   \▓▓    \   | ▓▓  | ▓▓    ▓▓  | ▓▓  | ▓▓  \       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
   _\▓▓▓▓▓▓\  | ▓▓  | ▓▓▓▓▓▓▓▓  | ▓▓  | ▓▓▓▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  |  \__| ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓_____     | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
   \▓▓    ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓  | ▓▓     \    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
    \▓▓▓▓▓▓    \▓▓   \▓▓   \▓▓   \▓▓   \▓▓▓▓▓▓▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                   
  */
  const [getGameState, setGetGameState] = useState(initalGameState);
  const [prevGameState, setPrevGameState] = useState(initalGameState);
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [passPromise, setPassPromise] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [activeTokens, setActiveTokens] = useState([]);
  const [explodedTokens, setExplodedTokens] = useState([]);
  const [explosion, setExplosion] = useState(false);
  const [isLoadingActiveTokens, setIsLoadingActiveTokens] = useState(true);
  const [_potatoTokenId, setPotatoTokenId] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [_roundMints, setRoundMints] = useState(0);
  const [passArgs, setPassArgs] = useState(null);
  const [mintArgs, setMintArgs] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(64);
  const [sortedTokens, setSortedTokens] = useState([]);
  const menuRef = useRef()
  const divRef = useRef(null);
  const endOfDiv = useRef(null);
  const [searchId, setSearchId] = useState('');
  const displayPrice = ethers.utils.formatEther(price.toString());


  // Pagination logic
  const indexOfLastToken = currentPage * itemsPerPage;
  const indexOfFirstToken = indexOfLastToken - itemsPerPage;
  const currentTokens = sortedTokens?.slice(indexOfFirstToken, indexOfLastToken);
  const pageCount = Math.ceil(sortedTokens.length / itemsPerPage);
  const maxPageNumbersToShow = 3;
  let startPage = Math.max(currentPage - Math.floor(maxPageNumbersToShow / 2), 1);
  let endPage = Math.min(startPage + maxPageNumbersToShow - 1, pageCount);
  if (endPage - startPage < maxPageNumbersToShow && startPage > 1) {
    startPage = endPage - maxPageNumbersToShow + 1;
  }
  const pages = [...Array((endPage + 1) - startPage).keys()].map(i => startPage + i);


  /*
   ________ __     __ ________ __    __ ________      __    __  ______   ______  __    __  ______  
  |        \  \   |  \        \  \  |  \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓▓▓▓▓▓▓ ▓▓   | ▓▓ ▓▓▓▓▓▓▓▓ ▓▓\ | ▓▓\▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓__   | ▓▓   | ▓▓ ▓▓__   | ▓▓▓\| ▓▓  | ▓▓       | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  \   \▓▓\ /  ▓▓ ▓▓  \  | ▓▓▓▓\ ▓▓  | ▓▓       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓▓▓▓    \▓▓\  ▓▓| ▓▓▓▓▓  | ▓▓\▓▓ ▓▓  | ▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓_____   \▓▓ ▓▓ | ▓▓_____| ▓▓ \▓▓▓▓  | ▓▓       | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓     \   \▓▓▓  | ▓▓     \ ▓▓  \▓▓▓  | ▓▓       | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓▓▓▓▓▓▓    \▓    \▓▓▓▓▓▓▓▓\▓▓   \▓▓   \▓▓        \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                           
  */
  /*                                                                           
    ▄▄█▀▀▀█▄█                                      ▄█▀▀▀█▄█ ██            ██           
  ▄██▀     ▀█                                     ▄██    ▀█ ██            ██           
  ██▀       ▀ ▄█▀██▄ ▀████████▄█████▄   ▄▄█▀██    ▀███▄   ██████ ▄█▀██▄ ██████  ▄▄█▀██ 
  ██         ██   ██   ██    ██    ██  ▄█▀   ██     ▀█████▄ ██  ██   ██   ██   ▄█▀   ██
  ██▄    ▀████▄█████   ██    ██    ██  ██▀▀▀▀▀▀   ▄     ▀██ ██   ▄█████   ██   ██▀▀▀▀▀▀
  ▀██▄     ████   ██   ██    ██    ██  ██▄    ▄   ██     ██ ██  ██   ██   ██   ██▄    ▄
    ▀▀███████▀████▀██▄████  ████  ████▄ ▀█████▀   █▀█████▀  ▀████████▀██▄ ▀████ ▀█████▀
  */

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'GameStarted',
    async listener(log) {
      if (_address) {
        await refetchGetActiveTokenCount({ args: [_address] });
      }
      await refetchGetRoundMints();
      await refetchGetActiveTokens();
      setRoundMints(() => 0);
      setGetGameState(() => "Minting");
      setPrevGameState(() => "Queued");
      setEvents(prevEvents => [...prevEvents, "Heating up"]);
    },
  });

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'MintingEnded',
    async listener(log) {
      await refetchPotatoTokenId();
      await refetchGetActiveTokens();
      setRemainingTime(explosionTime);
      setGetGameState(() => "Playing");
      setPrevGameState(() => "Minting");
      setEvents(prevEvents => [...prevEvents, "No more mints"]);
    },
  });

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'GameResumed',
    async listener(log) {
      const prevState = prevGameState
      setGetGameState(prevState);
      const gameState = getGameState;
      setPrevGameState(gameState);
      console.log(`getGameState: ${getGameState}`)
      console.log(`prevGameState: ${prevGameState}`)
      setEvents(prevEvents => [...prevEvents, "Back to it"]);
    },
  });

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'GamePaused',
    async listener(log) {
      const gameState = getGameState;
      setPrevGameState(gameState);
      const state = "Paused";
      setGetGameState(state);
      console.log(`getGameState: ${getGameState}`)
      console.log(`prevGameState: ${prevGameState}`)
      const message = "Cooling off";
      setEvents(prevEvents => [...prevEvents, message]);
    },
  });


  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'GameRestarted',
    async listener(log) {
      // await refetchGameState();
      await refetchRewards({ args: [_address] });
      setPrevGameState(prevState => prevState); // keep the previous state
      setGetGameState(() => "Queued"); // set new state to "Queued"
      const message = "Game Over";
      setRoundMints(() => 0);
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'FinalRoundStarted',
    async listener(log) {
      const message = "2 PLAYERS LEFT";
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })


  /*
               ▄▄                                                                           
  ▀███▀▀▀██▄ ▀███                                        ▄█▀▀▀█▄█ ██            ██          
    ██   ▀██▄  ██                                       ▄██    ▀█ ██            ██          
    ██   ▄██   ██  ▄█▀██▄ ▀██▀   ▀██▀ ▄▄█▀██▀███▄███    ▀███▄   ██████ ▄█▀██▄ ██████ ▄██▀███
    ███████    ██ ██   ██   ██   ▄█  ▄█▀   ██ ██▀ ▀▀      ▀█████▄ ██  ██   ██   ██   ██   ▀▀
    ██         ██  ▄█████    ██ ▄█   ██▀▀▀▀▀▀ ██        ▄     ▀██ ██   ▄█████   ██   ▀█████▄
    ██         ██ ██   ██     ███    ██▄    ▄ ██        ██     ██ ██  ██   ██   ██   █▄   ██
  ▄████▄     ▄████▄████▀██▄   ▄█      ▀█████▀████▄      █▀█████▀  ▀████████▀██▄ ▀██████████▀
                            ▄█                                                              
                          ██▀                                                               
  */

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'PlayerWon',
    async listener(log) {
      try {
        const player = log[0]?.args?.player;
        // await refetchGameState();
        await refetchHallOfFame({ args: [_currentGeneration] });
        setEvents(prevEvents => [...prevEvents, `${player} won! 🎉`]);
        if (player == _address) {
          toast.success("You won! 🎉 Don't forget to claim your rewards!");
          await refetchWinner();
          await refetchRewards({ args: [_address] });
          await refetchTotalWins({ args: [_address] });
        }

      } catch (error) {
        console.error('Error updating wins', error);
      }
    },
  });

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'SuccessfulPass',
    async listener(log) {
      try {
        console.log('SuccessfulPass', log);
        const player = log[0]?.args?.player;
        console.log('player', player);
        if (_address == player) {
          await refetchSuccessfulPasses({ args: [_address] });
          setPassPromise(true);
          if (passPromise) {
            passPromise.resolve();
          }
        } else {
          if (passPromise) {
            passPromise.reject(new Error('Passing failed'));
          }
        }
      } catch (error) {
        console.error('Error updating successful passes', error);
      }
    },
  });

  /*
                                                                       ▄▄                   
  ▀███▀▀▀██▄           ██            ██               ▀████▄     ▄███▀ ██              ██   
    ██   ▀██▄          ██            ██                 ████    ████                   ██   
    ██   ▄██  ▄██▀██▄██████ ▄█▀██▄ ██████  ▄██▀██▄      █ ██   ▄█ ██ ▀███ ▀████████▄ ██████ 
    ███████  ██▀   ▀██ ██  ██   ██   ██   ██▀   ▀██     █  ██  █▀ ██   ██   ██    ██   ██   
    ██       ██     ██ ██   ▄█████   ██   ██     ██     █  ██▄█▀  ██   ██   ██    ██   ██   
    ██       ██▄   ▄██ ██  ██   ██   ██   ██▄   ▄██     █  ▀██▀   ██   ██   ██    ██   ██   
  ▄████▄      ▀█████▀  ▀████████▀██▄ ▀████ ▀█████▀    ▄███▄ ▀▀  ▄████▄████▄████  ████▄ ▀████
  */
  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        const player = log[0].args.player.toString();
        const amount = parseInt(log[0].args.amount);
        console.log(`_address: ${_address} player: ${player} amount: ${amount}`)
        if (_address == player) {
          // activeTokensCount += amount;
          console.log('activeTokensCount', activeTokensCount);
          console.log('maount', amount);
        }
        await refetchGetActiveTokenCount?.({ args: [_address] });
        await refetchGetActiveTokenIds?.();
        await refetchGetRoundMints?.();
        setShouldRefresh(!shouldRefresh);
        setRoundMints(totalMints);
        setEvents(prevEvents => [...prevEvents, `${player} just minted ${amount} hands`]);

      } catch (error) {
        console.log(log);
        console.error('Error updating mints', error);
      }
    },
  });

  /*
                                                    ▄▄  
  ▀███▀▀▀██▄                                      ▀███  
    ██   ▀██▄                                       ██  
    ██   ▄██   ▄██▀██▄▀███  ▀███ ▀████████▄    ▄█▀▀███  
    ███████   ██▀   ▀██ ██    ██   ██    ██  ▄██    ██  
    ██  ██▄   ██     ██ ██    ██   ██    ██  ███    ██  
    ██   ▀██▄ ██▄   ▄██ ██    ██   ██    ██  ▀██    ██  
  ▄████▄ ▄███▄ ▀█████▀  ▀████▀███▄████  ████▄ ▀████▀███▄
  */
  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      try {
        const round = parseInt(log[0].args.round);

        await refetchGetActiveTokens();
        await refetchGetActiveTokenIds();
        setShouldRefresh(!shouldRefresh);
        await refetchCurrentGeneration();
      } catch (error) {
        console.error('Error updating mints', error);
      }// CACHE THIS DATA IN LOCAL STORAGE
    },
  });


  /*
               ▄▄                                   
  ███▀▀██▀▀███ ██                                   
  █▀   ██   ▀█                                      
       ██    ▀███ ▀████████▄█████▄   ▄▄█▀██▀███▄███ 
       ██      ██   ██    ██    ██  ▄█▀   ██ ██▀ ▀▀ 
       ██      ██   ██    ██    ██  ██▀▀▀▀▀▀ ██     
       ██      ██   ██    ██    ██  ██▄    ▄ ██     
     ▄████▄  ▄████▄████  ████  ████▄ ▀█████▀████▄   
  */

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'UpdatedTimer',
    listener(log) {
      const time = log[0].args.time.toString();
      setRemainingTime(time);
      setEvents(prevEvents => [...prevEvents, `${time} seconds till explosion`]);
    },
  });

  /*
                                   ▄▄                   ▄▄                      
  ▀███▀▀▀███                     ▀███                   ██                      
    ██    ▀█                       ██                                           
    ██   █  ▀██▀   ▀██▀████████▄   ██   ▄██▀██▄ ▄██▀██████   ▄██▀██▄▀████████▄  
    ██████    ▀██ ▄█▀   ██   ▀██   ██  ██▀   ▀████   ▀▀ ██  ██▀   ▀██ ██    ██  
    ██   █  ▄   ███     ██    ██   ██  ██     ██▀█████▄ ██  ██     ██ ██    ██  
    ██     ▄█ ▄█▀ ██▄   ██   ▄██   ██  ██▄   ▄███▄   ██ ██  ██▄   ▄██ ██    ██  
  ▄████████████▄   ▄██▄ ██████▀  ▄████▄ ▀█████▀ ██████▀████▄ ▀█████▀▄████  ████▄
                        ██                                                      
                      ▄████▄
  */
  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'PotatoExploded',
    async listener(log) {
      try {
        setExplosion(true);
        setTimeout(() => setExplosion(false), 3050);
        // await refetchGetActiveTokenCount({ args: [address] });
        const player = log[0].args.player.toString();
        if (_address == player) {
          // activeTokensCount = - 1;
        }
        console.log(`player to be exploded: ${log[0].args.player}`)
        await refetchActiveAddresses();
        console.log("REFETCHED ALL DATA");
        const tokenId_ = log[0].args.tokenId;
        setEvents(prevEvents => [...prevEvents, `Token #${tokenId_} just exploded`]);
      } catch (error) {
        console.log(error)
      }
    },
  });


  /*
                                   
  ▀███▀▀▀██▄                       
    ██   ▀██▄                      
    ██   ▄██ ▄█▀██▄  ▄██▀███▄██▀███
    ███████ ██   ██  ██   ▀▀██   ▀▀
    ██       ▄█████  ▀█████▄▀█████▄
    ██      ██   ██  █▄   ███▄   ██
  ▄████▄    ▀████▀██▄██████▀██████▀                           
  */

  useContractEvent({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    eventName: 'PotatoPassed',
    async listener(log) {
      try {
        await refetchUserHasPotatoToken({ args: [_address] });
        const tokenIdTo = log[0]?.args?.tokenIdTo?.toString();
        await refetchPotatoTokenId();
        console.log(`userHasPotatoToken: ${userHasPotatoToken}`);
        setEvents(prevEvents => [...prevEvents, `Potato Passed to #${tokenIdTo}`]);
        setShouldRefresh(!shouldRefresh);
      } catch (error) {
        console.log(error)
      }
    },
  });




  /*
   _______  ________  ______  _______       __    __  ______   ______  __    __  ______  
  |       \|        \/      \|       \     |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\ ▓▓▓▓▓▓▓\    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓ ▓▓__   | ▓▓__| ▓▓ ▓▓  | ▓▓    | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓    ▓▓ ▓▓  \  | ▓▓    ▓▓ ▓▓  | ▓▓    | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓  | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓    | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓_____| ▓▓  | ▓▓ ▓▓__/ ▓▓    | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓  | ▓▓ ▓▓     \ ▓▓  | ▓▓ ▓▓    ▓▓    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓      \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
  
  */



  // // GET MINT PRICE
  // const { data: getGameState, refetch: refetchGameState, isLoading: loadingGetGameState } = useContractRead({
  //   address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
  //   abi: ABI,
  //   functionName: 'getGameState',
  //   enabled: true,
  // })

  // // GET Explosion time
  const { data: getExplosionTime, isLoading: loadingExplosionTime, error: loadingError, refetch: refetchGetExplosionTime } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'getExplosionTime',
  })
  const explosionTime = parseInt(getExplosionTime, 10);


  // GET MINT PRICE
  const { data: _price, isLoading: loadingPrice, refetch: refetchPrice } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: '_price',
  })

  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getActiveTokenCount, isLoading: loadingActiveTokenCount, refetch: refetchGetActiveTokenCount } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'addressActiveTokenCount',
    args: [_address],
  })
  const activeTokensCount = parseInt(getActiveTokenCount, 10);

  // GET NUMBER OF MAX MINTS DURING THE ROUND
  // const { data: _maxsupply, isLoading: loadingMaxSupply, refetch: refetchMaxSupply } = useContractRead({
  //   address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
  //   abi: ABI,
  //   functionName: '_maxsupplyPerRound',
  // })
  // const maxSupply = parseInt(_maxsupply, 10);

  // GET TOKENS OWNED BY USER
  const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [_address],
  })
  const hasPotatoToken = userHasPotatoToken?.toString();

  // GET POTATO HOLDER
  const { data: getPotatoOwner, isLoading: loadingPotatoOwner, refetch: refetchGetPotatoOwner } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'getPotatoOwner',
  })
  const _potatoOwner = getPotatoOwner?.toString();

  // GET POTATO TOKEN ID
  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'potatoTokenId',
  })
  const _potato_token = parseInt(potatoTokenId, 10);


  // GET ACTIVE TOKENS
  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'getActiveTokens',
  })
  const _activeTokens = parseInt(getActiveTokens, 10);

  // GET CURRENT GENERATION
  const { data: currentGeneration, isLoading: loadingCurrentGeneration, refetch: refetchCurrentGeneration } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'currentGeneration',
  })
  const _currentGeneration = parseInt(currentGeneration, 10);

  const { data: getRoundMints, isLoading: loadingGetRoundMints, refetch: refetchGetRoundMints } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'roundMints',
  })
  const totalMints = parseInt(getRoundMints, 10);


  const { data: _owner, isLoading: loadingOwner, refetch: refetchowner } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: '_owner',
  })
  const _ownerAddress = _owner?.toString();

  const { data: getActiveTokenIds = [], isLoading: loadingActiveTokenIds, refetch: refetchGetActiveTokenIds } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'getActiveTokenIds',
  })

  const { data: allWinners, isLoading: loadingWinners, refetch: refetchWinner } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'getAllWinners',
  })
  const isWinner = allWinners?.includes(_address)

  const { data: rewards, isLoading: loadingRewards, refetch: refetchRewards } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'rewards',
    args: [_address],
  })
  const _rewards = parseInt(rewards, 10);

  const { data: _totalWins, isLoading: loadingTotalWins, refetch: refetchTotalWins } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'totalWins',
    args: [_address],
  })
  const totalWins = parseInt(_totalWins, 10);



  const { data: _successfulPasses, isLoading: loadingSuccessfulPasses, refetch: refetchSuccessfulPasses } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [_address],
  })
  const successfulPasses = parseInt(_successfulPasses, 10);

  const { data: hallOfFame, isLoading: loadingHGallOfFame, refetch: refetchHallOfFame } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'hallOfFame',
    args: [_currentGeneration],
  })
  const roundWinner = hallOfFame?.toString();

  const { data: _maxperwallet, isLoading: loadingMaxPerWallet, refetch: refetchMaxPerWallet } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: '_maxperwallet',
  })
  const maxPerWallet = parseInt(_maxperwallet, 10);

  const { data: isTokenActive, isLoading: loadingIsTokenActive, refetch: refetchIsTokenActive } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: '_isTokenActive',
    args: [tokenId],
  })

  const { data: _activeAddresses, isLoading: loadingActiveAddresses, refetch: refetchActiveAddresses } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'activeAddresses',
  })
  const activeAddresses = parseInt(_activeAddresses, 10);


  const { data: ownerOf, isLoading: loadingOwnerOf, refetch: refetchOwnerOf } = useContractRead({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  })

  const { data: userBalance, isError, isLoading } = useBalance({
    address: _address,
  })
  const balance = userBalance ? BigInt(userBalance.value) : 0;


  const { data: winnerEnsName, isError: errorWinnerEnsName, isLoading: loadingWinnerEnsName } = useEnsName({
    address: roundWinner,
  })


  /*
   __       __ _______  ______ ________ ________      __    __  ______   ______  __    __  ______  
  |  \  _  |  \       \|      \        \        \    |  \  |  \/      \ /      \|  \  /  \/      \ 
  | ▓▓ / \ | ▓▓ ▓▓▓▓▓▓▓\\▓▓▓▓▓▓\▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓/  ▓\| ▓▓ ▓▓__| ▓▓ | ▓▓    | ▓▓  | ▓▓__        | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  ▓▓▓\ ▓▓ ▓▓    ▓▓ | ▓▓    | ▓▓  | ▓▓  \       | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓ ▓▓\▓▓\▓▓ ▓▓▓▓▓▓▓\ | ▓▓    | ▓▓  | ▓▓▓▓▓       | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓▓▓  \▓▓▓▓ ▓▓  | ▓▓_| ▓▓_   | ▓▓  | ▓▓_____     | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
  | ▓▓▓    \▓▓▓ ▓▓  | ▓▓   ▓▓ \  | ▓▓  | ▓▓     \    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
   \▓▓      \▓▓\▓▓   \▓▓\▓▓▓▓▓▓   \▓▓   \▓▓▓▓▓▓▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
  
  */

  // MINT HAND
  const { config } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'mintHand',
    args: [mintAmount.toString()],
    //value: totalCost,
    enabled: getGameState === "Minting",
    onError(error) {
      console.log('Error', error)
    },
  })
  const { data: mintData, write: mint } = useContractWrite(config)



  const { config: configPass } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'passPotato',
    args: [tokenId],
    enabled: (getGameState === "Playing" || getGameState === "Final Stage") && userHasPotatoToken,
    onError(error) {
      console.log('Error', error)
    },
  });
  const { data: passData, isSuccess: Successful, write: pass, error: errorPassing } = useContractWrite(configPass)

  // CLAIM REWARDS
  const { config: withdrawWinnersFunds } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'withdrawWinnersFunds',
    enabled: _address === isWinner,
    onSuccess(data) {
      console.log('Success', data)
      refetchRewards({ args: [_address] });
    },
    onError(error) {
      console.log('Error', error)
    },
  })
  const { data: claimRewardsData, isSuccess: claimRewardsSuccessful, write: claimRewards } = useContractWrite(withdrawWinnersFunds)


  // CHECK EXPLOSION
  const { config: configCheck } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'checkExplosion',
    enabled: getGameState === "Playing" || getGameState === "Final Stage",
  })
  const { data: checkData, isSuccess: CheckSuccessful, write: check } = useContractWrite(configCheck)


  /*
      ______  __       __ __    __ ________ _______       __    __  ______   ______  __    __  ______  
   /      \|  \  _  |  \  \  |  \        \       \     |  \  |  \/      \ /      \|  \  /  \/      \ 
  |  ▓▓▓▓▓▓\ ▓▓ / \ | ▓▓ ▓▓\ | ▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\    | ▓▓  | ▓▓  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\ ▓▓ /  ▓▓  ▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓/  ▓\| ▓▓ ▓▓▓\| ▓▓ ▓▓__   | ▓▓__| ▓▓    | ▓▓__| ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓/  ▓▓| ▓▓___\▓▓
  | ▓▓  | ▓▓ ▓▓  ▓▓▓\ ▓▓ ▓▓▓▓\ ▓▓ ▓▓  \  | ▓▓    ▓▓    | ▓▓    ▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  ▓▓  \▓▓    \ 
  | ▓▓  | ▓▓ ▓▓ ▓▓\▓▓\▓▓ ▓▓\▓▓ ▓▓ ▓▓▓▓▓  | ▓▓▓▓▓▓▓\    | ▓▓▓▓▓▓▓▓ ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓▓▓▓\  _\▓▓▓▓▓▓\
  | ▓▓__/ ▓▓ ▓▓▓▓  \▓▓▓▓ ▓▓ \▓▓▓▓ ▓▓_____| ▓▓  | ▓▓    | ▓▓  | ▓▓ ▓▓__/ ▓▓ ▓▓__/ ▓▓ ▓▓ \▓▓\|  \__| ▓▓
   \▓▓    ▓▓ ▓▓▓    \▓▓▓ ▓▓  \▓▓▓ ▓▓     \ ▓▓  | ▓▓    | ▓▓  | ▓▓\▓▓    ▓▓\▓▓    ▓▓ ▓▓  \▓▓\\▓▓    ▓▓
    \▓▓▓▓▓▓ \▓▓      \▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓     \▓▓   \▓▓ \▓▓▓▓▓▓  \▓▓▓▓▓▓ \▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                                
  */
  // START GAME
  const { config: startGame } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'startGame',
    enabled: _address === '0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F' && getGameState === "Queued",
    onError(error) {
      console.log('Error', error)
    },
  })
  const { data: startGameData, isSuccess: started, write: _startGame } = useContractWrite(startGame)

  // END MINTING
  const { config: endMinting } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'endMinting',
    enabled: getGameState === "Minting" && _address === '0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F',
  })
  const { data: endMintingData, isSuccess: ended, write: _endMint } = useContractWrite(endMinting)

  // PAUSE GAME
  const { config: pauseGame } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'pauseGame',
    enabled: _address === '0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F' && (getGameState === "Minting" || getGameState === "Playing" || getGameState === "Final Stage"),
  })
  const { data: pauseGameData, isSuccess: pasued, write: _pauseGame } = useContractWrite(pauseGame)

  // RESUME GAME
  const { config: resumeGame } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'resumeGame',
    enabled: _address === '0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F' && getGameState === "Paused",
  })
  const { data: resumeGameData, isSuccess: resumed, write: _resumeGame } = useContractWrite(resumeGame)

  // RESTART GAME 
  const { config: restartGame } = usePrepareContractWrite({
    address: '0x64c913B1B5F17C5a908359F6ed17DA0c744FEa07',
    abi: ABI,
    functionName: 'restartGame',
    enabled: _address === '0x0529ed359EE75799Fd95b7BC8bDC8511AC1C0A0F' && (getGameState === "Paused" || getGameState === "Ended"),
  })
  const { data: restartGameData, isSuccess: restarted, write: _restartGame } = useContractWrite(restartGame)

  /*,
                                            
  ███▀▀██▀▀███                         ██   
  █▀   ██   ▀█                         ██   
       ██      ▄██▀██▄ ▄█▀██▄  ▄██▀████████ 
       ██     ██▀   ▀███   ██  ██   ▀▀ ██   
       ██     ██     ██▄█████  ▀█████▄ ██   
       ██     ██▄   ▄███   ██  █▄   ██ ██   
     ▄████▄    ▀█████▀▀████▀██▄██████▀ ▀████                                     
  */

  function noAddressToast() {
    toast.info("Please Connect to Interact")
  }

  function startToast() {
    toast.error("Must Restart Game to Start Again")
  }

  function endToast() {
    toast.error("Minting Already Ended")
  }

  function pauseToast() {
    toast.error("Game Already Paused")
  }

  function resumeToast() {
    toast.error("Game Already Resumed")
  }

  function restartToast() {
    toast.error("Game Already Restarted")
  }

  function onlyNumbersToast() {
    toast.info("Only Numbers Allowed")
  }

  function cannotPassToast() {
    toast.error("The Game Has not started yet")
  }

  function ownThePotatoToast() {
    toast.error("You have to own the Potato to pass it")
  }

  function noEnoughFundsToast() {
    toast.error("You do not have enough funds to mint")
  }

  function cannotPassToSelfToast() {
    toast.error("You cannot pass the Potato to yourself")
  }

  function gameFullToast() {
    toast.error("The Round is already Full")
  }

  function tokenInactiveToast() {
    toast.error("The token you tried to pass to is inactive")
  }

  function maxPerWalletToast() {
    toast.error(`You can only mint ${maxPerWallet} Hands per round`);
  }

  function mintOneToast() {
    toast.info("Mint at least 1 to play");
  }

  function hasMoreTimeToast() {
    toast.warn("There is still time left to pass the Potato");
  }

  function noRewardsToast() {
    toast.warn("You have no rewards to claim");
  }

  function invalidTokenIdToast() {
    toast.error("Inactive Token ID");
  }


  /* 
   __    __  ______  __    __ _______  __       ________ _______   ______  
  |  \  |  \/      \|  \  |  \       \|  \     |        \       \ /      \ 
  | ▓▓  | ▓▓  ▓▓▓▓▓▓\ ▓▓\ | ▓▓ ▓▓▓▓▓▓▓\ ▓▓     | ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓ ▓▓__| ▓▓ ▓▓▓\| ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓__   | ▓▓__| ▓▓ ▓▓___\▓▓
  | ▓▓    ▓▓ ▓▓    ▓▓ ▓▓▓▓\ ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓  \  | ▓▓    ▓▓\▓▓    \ 
  | ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓\▓▓ ▓▓ ▓▓  | ▓▓ ▓▓     | ▓▓▓▓▓  | ▓▓▓▓▓▓▓\_\▓▓▓▓▓▓\
  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓ \▓▓▓▓ ▓▓__/ ▓▓ ▓▓_____| ▓▓_____| ▓▓  | ▓▓  \__| ▓▓
  | ▓▓  | ▓▓ ▓▓  | ▓▓ ▓▓  \▓▓▓ ▓▓    ▓▓ ▓▓     \ ▓▓     \ ▓▓  | ▓▓\▓▓    ▓▓
   \▓▓   \▓▓\▓▓   \▓▓\▓▓   \▓▓\▓▓▓▓▓▓▓ \▓▓▓▓▓▓▓▓\▓▓▓▓▓▓▓▓\▓▓   \▓▓ \▓▓▓▓▓▓ 
                                                                                               
  */

  const refreshAllImages = () => {
    setShouldRefresh(prevState => !prevState);
  };

  const handleInputChangeToken = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      onlyNumbersToast();
    }
    else if (inputValue === "") {
      setTokenId("");
    }
    else if (inputValue !== "") {
      const _tokenId = parseInt(inputValue);
      setTokenId(_tokenId);
    }
  }

  const handleInputChangeMint = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      onlyNumbersToast();
    } else if (inputValue === "") {
      setMintAmount("");
      setTotalCost("0");
    } else if (inputValue !== "") {
      const newMintAmount = numericValue; // Keep newMintAmount as a string for UI
      setMintAmount(newMintAmount);
      const totalCostBigInt = BigInt(_price) * BigInt(newMintAmount);
      setTotalCost(totalCostBigInt.toString()); // Convert back to string for UI
    }
  }

  const handleTokenExploded = (tokenId) => {
    setExplodedTokens(prevTokens => [...prevTokens, tokenId]);
  }

  const sortTokensAsc = () => {
    const sorted = [...activeTokens].sort((a, b) => a - b);
    setSortedTokens(sorted);
  }

  const sortTokensDesc = () => {
    const sorted = [...activeTokens].sort((a, b) => b - a);
    setSortedTokens(sorted);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const tokenIdIndex = sortedTokens.indexOf(searchId);
    if (tokenIdIndex !== -1) {
      setCurrentPage(Math.floor(tokenIdIndex / itemsPerPage) + 1);
    } else {
      invalidTokenIdToast();
    }
  };


  /* 
   _______  ________ ________ _______  ________  ______  __    __ 
  |       \|        \        \       \|        \/      \|  \  |  \
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓\ ▓▓  | ▓▓
  | ▓▓__| ▓▓ ▓▓__   | ▓▓__   | ▓▓__| ▓▓ ▓▓__   | ▓▓___\▓▓ ▓▓__| ▓▓
  | ▓▓    ▓▓ ▓▓  \  | ▓▓  \  | ▓▓    ▓▓ ▓▓  \   \▓▓    \| ▓▓    ▓▓
  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓  | ▓▓▓▓▓  | ▓▓▓▓▓▓▓\ ▓▓▓▓▓   _\▓▓▓▓▓▓\ ▓▓▓▓▓▓▓▓
  | ▓▓  | ▓▓ ▓▓_____| ▓▓     | ▓▓  | ▓▓ ▓▓_____|  \__| ▓▓ ▓▓  | ▓▓
  | ▓▓  | ▓▓ ▓▓     \ ▓▓     | ▓▓  | ▓▓ ▓▓     \\▓▓    ▓▓ ▓▓  | ▓▓
   \▓▓   \▓▓\▓▓▓▓▓▓▓▓\▓▓      \▓▓   \▓▓\▓▓▓▓▓▓▓▓ \▓▓▓▓▓▓ \▓▓   \▓▓
                                                                 
  */

  //On Mount
  useEffect(() => {
    const fetchData = async () => {
      await refetchPotatoTokenId?.();
      setPotatoTokenId(_potato_token);
      await refetchUserHasPotatoToken({ args: [_address] });
      await refetchSuccessfulPasses({ args: [_address] });
    }
    fetchData();
    // refetchGetExplosionTime();
    setRemainingTime(explosionTime);
    refetchGetRoundMints();
    refetchGetActiveTokens();
    refetchTotalWins({ args: [_address] });
    refetchCurrentGeneration();
    refetchActiveAddresses();
    if (_address == _ownerAddress) {
      refetchowner();
    }
    const roundMints = parseInt(getRoundMints, 10);
    if (!isNaN(roundMints)) {
      setRoundMints(roundMints);
    }
  }, []);


  useEffect(() => {
    const activeIds = getActiveTokenIds.slice(1).map((tokenId, index) => tokenId?.toString());
    setActiveTokens(activeIds);
    setIsLoadingActiveTokens(false);
  }, [getActiveTokenIds]);

  useEffect(() => {
    setSortedTokens(activeTokens);
  }, [activeTokens]);


  useEffect(() => {
    if (roundWinner === undefined) {
      refetchHallOfFame({ args: [_currentGeneration] });
    }
    if (roundWinner === null) {
      refetchHallOfFame({ args: [_currentGeneration] });
    }
  }, [roundWinner, refetchHallOfFame]);

  useEffect(() => {
    refetchUserHasPotatoToken({ args: [_address] });
    refetchSuccessfulPasses({ args: [_address] });
    refetchTotalWins({ args: [_address] });
    refetchRewards({ args: [_address] });
  }, [_address]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     localStorage.clear();
  //   }, 1000 * 60 * 30);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (getGameState === "Minting") {
        refetchGetRoundMints();
      }
    }, 3000);

    // Cleanup function to clear the interval when component unmounts or re-renders
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("An UNKNOWN X BEDTIME PRODUCTION")
  }, [], 5000);

  // useEffect(() => {
  //   try {
  //     if (refetchGetExplosionTime) {
  //       refetchGetExplosionTime();
  //       setRemainingTime(explosionTime);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching explosion time:", error);
  //   }
  // }, [getExplosionTime]);


  useEffect(() => {
    let timer;
    if (remainingTime && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 0) {
            const newTime = prevTime - 1;
            return newTime;
          } else {
            clearInterval(timer);
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [remainingTime]);

  useEffect(() => {
    if (endOfDiv.current) {
      endOfDiv.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, [events]);
  /*
   __    __ ________ __       __ __             ______   ______   ______  
  |  \  |  \        \  \     /  \  \           /      \ /      \ /      \ 
  | ▓▓  | ▓▓\▓▓▓▓▓▓▓▓ ▓▓\   /  ▓▓ ▓▓          |  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\  ▓▓▓▓▓▓\
  | ▓▓__| ▓▓  | ▓▓  | ▓▓▓\ /  ▓▓▓ ▓▓          | ▓▓   \▓▓ ▓▓___\▓▓ ▓▓___\▓▓
  | ▓▓    ▓▓  | ▓▓  | ▓▓▓▓\  ▓▓▓▓ ▓▓          | ▓▓      \▓▓    \ \▓▓    \ 
  | ▓▓▓▓▓▓▓▓  | ▓▓  | ▓▓\▓▓ ▓▓ ▓▓ ▓▓          | ▓▓   __ _\▓▓▓▓▓▓\_\▓▓▓▓▓▓\
  | ▓▓  | ▓▓  | ▓▓  | ▓▓ \▓▓▓| ▓▓ ▓▓_____     | ▓▓__/  \  \__| ▓▓  \__| ▓▓
  | ▓▓  | ▓▓  | ▓▓  | ▓▓  \▓ | ▓▓ ▓▓     \     \▓▓    ▓▓\▓▓    ▓▓\▓▓    ▓▓
   \▓▓   \▓▓   \▓▓   \▓▓      \▓▓\▓▓▓▓▓▓▓▓      \▓▓▓▓▓▓  \▓▓▓▓▓▓  \▓▓▓▓▓▓ 
                                                                     
  */

  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>; // replace this with your loading component
  }



  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='normal bg-fixed text-white min-h-screen font-darumadrop'>
        <nav className="pt-10 px-5 md:px-10 flex justify-between items-center relative">
          <Link href='/'>
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
          <div className="xl:hidden 2xl:hidden 3xl:hidden z-50">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-white hover:border-white">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v15z" /></svg>
            </button>
            <div className={`fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 ${isOpen ? '' : 'hidden'}`}
              onClick={(e) => {
                if (!menuRef.current.contains(e.target)) {
                  setIsOpen(false)
                }
              }}>
              <ul ref={menuRef} className={`${darkMode ? 'bg-gray-700 text-white items-center p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl' : 'items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black'}`}>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/play">Play</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://twitter.com/ocHotPotato" target='_blank'>Twitter</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://discord.gg/BSqK5CvDmT" target="_blank">Discord</Link></li>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden lg:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://twitter.com/ocHotPotato" target='_blank'>Twitter</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://0xhotpotato.gitbook.io/onchain-hot-potato/" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://discord.gg/BSqK5CvDmT" target="_blank">Discord</Link></li>
          </ul>
          <div className='flex gap-2 items-center sm:hidden lg:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>
        <div className='flex flex-col items-center justify-center'>
          <Image className='' src={potatoBlink} width={300} alt='coming soon' />
          <h1 className='text-6xl sm:text-4xl text-white'>Coming Soon...</h1>
        </div>
      </div>
    </>
  )
}