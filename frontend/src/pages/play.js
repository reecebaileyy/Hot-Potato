import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Web3Button } from '@web3modal/react'
import ABI from '../abi/UNKNOWN.json'
import { useAccount, useBalance, useContractRead, usePrepareContractWrite, useContractWrite, useContractEvent } from 'wagmi'
import potato from 'public/assets/images/potato.png'
import blacklogo from 'public/assets/images/blacklogo.png'



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
  const [isOpen, setIsOpen] = useState(false)
  const [events, setEvents] = useState([]);
  const [tokenId, setTokenId] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [value, setValue] = useState('');



  const menuRef = useRef()

  // STORING USERS ADDRESS
  const { address } = useAccount()
  const { balance } = useBalance(address)

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

  useContractEvent({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    eventName: 'GameStarted',
    listener(log) {
      const message = "Game Started";
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    eventName: 'GamePaused',
    listener(log) {
      const message = "Game Paused";
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    eventName: 'GameRestarted',
    listener(log) {
      const message = "Game Restarted";
      setEvents(prevEvents => [...prevEvents, message]);
    },
  })

  useContractEvent({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    eventName: 'PotatoExploded',
    listener(log) {
      const tokenId_ = log.args.tokenId.toString();
      setEvents(prevEvents => [...prevEvents, `Potato Exploded: ${tokenId_}`]);
    },
  })

  useContractEvent({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    eventName: 'PotatoPassed',
    listener(log) {
      const tokenIdFrom = log.args.tokenIdFrom.toString();
      const tokenIdTo = log.args.tokenIdTo.toString();
      setEvents(prevEvents => [...prevEvents, `Potato Passed from: ${tokenIdFrom} to: ${tokenIdTo}`]);
    },
  })


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

  // GETTING GAME STATE
  const { data: getGameState, isLoading: Loading, refetch: refetchGameState } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'getGameState',
  })

  // GETTING NUMBER OF PASSES
  const { data: successfulPasses, refetch: refetchSuccessfulPasses } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'successfulPasses',
    args: [address],
  })
  const passes = parseInt(successfulPasses, 10);

  // GETTING NUMBER OF FAILS
  const { data: failedPasses, refetch: refetchFailedPasses } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'failedPasses',
    args: [address],
  })
  const failed = parseInt(failedPasses, 10);

  // GETTING NUMBER OF WINS
  const { data: totalWins, refetch: refetchtotalWins } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'totalWins',
    args: [address],
  })
  const wins = parseInt(totalWins, 10);

  // GET MINT PRICE
  const { data: _price, refetch: refetch_price } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: '_price',
  })
  const price = parseInt(_price, 10);

  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getRoundMints, refetch: refetchGetRoundMints } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'getRoundMints',
  })
  const _roundMints = parseInt(getRoundMints, 10);

  // GET NUMBER OF MINTS DURING THE ROUND
  const { data: getActiveTokenCount, refetch: refetchGetActiveTokenCount } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'getActiveTokenCount',
    args: [address],
  })
  const activeTokensCount = parseInt(getActiveTokenCount, 10);

  // GET NUMBER OF MAX MINTS DURING THE ROUND
  const { data: _maxsupply, refetch: refetch_maxSupply } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: '_maxsupply',
  })
  const maxSupply = parseInt(_maxsupply, 10);

  // GET TOKENS OWNED BY USER
  const { data: userHasPotatoToken, refetch: refetchuserHasPotatoToken } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'userHasPotatoToken',
    args: [address],
  })
  const hasPotatoToken = userHasPotatoToken?.toString();

  // GET POTATO TOKEN ID
  const { data: getExplosionTime, refetch: refetchgetExplosionTime } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'getExplosionTime',
  })
  const explosionTime = parseInt(getExplosionTime, 10);

  // GET EXPLOSION TIME
  const { data: potatoTokenId, refetch: refetchpotatoTokenId } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'potatoTokenId',
  })
  const _potatoTokenId = parseInt(potatoTokenId, 10);

  // GET ACTIVE TOKENS
  const { data: getActiveTokens, refetch: refetchGetActiveTokens } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'getActiveTokens',
  })
  const activeTokens = parseInt(getActiveTokens, 10);

  // GET CURRENT GENERATION
  const { data: currentGeneration, refetch: refetchCurrentGeneration } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'currentGeneration',
  })
  const currentRound = parseInt(currentGeneration, 10);

  // GET CURRENT GENERATION
  const { data: Winners, refetch: refetchWinner } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'Winners',
    args: [currentRound],
  })
  const winner = Winners?.toString();

  const { data: balanceOf, refetch: refetchBalanceOf } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'balanceOf',
    args: [address],
  })
  const _balanceOf = parseInt(balanceOf, 10);

  const { data: _owner, refetch: refetchowner } = useContractRead({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: '_owner',
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
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'mintHand',
    args: [mintAmount],
  })
  const { data: mintData, isSuccess, write: mint } = useContractWrite(config)

  // PASS POTATO
  const { config: configPass } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'passPotato',
    args: [tokenId],
  })
  const { data: passData, isSuccess: Successful, write: pass } = useContractWrite(configPass)



  // CHECK EXPLOSION
  const { config: configCheck } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'checkExplosion',
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
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'startGame',
  })
  const { data: startGameData, isSuccess: started, write: _startGame } = useContractWrite(startGame)

  // END MINTING
  const { config: endMinting } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'endMinting',
  })
  const { data: endMintingData, isSuccess: ended, write: _endMint } = useContractWrite(endMinting)

  // PAUSE GAME
  const { config: pauseGame } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'pauseGame',
  })
  const { data: pauseGameData, isSuccess: pasued, write: _pauseGame } = useContractWrite(pauseGame)

  // RESUME GAME
  const { config: resumeGame } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'resumeGame',
  })
  const { data: resumeGameData, isSuccess: resumed, write: _resumeGame } = useContractWrite(resumeGame)

  // RESTART GAME 
  const { config: restartGame } = usePrepareContractWrite({
    address: '0x5C39Ce75BBdE054d6Ac101b7c3f7b05CCfD40BA4',
    abi: ABI,
    functionName: 'restartGame',
  })
  const { data: restartGameData, isSuccess: restarted, write: _restartGame } = useContractWrite(restartGame)


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
      alert("please connect to join the heat!!!")
    } else if (getGameState !== "Queued" && getGameState == "Ended") {
      alert("The game has already started!");
    } else {
      _startGame?.();
    }
  }

  const handleEndMinting = () => {
    if (!address) {
      alert("please connect to join the heat!!!")
    } else if (getGameState !== "Minting") {
      alert("The game has not started yet!");
    } else {
      _endMint?.();
    }
  }

  const handlePauseGame = () => {
    if (!address) {
      alert("please connect to join the heat!!!")
    } else if (getGameState !== "Playing" && getGameState !== "Final Round" && getGameState !== "Minting") {
      alert("The game has not started yet!");
    } else {
      _pauseGame?.();
    }
  }

  const handleResumeGame = () => {
    if (!address) {
      alert("please connect to join the heat!!!")
    } else if (getGameState !== "Paused") {
      alert("The game is not paused!");
    } else {
      _resumeGame?.();
    }
  }

  const handleRestartGame = () => {
    if (!address) {
      alert("please connect to join the heat!!!")
    } else if (getGameState !== "Ended" && getGameState !== "Paused") {
      alert("The game is not over!");
    } else {
      _restartGame?.();
    }
  }



  const handleMint = () => {
    if (!address) {
      alert("please connect to join the heat!!!");
    } else if (balance < totalCost) {
      alert("Not enough funds in your wallet");
    } else if (mintAmount > (maxSupply - _roundMints)) {
      alert("This Game is Full, Please wait for the next round");
    } else if (mintAmount == 0) {
      alert("You need at least 1 hand to play");
    } else {
      mint?.();
    }
  };

  const handlePass = () => {
    if (!address) {
      alert("please connect to join the heat!!!");
    } else if (getGameState !== "Playing" && getGameState !== "Final Round") {
      alert("The game has not started yet!");
    } else if (!userHasPotatoToken) {
      alert("You need to own the potato to make a pass!");
    } else {
      pass?.();
    }

  };

  const handleInputChangeToken = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      alert('Only numbers are allowed');
    }
    else if (inputValue === "") {
      setTokenId("");
    }
    else if (inputValue !== "") {
      const _tokenId = parseInt(inputValue);
      setTokenId(_tokenId);
    }
    setValue(numericValue);
  }

  const handlecheck = () => {
    if (!address) {
      alert("please connect to join the heat!!!");
    } else if (explosionTime !== 0) {
      alert("The potato has not exploded yet!");
    } else {
      check?.();
    }

  };


  const handleInputChangeMint = (e) => {
    const inputValue = e.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, '');
    if (numericValue !== inputValue) {
      alert('Only numbers are allowed');
    }
    else if (inputValue === "") {
      setMintAmount("");
      setTotalCost(0);
    }
    else if (inputValue !== "") {
      const newMintAmount = parseInt(inputValue);
      setMintAmount(newMintAmount);
      setTotalCost(newMintAmount * 0.008);
    }
    setValue(numericValue);
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
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchGameState();
      refetchSuccessfulPasses();
      refetchFailedPasses();
      refetchtotalWins();
      refetch_price();
      refetchGetRoundMints();
      refetchGetActiveTokenCount();
      refetch_maxSupply();
      refetchuserHasPotatoToken();
      refetchgetExplosionTime();
      refetchpotatoTokenId();
      refetchGetActiveTokens();
      refetchCurrentGeneration();
      refetchBalanceOf();
      refetchWinner();
      console.log("AN UNKNOWN PRODUCTION");
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
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

  return (
    <>
      <Head>
        <title>HOT POTATO</title>
        <meta name="description" content="Hodl, Pass, Survive..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className="bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 min-h-screen font-darumadrop">
        <nav className="py-2 pt-10 px-5 md:px-10 flex justify-between items-center relative z-20">
        <Link href='/' className='text-4xl sm:text-5xl md:text-6xl text-white hover:text-black'><Image src={blacklogo} width={150}/></Link>
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
              <ul ref={menuRef} className={`items-center bg-white p-5 rounded-lg flex flex-col space-y-4 text-xl md:text-2xl text-black`}>
                <li><Link className='text-black hover:text-gray-700 justify-center' href="/play">Play</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="/leaderboard">Leaderboard</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://app.gitbook.com" target="_blank">Docs</Link></li>
                <li><Link className='text-black hover:text-gray-700' href="https://opensea.io" target="_blank">Opensea</Link></li>
                <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
              </ul>
            </div>
          </div>
          <ul className='flex md:hidden sm:hidden space-x-12 md:space-x-12 text-xl md:text-2xl'>
            <li><Link className='text-white hover:text-black' href="/play">Play</Link></li>
            <li><Link className='text-white hover:text-black' href="/leaderboard">Leaderboard</Link></li>
            <li><Link className='text-white hover:text-black' href="https://app.gitbook.com" target="_blank">Docs</Link></li>
            <li><Link className='text-white hover:text-black' href="https://opensea.io" target="_blank">Opensea</Link></li>
          </ul>
          <div className='sm:hidden md:hidden'>
            <Web3Button className='text-white bg-slate-800 p-2 rounded-lg' />
          </div>
        </nav>

        <div className="p-4 sm:flex sm:flex-col md:flex md:flex-col grid grid-cols-8 gap-4 justify-center items-center">
          <div className='w-full col-start-2 col-span-6 justify-start items-start md:w-2/3 lg:w-1/2 rounded-md'>
            <h1 className="text-3xl sm:text-center md:text-center md:text-4xl lg:text-5xl text-left font-bold mb-4">v1.0.0</h1>
          </div>

          <div className="w-full col-start-2 col-span-6 justify-center items-center md:w-2/3 lg:w-1/2 bg-white shadow rounded-md">
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-4">Hodl, Pass, Survive...</h1>
            <h2 className="text-xl font-bold mb-2 text-center">Game State: {getGameState}</h2>
            <p className="text-sm text-center">This is the current game state. It will be updated automatically.</p>
          </div>
          <div className="w-full flex flex-col justify-center items-center col-start-1 col-end-3 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md p-4 mb-8">
            {!address ?
              <>
                <>
                  <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Connect First</h1>
                  <h3 className='text-2xl text-center mb-4 text-black'>Connect your wallet to view this page! Hope you join the fun soon...</h3>
                  <Image alt='Image' src={potato} width={200} height={200} />
                </>
              </> :
              getGameState == "Playing" || getGameState == "Final Round" ?
                <>
                  <h2 className="text-xl font-bold underline mb-2">Statistics:</h2>
                  <p className="text-sm text-center mb-2">Successful Passes: {passes}</p>
                  <p className="text-sm text-center mb-2">Failed Passes: {failed}</p>
                  <p className="text-sm text-center mb-2">Total Wins: {wins}</p>
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={potato} width={200} height={200} className='self-center' />
                  </>
                  : getGameState == "Paused" ?
                    <>
                      <Image alt='Image' src={potato} width={200} height={200} />
                    </>
                    : getGameState == "Minting" ?
                      <>
                        <h1 className="text-3xl text-center font-bold mb-2">Welcome to the oven!</h1>
                        <p className="text-sm text-center mb-2">Ready up because this is about to get heated...</p>
                        <p className="text-sm text-center mb-2">mint now or cry later?</p>
                        <p className="text-sm text-center mb-2">Got Heat?</p>
                        <div className='flex flex-row justify-center'>
                          <Image alt='Image' src={potato} width={100} height={200} />
                          <Image alt='Image' src={potato} width={100} height={200} />
                          <Image alt='Image' src={potato} width={100} height={200} />
                        </div>
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                      </>
            }
          </div>
          <div className="w-full flex flex-col justify-center items-center col-start-3 col-span-4 md:w-2/3 lg:w-1/2 bg-white shadow-lg rounded-md p-6 mb-8 transition-transform duration-500 ease-in-out transform hover:scale-105">
            {getGameState == "Playing" || getGameState == "Final Round" ?
              <>
                <h1 className="text-4xl font-extrabold underline text-center mb-4 text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Token #{_potatoTokenId} has the potato</h1>
                <h2 className="text-2xl text-center mb-4 text-black">TIME REMAINING: {explosionTime}</h2>
                <Image alt='Image' src={potato} width={200} height={200} />
                <button className="mt-4 w-1/2 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-3 rounded shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110"
                  onClick={handlecheck}>
                  CHECK EXPLOSION
                </button>
                <p className="text-xl text-center mb-4 text-black">{activeTokens} Active Tokens Remaing</p>
                <Link href="https://mumbai.polygonscan.com/" target='_blank'>
                  Smart Contract
                </Link>
              </>
              : getGameState == "Queued" ? (
                <>
                  <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Round starting soon</h1>
                  <h3 className='text-xl text-center mb-4 text-black'>The game is currently Queued, Come back soon for some sizzlin fun!</h3>
                  <Image alt='Image' src={potato} width={200} height={200} />
                  <div className='grid grid-cols-3 justify-center gap-4'>
                    <Link href="https://mumbai.polygonscan.com/" target='_blank' className='text-lg text-center underline text-black'>
                      Discord
                    </Link>
                    <Link href="https://twitter.com" className='text-lg text-center underline text-black'>Smart Contract</Link>
                    <Link className="text-lg text-center underline text-black" href="https://app.gitbook.com">Twitter</Link>
                  </div>
                </>
              ) :
                getGameState == "Paused" ? (
                  <>
                    <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Game Paused</h1>
                    <h3 className='text-2xl text-center mb-4 text-black'>The game is currently paused. Please wait for further updates.</h3>
                    <Image alt='Image' src={potato} width={200} height={200} />

                    <p className="text-xl text-center mb-4 text-black">{activeTokens} Active Tokens Remaing</p>
                    <Link href="https://mumbai.polygonscan.com/" target='_blank'>
                      Smart Contract
                    </Link>
                  </>
                ) :
                  getGameState == "Ended" ? (
                    <>
                      <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Game Ended</h1>
                      <h3 className='text-2xl text-center mb-4 text-black'>Thank you for participating. See you in the next game!</h3>
                      <Image alt='Image' src={potato} width={200} height={200} />
                      <h2 className="text-xl text-center text-black">And congratulations to our Winner:</h2>
                      <Link href={`https://mumbai.polygonscan.com/address/${winner}`} target='_blank' className="text-2xl sm:text-xs lg:text-base xl:text-base md:text-base font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 animate-pulse">{winner}</Link>
                      {/* Add more components based on your design in ended state */}
                    </>
                  ) :
                    getGameState == "Minting" && (
                      <>
                        <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Jump in the Heat</h1>
                        <h3 className='text-2xl text-center mb-4 text-black'>Round {currentRound}</h3>
                        <div className='grid grid-cols-2'>
                          <p className="text-lg text-center mb-4 text-black">PRICE: {price} ETH</p>
                          <p className="text-lg text-center mb-4 text-black">MAX PER WALLET: XXX</p>
                        </div>

                        {address ?
                          <>
                            <input className="mt-4 w-3/4 bg-white hover:bg-gray-300 text-black px-4 py-2 rounded shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                              type="text"
                              value={mintAmount}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              onChange={handleInputChangeMint}
                              placeholder="Enter mint amount" />
                            <button className="mt-4 w-1/2 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-3 rounded shadow-lg text-lg font-bold transition-all duration-500 ease-in-out transform hover:scale-110"
                              onClick={handleMint}
                            >Join Round!</button>
                            <p className="text-lg text-center mb-4 text-black">{_roundMints}/{maxSupply} MINTED</p>
                          </>
                          :
                          <>
                            <h1 className="text-3xl text-center mb-4 text-black">{_roundMints}/{maxSupply} MINTED</h1>
                            <p1 className="text-2xl md:text-xl lg:text-3xl text-center font-bold"
                            >Connect first to join the fun!</p1>
                          </>
                        }
                        <Link href="https://mumbai.polygonscan.com/" target='_blank'>
                          Smart Contract
                        </Link>
                      </>

                    )}
            {/* Content when address does not exist */}
          </div>
          <div className="w-full flex flex-col justify-center items-center p-4 mb-8 col-end-9 col-span-2  md:w-2/3 lg:w-1/2 bg-white shadow rounded-md">
            {!address ?
              <>
                <h1 className="text-4xl font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500">Connect First</h1>
                <h3 className='text-2xl text-center mb-4 text-black'>You must connect your wallet to view this page! Hope you join the fun soon...</h3>
                <Image alt='Image' src={potato} width={200} height={200} />
              </> :
              getGameState == "Playing" || getGameState == "Final Round" ?
                <>
                  <h1 className='text-xl font-bold mb-2 underline'>Your Tokens:</h1>
                  <h2 className="text-base font-bold mb-2">Active Token(s): {activeTokensCount}</h2>
                  <h2 className='text-base font-bold mb-2'>Has Potato: {hasPotatoToken}</h2>
                  <p className="text-sm text-center">You can pass the potato if you are currently holding it.</p>
                  <div className="grid grid-rows-2 place-items-center justify-center items center">
                    <input className="mt-4 w-1/2  bg-white hover:bg-gray-300 text-black px-4 py-2 rounded shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-500 ease-in-out transform hover:scale-105"
                      type="text"
                      value={tokenId}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={handleInputChangeToken}
                      placeholder="tokenId" />
                    <button className="mt-4 w-5/6 bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow"
                      onClick={handlePass}
                    >Pass Potato</button>
                  </div>
                </>
                : getGameState == "Queued" ?
                  <>
                    <Image alt='Image' src={potato} width={200} height={200} className='self-center' />
                  </>
                  : getGameState == "Minting" ?
                    <>
                      <Image alt='Image' src={potato} width={200} height={200} />
                      <h3 className="text-xl text-center">
                        I have <span className='font-extrabold underline text-center text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500'>
                          {activeTokensCount}
                        </span> {activeTokensCount === 1 ? 'pair' : 'pairs'} of hands to handle the heat this round
                      </h3>
                      <p className="text-sm text-center">Pass the heat to your friends and family!!</p>
                      <div className="grid grid-rows-2 place-items-center justify-center items center">
                        <button
                          className="mt-4 w-full bg-black hover:bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white px-4 py-2 rounded shadow"
                          onClick={() => {
                            const imageUrl = 'https://your-website.com/your-image.jpg'; // Replace with your image URL
                            const tweetText = `I have ${activeTokensCount} ${activeTokensCount === 1 ? 'pair' : 'pairs'} of hands to handle the heat this round!! Are you ready to pass the heat? Check out @0xHotPotato_ for more information on the project! #OnChainHotPotato`;
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                          }}
                        >
                          Tweet it!
                        </button>

                      </div>
                    </>

                    : getGameState == "Paused" ?
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                      </>
                      : getGameState == "Ended" &&
                      <>
                        <Image alt='Image' src={potato} width={200} height={200} />
                      </>
            }
          </div>

          <div className="w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md overflow-x-auto">
            <div className="whitespace-nowrap h-full flex items-center space-x-4 pl-4">
              {events.map((event, index) => (
                <div key={index}>
                  {event}
                </div>
              ))}
            </div>
          </div>

          {address == _owner &&
            <div className="w-full col-start-1 col-end-9 md:w-2/3 lg:w-1/2 bg-white shadow rounded-md overflow-x-auto">
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 sm:grid-cols-3 gap-4">
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded px-4 py-3 md:col-span-3 sm:col-span-3"
                  onClick={handleStartGame}
                >
                  Start Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded px-4 py-2 md:col-span-3 sm:col-span-3"
                  onClick={handleEndMinting}
                >
                  End Minting
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded px-4 py-2"
                  onClick={handlePauseGame}
                >
                  Pause Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded px-4 py-2"
                  onClick={handleResumeGame}
                >
                  Resume Game
                </button>
                <button
                  className="bg-black hover:bg-gradient-to-br from-yellow-400 via-red-500 to-pink-500 text-white rounded px-4 py-2"
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