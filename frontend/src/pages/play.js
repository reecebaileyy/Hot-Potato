import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useState, useRef, useEffect, useCallback } from 'react'
import { Web3Button } from '@web3modal/react'
import ABI from '../abi/UNKNOWN.json'
import { useAccount, useBalance, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent, useEnsName } from 'wagmi'
import potato from '../../public/assets/images/potato.png'
import hot from '../../public/assets/images/hot.png'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'
import Explosion from '../../public/assets/images/Explosion.gif'
import Burning from '../../public/assets/images/Burning.gif'
import blacklogo from '../../public/assets/images/Logo.png'
import TokenImage from '../../components/TokenImage'
import ActiveTokensImages from '../../components/ActiveTokensImages'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

export default function Play() {

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
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const argsArray = [1, 2, 3, 4, 5];
  const [mintPromise, setMintPromise] = useState(null);
  const [passPromise, setPassPromise] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [activeTokens, setActiveTokens] = useState([]);
  const [explodedTokens, setExplodedTokens] = useState([]);
  const [explosion, setExplosion] = useState(false);
  const [isLoadingActiveTokens, setIsLoadingActiveTokens] = useState(true);
  const [_potatoTokenId, setPotatoTokenId] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null);
  const [_getGameState, setGetGameState] = useState("Loading...");
  const [_roundMints, setRoundMints] = useState(0);
  const menuRef = useRef()
  const divRef = useRef(null);



  // STORING USERS ADDRESS
  const { address } = useAccount()
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'GameStarted',
    listener(log) {
      setRoundMints(0);
      refetchGameState();
      refetchMaxSupply();
      refetchGetRoundMints();
      refetchPrice();
      refetchGetActiveTokenCount();
      refetchCurrentGeneration();
      refetchRewards();
      const message = "Heating up";
      setGetGameState("Minting");
      setEvents(prevEvents => [...prevEvents, message]);

    },
  })

  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'MintingEnded',
    async listener(log) {
      const message = "No more mints";
      setGetGameState("Playing");
      await refetchPotatoTokenId();
      await refetchGameState();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'GameResumed',
    async listener(log) {
      const message = "Back to it";
      await refetchGameState();
      await refetchPotatoTokenId();
      await refetchRewards();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })


  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'GamePaused',
    listener(log) {
      console.log(log);
      const message = "Cooling off";
      setGetGameState("Paused");
      refetchGameState();
      refetchRewards();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'GameRestarted',
    async listener(log) {
      const message = "Game Over";
      setGetGameState("Queued");
      await refetchGameState();
      setRoundMints(0);
      await refetchRewards();
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'FinalRoundStarted',
    async listener(log) {
      const message = "HOT HANDZ";
      await refetchPotatoTokenId();
      await setGetGameState("Final Stage");
      await refetchGameState();
      await refetchRewards();
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'PlayerWon',
    async listener(log) {
      try {
        const player = log[0]?.args?.player?.toString();
        refetchGameState();
        refetchHallOfFame();
        refetchWinner();
        refetchRewards();
        setEvents(prevEvents => [...prevEvents, `+1: ${player}`]);
        // Send a POST request to the API route to update the database
        const response = await fetch('/api/update-wins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: address }),
        });

        // Send a POST request to the API route to update the database for the gamestate
        setGetGameState("Ended");

        // If the passing player is the connected address, fetch the latest data for this address
        if (player == address) {
          refetchTotalWins();
          toast.success("You won! 🎉 Don't forget to claim your rewards!");
        }

      } catch (error) {
        console.error('Error updating wins', error);
      }
    },
  });

  useContractEvent({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'SuccessfulPass',
    async listener(log) {
      try {
        const player = log[0].args.player.toString();
        refetchPotatoTokenId();
        setEvents(prevEvents => [...prevEvents, `+1: ${player}`]);

        if (address == player) {
          toast.success("Pass Successful!");
          await refetchSuccessfulPasses();
          setPassPromise(true);
          if (passPromise) {
            passPromise.resolve();
          }
        } else {
          if (passPromise) {
            passPromise.reject(new Error('Passing failed'));
          }
        }

        // Send a POST request to the API route to update the database
        await fetch('/api/update-passes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: address }),
        });

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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'PotatoMinted',
    async listener(log) {
      try {
        await refetchGetActiveTokenIds();
        setShouldRefresh(!shouldRefresh);
        const amount = parseInt(log[0].args.amount);
        setRoundMints(prevRoundMints => prevRoundMints + amount);
        await refetchGetRoundMints();
        const player = log[0].args.player.toString();
        const amountDisplay = String(log[0].args.amount); //Need this one
        setEvents(prevEvents => [...prevEvents, `+${amountDisplay}: ${player}`]);
        if (address == player) {
          // Resolve our promise
          refetchGetActiveTokenCount();
        }
        const data = await response.json();

      } catch (error) {
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'NewRound',
    async listener(log) {
      try {
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'UpdatedTimer',
    async listener(log) {
      try {
        const time = log[0].args.time.toString();
        await refetchGetExplosionTime();
        setRemainingTime(explosionTime);
        setEvents(prevEvents => [...prevEvents, `+${time}`]);
      } catch (error) {
        console.error('Error updating timer', error);
      }
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'PotatoExploded',
    async listener(log) {
      try {
        setExplosion(true);
        setTimeout(() => setExplosion(false), 3050);
        if (typeof log[0]?.args?.tokenId === 'bigint') {
          const tokenId_ = log[0].args.tokenId.toString();
          await refetchGetExplosionTime();
          setRemainingTime(explosionTime);
          await refetchGetActiveTokens();
          await refetchPotatoTokenId();
          await refetchGetActiveTokenCount();
          await refetchUserHasPotatoToken();
          await refetchActiveAddresses();
          setEvents(prevEvents => [...prevEvents, `Potato Exploded: ${tokenId_}`]);
        } else {
          console.error('TokenId is not a BigInt or is not found in log args', log);
        }
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    eventName: 'PotatoPassed',
    async listener(log) {
      try {
        if (typeof log[0]?.args?.tokenIdFrom === 'bigint' && typeof log[0]?.args?.tokenIdTo === 'bigint') {
          const tokenIdFrom = log[0]?.args?.tokenIdFrom?.toString();
          const tokenIdTo = log[0]?.args?.tokenIdTo?.toString();
          const yielder = log[0]?.args?.yielder?.toString();
          setPotatoTokenId(tokenIdTo);
          await refetchUserHasPotatoToken();
          setEvents(prevEvents => [...prevEvents, `Potato Passed from: ${tokenIdFrom} to: ${tokenIdTo} ${yielder} now has the potato`]);
        } else {
          console.error('tokenIdFrom or tokenIdTo is not a BigInt or is not found in log args', log);
        }
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



  // GET MINT PRICE
  const { data: getGameState, refetch: refetchGameState, isLoading: loadingGetGameState } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getGameState',
    enabled: true,
  })

  // GET MINT PRICE
  const { data: getExplosionTime, isLoading: loadingExplosionTime, error: loadingError, refetch: refetchGetExplosionTime } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getExplosionTime',
    enabled: true,
  })
  const explosionTime = parseInt(getExplosionTime, 10);


  // GET MINT PRICE
  const { data: _price, isLoading: loadingPrice, refetch: refetchPrice } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: '_price',
    enabled: false,
  })
  const price = parseInt(_price, 10) / 10 ** 18;

  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getActiveTokenCount, isLoading: loadingActiveTokenCount, refetch: refetchGetActiveTokenCount } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getActiveTokenCount',
    args: [address],
    enabled: true,
  })
  const activeTokensCount = parseInt(getActiveTokenCount, 10);

  // GET NUMBER OF MAX MINTS DURING THE ROUND
  const { data: _maxsupply, isLoading: loadingMaxSupply, refetch: refetchMaxSupply } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: '_maxsupplyPerRound',
    enabled: false,
  })
  const maxSupply = parseInt(_maxsupply, 10);

  // GET TOKENS OWNED BY USER
  const { data: userHasPotatoToken, isLoading: loadingHasPotato, refetch: refetchUserHasPotatoToken } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [address],
    enabled: false,
  })
  const hasPotatoToken = userHasPotatoToken?.toString();

  // GET POTATO HOLDER
  const { data: getPotatoOwner, isLoading: loadingPotatoOwner, refetch: refetchGetPotatoOwner } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getPotatoOwner',
    enabled: false,
  })
  const _potatoOwner = getPotatoOwner?.toString();

  // GET POTATO TOKEN ID
  const { data: potatoTokenId, isLoading: loadingPotatoTokenId, refetch: refetchPotatoTokenId } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'potatoTokenId',
    enabled: false,
  })

  const _potato_token = parseInt(potatoTokenId, 10)

  // GET ACTIVE TOKENS
  const { data: getActiveTokens, isLoading: loadingActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getActiveTokens',
    enabled: false,
  })
  const _activeTokens = parseInt(getActiveTokens, 10);

  // GET CURRENT GENERATION
  const { data: currentGeneration, isLoading: loadingCurrentGeneration, refetch: refetchCurrentGeneration } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'currentGeneration',
    enabled: false,
  })
  const _currentGeneration = parseInt(currentGeneration, 10);

  const { data: getRoundMints, isLoading: loadingGetRoundMints, refetch: refetchGetRoundMints } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'roundMints',
    enabled: false,
  })
  const totalMints = parseInt(getRoundMints, 10);


  // GET IMAGES

  const { data: balanceOf, isLoading: loadingBalance, refetch: refetchBalanceOf } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: false,
  })
  const _balanceOf = parseInt(balanceOf, 10);

  const { data: _owner, isLoading: loadingOwner, refetch: refetchowner } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: '_owner',
    enabled: true,
  })
  const _ownerAddress = _owner?.toString();

  const { data: getActiveTokenIds = [], isLoading: loadingActiveTokenIds, refetch: refetchGetActiveTokenIds } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getActiveTokenIds',
    enabled: true,
  })

  const { data: allWinners, isLoading: loadingWinners, refetch: refetchWinner } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getAllWinners',
    enabled: false,
  })
  const isWinner = allWinners?.includes(address)

  const { data: rewards, isLoading: loadingRewards, refetch: refetchRewards } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'rewards',
    args: [address],
    enabled: false,
  })
  const _rewards = parseInt(rewards, 10);

  const { data: _totalWins, isLoading: loadingTotalWins, refetch: refetchTotalWins } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'totalWins',
    args: [address],
    enabled: true,
  })
  const totalWins = parseInt(_totalWins, 10);

  const { data: getImageString, isLoading: loadingGetImageString, refetch: refetchImageString } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'getImageString',
    args: [tokenId],
    enabled: false
  });


  const { data: _successfulPasses, isLoading: loadingSuccessfulPasses, refetch: refetchSuccessfulPasses } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [address],
    enabled: true,
  })
  const successfulPasses = parseInt(_successfulPasses, 10);

  const { data: hallOfFame, isLoading: loadingHGallOfFame, refetch: refetchHallOfFame } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'hallOfFame',
    args: [_currentGeneration],
    enabled: false,
  })
  const roundWinner = hallOfFame?.toString();

  const { data: _maxperwallet, isLoading: loadingMaxPerWallet, refetch: refetchMaxPerWallet } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: '_maxperwallet',
  })
  const maxPerWallet = parseInt(_maxperwallet, 10);

  const { data: isTokenActive, isLoading: loadingIsTokenActive, refetch: refetchIsTokenActive } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: '_isTokenActive',
    args: [tokenId],
    enabled: true,
  })

  const { data: _activeAddresses, isLoading: loadingActiveAddresses, refetch: refetchActiveAddresses } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'activeAddresses',
    enabled: true,
  })
  const activeAddresses = parseInt(_activeAddresses, 10);


  const { data: ownerOf, isLoading: loadingOwnerOf, refetch: refetchOwnerOf } = useContractRead({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'ownerOf',
    args: [tokenId],
    enabled: false,
  })

  const { data: userBalance, isError, isLoading } = useBalance({
    address: address,
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'mintHand',
    args: [mintAmount.toString()],
    value: totalCost,
    enabled: getGameState == "Minting",
    staleTime: Infinity
  })
  const { data: mintData, write: mint } = useContractWrite(config)



  // PASS POTATO
  const { config: configPass } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'passPotato',
    args: [tokenId],
    enabled: address == getPotatoOwner,
    staleTime: Infinity
  })
  const { data: passData, isSuccess: Successful, write: pass, error: errorPassing } = useContractWrite(configPass)

  // CLAIM REWARDS
  const { config: withdrawWinnersFunds } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'withdrawWinnersFunds',
    enabled: _rewards !== 0,
    staleTime: Infinity
  })
  const { data: claimRewardsData, isSuccess: claimRewardsSuccessful, write: claimRewards } = useContractWrite(withdrawWinnersFunds)


  // CHECK EXPLOSION
  const { config: configCheck } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'checkExplosion',
    enabled: explosionTime == 0 || explosionTime == null,
    staleTime: Infinity
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
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'startGame',
    enabled: getGameState == "Queued",
    staleTime: Infinity
  })
  const { data: startGameData, isSuccess: started, write: _startGame } = useContractWrite(startGame)

  // END MINTING
  const { config: endMinting } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'endMinting',
    enabled: getGameState == "Minting",
    staleTime: Infinity
  })
  const { data: endMintingData, isSuccess: ended, write: _endMint } = useContractWrite(endMinting)

  // PAUSE GAME
  const { config: pauseGame } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'pauseGame',
    enabled: getGameState == "Minting" || getGameState == "Ended" || getGameState == "Playing" || getGameState == "Final Stage",
    staleTime: Infinity
  })
  const { data: pauseGameData, isSuccess: pasued, write: _pauseGame } = useContractWrite(pauseGame)

  // RESUME GAME
  const { config: resumeGame } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'resumeGame',
    enabled: getGameState == "Paused",
    staleTime: Infinity
  })
  const { data: resumeGameData, isSuccess: resumed, write: _resumeGame } = useContractWrite(resumeGame)

  // RESTART GAME 
  const { config: restartGame } = usePrepareContractWrite({
    address: '0xfCC1796054b53124f380c56e48351b1B8Ee1Af81',
    abi: ABI,
    functionName: 'restartGame',
    enabled: getGameState == "Ended" || getGameState == "Paused",
    staleTime: Infinity
  })
  const { data: restartGameData, isSuccess: restarted, write: _restartGame } = useContractWrite(restartGame)

  /*
                                            
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
    toast.error(`You can only mint ${maxPerWallet} Potato per round`);
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

  const handleStartGame = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Queued") {
      startToast();
    } else {
      _startGame?.();
    }
  }

  const handleEndMinting = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Minting") {
      endToast();
    } else {
      _endMint?.();
    }
  }

  const handlePauseGame = () => {
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Playing" && getGameState !== "Final Stage" && getGameState !== "Minting") {
      pauseToast();
    } else {
      _pauseGame?.();
    }
  }

  const handleResumeGame = () => {
    if (!address) {
      resumeToast()
    } else if (getGameState !== "Paused") {
      resumeToast()
    } else {
      _resumeGame?.();
    }
  }

  const handleRestartGame = () => {
    try {
      if (!address) {
        noAddressToast();
      } else if (getGameState !== "Ended" && getGameState !== "Paused" && getGameState !== "Queued") {
        restartToast();
      } else {
        _restartGame?.();
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClaimReward = () => {
    if (!address) {
      noAddressToast();
    } else if (_rewards == 0) {
      noRewardsToast();
    }
    else {
      claimRewards?.();
      refetchRewards();
    }
  }

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

  const handlePass = async () => {
    refetchGetPotatoOwner();
    if (!address) {
      noAddressToast();
    } else if (getGameState !== "Playing" && getGameState !== "Final Stage") {
      cannotPassToast();
    } else if (!userHasPotatoToken) {
      ownThePotatoToast();
    } else if (!isTokenActive) {
      tokenInactiveToast();
    } else if (address == ownerOf) {
      cannotPassToSelfToast();
    } else {
      console.log("passing")
      console.log("passing from", address)
      console.log("Potato Owner is ", getPotatoOwner)
      pass?.();
    }
  };
  const handleMint = () => {
    if (!address) {
      noAddressToast();
    } else if (balance < totalCost) {
      noEnoughFundsToast();
    } else if (mintAmount > (maxSupply - _roundMints)) {
      gameFullToast();
    } else if (mintAmount === 0) {
      mintOneToast();
    } else if (activeTokensCount + parseInt(mintAmount) > maxPerWallet) {
      maxPerWalletToast();
    } else {
      mint?.();
    }
  };

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

  const handlecheck = () => {
    refetchGetExplosionTime();
    if (!address) {
      noAddressToast();
    } else {
      check?.();
    }
  };

  const handleTokenExploded = (tokenId) => {
    setExplodedTokens(prevTokens => [...prevTokens, tokenId]);
  }



  function fetchGameStateAndMore() {
    // Fetch the game state
    fetch('/api/get-game-state')
      .then(response => response.json())
      .then(data => {
        setGetGameState(data.current);
      })
      .catch(error => console.error(error));
  }




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
  // EVENT LISTENERS

  // DARK MODE
  useEffect(() => {
    const localDarkMode = window.localStorage.getItem('darkMode');
    if (localDarkMode) {
      setDarkMode(JSON.parse(localDarkMode));
    }

    const intervalId = setInterval(() => {
      const divElement = divRef.current;
      divElement.scrollLeft = divElement.scrollWidth;
      console.log("An UNKNOWNXBEDTIME PRODUCTION");
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, [events]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      window.localStorage.setItem('darkMode', darkMode);
    }
  }, [darkMode]);

  //On Mount
  useEffect(() => {
    refetchPotatoTokenId();
    refetchGameState();
    refetchGetActiveTokenCount();
    refetchGetExplosionTime();
    refetchGetRoundMints();
    refetchGetActiveTokens();
    refetchUserHasPotatoToken();
    refetchHallOfFame();
    refetchTotalWins();
    refetchCurrentGeneration();
    refetchSuccessfulPasses();
    refetchImageString();
    refetchMaxSupply();
    refetchPrice();
    refetchActiveAddresses();
    refetchWinner();
    if (explosionTime !== null) {
      setRemainingTime(explosionTime);
    }
    if (address == _ownerAddress) {
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
    if (roundWinner === undefined) {
      refetchHallOfFame();
    }
    if (roundWinner === null) {
      refetchHallOfFame();
    }
  }, [roundWinner, refetchHallOfFame]);

  useEffect(() => {
    refetchGetActiveTokenCount();
    refetchUserHasPotatoToken();
    refetchSuccessfulPasses();
    refetchTotalWins();
  }, [address]);

  useEffect(() => {
    const interval = setInterval(() => {
        localStorage.clear();
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
}, []);



  //GAME STATE
  useEffect(() => {

    if (!isNaN(_potatoTokenId)) {
      const localPotatoTokenId = localStorage.getItem('_potatoTokenId');
      if (!localPotatoTokenId) {
        const getPotatoTokenId = parseInt(potatoTokenId, 10);
        setPotatoTokenId(getPotatoTokenId);
      } else {
        setPotatoTokenId(localPotatoTokenId);
      }
    }

  }, [_potatoTokenId, potatoTokenId]);

  useEffect(() => {
    const fetchExplosionTime = async () => {
      try {
        await refetchGetExplosionTime();
        const explosionTime = parseInt(getExplosionTime, 10);
        setRemainingTime(explosionTime);
      } catch (error) {
        console.error("Error fetching explosion time:", error);
      }
    };
    if (getExplosionTime) {
      fetchExplosionTime();
    }
  }, [getExplosionTime]);


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



  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hold, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className={`${darkMode ? 'darkmode text-white min-h-screen font-darumadrop' : 'normal min-h-screen font-darumadrop'}`}>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={
            darkMode ? 'dark' : 'light'
          }
        />
        <nav className="pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
          <Link href='/'>
            <Image src={blacklogo} width={150} alt="Logo" />
          </Link>
          <div className="lg:hidden xl:hidden 2xl:hidden 3xl:hidden">
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
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="/leaderboard">Leaderboard</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
                <li><Link className={`${darkMode ? 'text-white hover:text-black justify-center' : 'text-black hover:text-gray-700 justify-center'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  size={30}
                />
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/play">Play</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="/leaderboard">Leaderboard</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://app.gitbook.com" target="_blank">Docs</Link></li>
            <li><Link className={`${darkMode ? 'text-white hover:text-red-500' : 'text-black hover:text-gray-700'}`} href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='flex gap-2 items-center sm:hidden md:hidden'>
            <DarkModeSwitch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              size={30}
            />
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <h1 className={`${darkMode ? 'text-4xl justify-center items-center md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center' : "text-4xl justify-center items-center md:w-2/3 lg:w-1/2 col-start-2 col-span-6 w-full text-center"}`}>
          Round {_currentGeneration == 0 ? "1" : _currentGeneration}
        </h1>

        <div className="p-4 sm:flex sm:flex-col md:flex md:flex-col grid grid-cols-8 gap-4 justify-center items-center">
          {!getGameState && (
            <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/5  hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={fetchGameStateAndMore}>Refresh Data</button>
          )}
          <div className={`w-full flex flex-col justify-center items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 shadow rounded-xl p-4 mb-8 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {!address ?
              <>
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Connect First</h1>
                  <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Connect your wallet to view this page! Hope you join the fun soon...</h3>
                  <Image alt='Image' src={hot} width={200} height={200} />
                  {isWinner && _rewards != 0 &&
                    <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                  }
                </>
              </> :
              getGameState == "Playing" || getGameState == "Final Stage" ?
                <>
                  <h2 className={`text-xl font-bold underline mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>My Heat Handlers:</h2>
                  <ActiveTokensImages ownerAddress={address} ABI={ABI} tokenId={tokenId} />
                  {isWinner && _rewards != 0 &&
                    <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                  }
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={hot} width={200} height={200} className='self-center' />
                    {isWinner && _rewards != 0 &&
                      <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Paused" ?
                    <>
                      <Image alt='Image' src={hot} width={200} height={200} />
                      {isWinner && _rewards != 0 &&
                        <button className={`${darkMode ? 'w-1/5 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                      }
                    </>
                    : getGameState == "Minting" ?
                      <>
                        <h1 className={`text-3xl text-center font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Welcome to the Backburner!</h1>
                        <Image alt='Image' src={potatoBlink} width={200} height={200} />
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Ready up because this is about to get heated...</p>
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>mint now or cry later?</p>
                        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Got Heat?</p>
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={Burning} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>

                        }
                      </>
            }
          </div>

          <div className={`w-full flex flex-col justify-center items-center col-start-3 col-span-4 md:w-2/3 lg:w-1/2 shadow-lg rounded-xl p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
            {getGameState == "Playing" || getGameState == "Final Stage" ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>
                  {loadingPotatoTokenId ? "Loading..." : `Token #${_potato_token} has the potato`}
                </h1>
                {loadingHasPotato ? (
                  <h2 className="text-center font-bold mb-2">Loading Has Potato...</h2>
                ) : (
                  <h2 className={`text-3xl sm:text-xl md:text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {userHasPotatoToken ? <p className='animate-crazy'>YOU HAVE THE POTATO</p> : "YOU DON'T HAVE THE POTATO"}
                  </h2>
                )}
                {explosion ?
                  <Image alt='Explosion' src={Explosion} width={200} height={200} /> :
                  <Image alt='Image' src={potatoBlink} width={200} height={200} />
                }
                {loadingExplosionTime ? <p className='text-2xl'>Loading...</p> : <p className='text-2xl'>TIME REMAINING: {isNaN(remainingTime) || remainingTime === 0 ? "0" : remainingTime}</p>}
                <button className={`mt-4 w-1/2 mb-2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500'} text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                  onClick={handlecheck}>
                  CHECK EXPLOSION
                </button>
                <div className='sm:hidden md:hidden flex flex-col-2 gap-6'>
                  {loadingActiveAddresses ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{activeAddresses} Players Remaining</p>)
                  }{loadingActiveTokens ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Hands Remaining</p>)
                  }
                </div>
                <div className='lg:hidden xl:hidden 2xl:hidden 3xl:hidden'>
                  {loadingActiveAddresses ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{activeAddresses} Players Remaining</p>)
                  }{loadingActiveTokens ? (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                  ) : (
                    <p className={`text-xl text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Hands Remaining</p>)
                  }
                </div>

                <Link href="https://mumbai.polygonscan.com/address/0xfCC1796054b53124f380c56e48351b1B8Ee1Af81" target='_blank' className="underline">
                  Smart Contract
                </Link>
              </>
              : getGameState == "Queued" ? (
                <>
                  <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game starting soon</h1>
                  <h3 className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently Queued, Come back soon for some sizzlin fun!</h3>
                  <Image alt='Image' src={potatoBlink} width={200} height={200} />
                  <div className='grid grid-cols-3 justify-center gap-4'>
                    <Link href="https://discord.com/" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>
                      Discord
                    </Link>
                    <Link href="https://mumbai.polygonscan.com/address/0xfCC1796054b53124f380c56e48351b1B8Ee1Af81" target='_blank' className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`}>Smart Contract</Link>
                    <Link className={`text-lg text-center underline ${darkMode ? 'text-white' : 'text-black'}`} target='_blank' href="https://Twitter.com/0xHotPotato_">Twitter</Link>
                  </div>
                </>
              ) :
                getGameState == "Paused" ? (
                  <>
                    <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Paused</h1>
                    <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>The game is currently paused. Please wait for further updates.</h3>
                    <Image alt='Image' src={potatoBlink} width={200} height={200} />
                    {loadingActiveTokens ? (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</p>
                    ) : (
                      <p className={`text-xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{_activeTokens} Active Tokens Remaing</p>)
                    }
                    <Link href="https://mumbai.polygonscan.com/address/0xfCC1796054b53124f380c56e48351b1B8Ee1Af81" target='_blank' className='underline'>
                      Smart Contract
                    </Link>
                  </>
                ) :
                  getGameState == "Ended" ? (
                    <>
                      <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Game Ended</h1>
                      <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Thank you for participating. See you in the next game!</h3>
                      <Image alt='Image' src={potatoBlink} width={200} height={200} />
                      <h2 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>And congratulations to our Winner:</h2>
                      {loadingHGallOfFame ? (
                        <h1
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}
                        >
                          Loading...
                        </h1>) : (
                        <Link
                          href={`https://mumbai.polygonscan.com/address/${roundWinner}`}
                          target='_blank'
                          className={`text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text animate-pulse ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}
                        >
                          {loadingWinnerEnsName ? (
                            <span>Loading...</span>
                          ) : errorWinnerEnsName ? (
                            <span>{roundWinner}</span>
                          ) : (
                            <span>{winnerEnsName}</span>
                          )
                          }
                        </Link>
                      )
                      }
                    </>
                  ) :
                    getGameState == "Minting" && (
                      <>
                        <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Jump in the Heat</h1>
                        {loadingCurrentGeneration ? (
                          <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Loading...</h3>
                        ) : (
                          <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Round {_currentGeneration}</h3>
                        )}

                        {loadingPrice ? (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>PRICE: Loading...</p>
                        ) : (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>PRICE: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>{price}</span> MATIC</p>
                        )}

                        {loadingMaxPerWallet ? (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>MAX PER WALLET: Loading...</p>
                        ) : (
                          <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>MAX PER WALLET: <span className={`text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>{maxPerWallet}</span></p>
                        )}


                        {address ?
                          <>
                            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                              type="text"
                              value={mintAmount}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={handleInputChangeMint}
                              placeholder="Enter mint amount" />
                            <button className={`mt-4 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110`}
                              onClick={handleMint}
                            >Join Round!</button>
                            <p className={`text-lg text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{loadingMaxSupply ? 'Loading Max Supply...' : maxSupply} MINTED</p>
                          </>
                          :
                          <>
                            <p className={`text-3xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>{totalMints}/{loadingMaxSupply ? 'Loading Max Supply...' : maxSupply} MINTED</p>
                            <p1 className={`text-2xl md:text-xl lg:text-3xl text-center font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                              Connect first to join the fun!
                            </p1>
                          </>
                        }
                        <Link href="https://mumbai.polygonscan.com/address/0xfCC1796054b53124f380c56e48351b1B8Ee1Af81" target='_blank' className='underline'>
                          Smart Contract
                        </Link>
                      </>

                    )}
            {/* Content when address does not exist */}
          </div>

          <div className={`w-full flex flex-col justify-center items-center p-4 mb-8 col-end-9 col-span-2  md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-xl`}>
            {!address ?
              <>
                <h1 className={`text-4xl font-extrabold underline text-center text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Connect First</h1>
                <h3 className={`text-2xl text-center mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>You must connect your wallet to view this page! Hope you join the fun soon...</h3>
                <Image alt='Image' src={hot} width={200} height={200} />
              </> :
              getGameState == "Playing" || getGameState == "Final Stage" ?
                <>
                  <h1 className={`text-xl font-bold mb-2 underline ${darkMode ? 'text-white' : 'text-black'}`}>Game Stats:</h1>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Successful Passes: {loadingSuccessfulPasses ? "Loading..." : successfulPasses}
                  </p>
                  <p className={`text-sm text-center mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                    Total Wins: {loadingTotalWins ? "Loading..." : totalWins}
                  </p>
                  {loadingActiveTokenCount ? (
                    <h2 className="text-center font-bold mb-2">Loading Active Token(s)...</h2>
                  ) : isNaN(activeTokensCount) || activeTokensCount === 0 ? (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): 0</h2>
                  ) : (
                    <h2 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Active Token(s): {activeTokensCount}</h2>
                  )}
                  <div className="grid grid-rows-2 place-items-center justify-center items center">
                    <input className="mt-4 w-1/2  bg-white hover:bg-gray-300 text-black px-4 py-2 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                      type="text"
                      value={tokenId}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={handleInputChangeToken}
                      placeholder="tokenId" />
                    <button className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                      onClick={handlePass}
                    >Pass Potato</button>
                  </div>
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={hot} width={200} height={200} className='self-center' />
                    {isWinner && _rewards != 0 &&
                      <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                    }
                  </>
                  : getGameState == "Minting" ?
                    <>
                      <h1 className={`text-3xl text-center font-bold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Welcome to the Backburner!</h1>
                      <Image alt='Image' src={potatoBlink} width={200} height={200} />
                      <h3 className={`text-xl text-center ${darkMode ? 'text-white' : 'text-black'}`}>
                        I have
                        <span className='font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-red-500'>
                          {loadingActiveTokenCount ? ' Loading...' : isNaN(activeTokensCount) || activeTokensCount === 0 ? ` 0` : ` ${activeTokensCount} `}
                        </span>
                        {loadingActiveTokenCount ? '' : isNaN(activeTokensCount) || activeTokensCount === 1 ? ' pair' : ' pairs'} of hands to handle the heat this round
                      </h3>
                      <div className="place-items-center justify-center items center">
                        <button
                          className={`mt-4 w-full ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                          onClick={() => {
                            const tweetText = `I have ${activeTokensCount} ${activeTokensCount === 1 ? 'pair' : 'pairs'} of hands to handle the heat this round!!\nAre you ready to pass the heat? Check out @0xHotPotato_ for more information on the project! #OnChainHotPotato`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                          }}
                        >
                          Tweet it!
                        </button>
                      </div>
                    </>
                    : getGameState == "Paused" ?
                      <>
                        <Image alt='Image' src={hot} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={Burning} width={200} height={200} />
                        {isWinner && _rewards != 0 &&
                          <button className={`${darkMode ? 'w-1/2 hover:bg-white hover:text-black justify-center items-center md:w-2/3 lg:w-1/2 bg-black shadow rounded-xl' : "w-1/2 leading-8 hover:bg-black hover:text-white col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-xl"}`} onClick={handleClaimReward}>Claim Rewards</button>
                        }
                      </>
            }
          </div>


          <div
            ref={divRef}
            className={`hide-scrollbar w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md overflow-x-auto`}
          >

            <div className="whitespace-nowrap h-full flex items-center space-x-4 pl-4">
              {events.map((event, index) => (
                <div key={index} className={darkMode ? 'text-white' : 'text-black'}>
                  {event}
                </div>
              ))}
            </div>
          </div>


          {getGameState !== 'Minting' && getGameState !== 'Queued' && loadingActiveTokenIds ? (
            <div className="text-center">
              <h1>Loading...</h1>
            </div>
          ) : (
            getGameState === 'Playing' || getGameState === 'Minting' || getGameState === 'Final Stage' || getGameState === 'Paused' ? (
              <div className={`p-4 col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-black' : 'bg-white'} shadow rounded-md`}>
                <h1 className={`text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text ${darkMode ? 'bg-gradient-to-br from-amber-800 to-red-800' : 'bg-gradient-to-b from-yellow-400 to-red-500'}`}>Active Tokens:</h1>
                <div className="flex justify-center">
                  <button
                    onClick={refreshAllImages}
                    className={`mb-6 w-1/2 ${darkMode ? 'bg-gray-800 hover:bg-gradient-to-br from-amber-800 to-red-800' : 'bg-black'} hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white px-4 py-2 rounded-lg shadow`}
                  >
                    Refresh Images
                  </button>
                </div>

                <div className={`grid grid-cols-8 sm:grid-cols-4 md:grid-cols-4 gap-4 justify-center items-center`}>
                  {activeTokens.filter(tokenId => !explodedTokens.includes(tokenId)).map((tokenId, index) => (
                    <div key={index} className="border rounded-lg p-2 text-center justify-center items-center flex flex-col">
                      <TokenImage
                        tokenId={tokenId}
                        ABI={ABI}
                        potatoTokenId={_potatoTokenId}
                        shouldRefresh={shouldRefresh}
                        onTokenExploded={handleTokenExploded}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}



          {address === _ownerAddress &&
            <div className={`w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow rounded-xl overflow-x-auto`}>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-3 gap-4">
                <button
                  className={`bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-3 md:col-span-3 sm:col-span-3`}
                  onClick={handleStartGame}
                >
                  Start Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2 md:col-span-3 sm:col-span-3"
                  onClick={handleEndMinting}
                >
                  End Minting
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={handlePauseGame}
                >
                  Pause Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={handleResumeGame}
                >
                  Resume Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-b from-yellow-400 to-red-500 text-white rounded-lg px-4 py-2"
                  onClick={handleRestartGame}
                >
                  Restart Game
                </button>
              </div>
            </div>
          }



        </div>
      </div>
    </>
  )
}