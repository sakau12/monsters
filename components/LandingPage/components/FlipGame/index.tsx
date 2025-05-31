import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import headsImageUrl from './assets/heads.png'
import tailsImageUrl from './assets/tails.png'
import spinningImageUrl from './assets/flips.gif'
import contractABI from './SmartContractAbiFlip.json'
import styles from './styles.module.scss'
import Image, { StaticImageData } from 'next/image'
import { useAccount } from 'wagmi'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_FLIPGAME || ''
const BlockExplorer = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || ''

declare global {
  interface Window {
    ethereum?: any
  }
}

interface FlipResult {
  player: string
  betAmount: string
  choice: string
  result: string
  payout: string
  txHash: string
}

const SomFlip = () => {
  const [selectedSide, setSelectedSide] = useState<string>('Heads')
  const [betAmount, setBetAmount] = useState<string>('0.05')
  const [account, setAccount] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState<boolean>(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [flipResult, setFlipResult] = useState<FlipResult | null>(null)
  const [coinImage, setCoinImage] = useState<string | StaticImageData>(
    tailsImageUrl,
  )
  const [totalWin, setTotalWin] = useState<number>(0)
  const [totalLoss, setTotalLoss] = useState<number>(0)
  const [balance, setBalance] = useState<string | null>(null)
  const [flipResults, setFlipResults] = useState<FlipResult[]>([])
  const [popupMessage, setPopupMessage] = useState<string | null>(null)

  useEffect(() => {
    setCoinImage(selectedSide === 'Heads' ? headsImageUrl : tailsImageUrl)
  }, [selectedSide])

  const { isConnected } = useAccount()

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(web3Provider)
      web3Provider.getSigner().then((signer) => {
        signer
          .getAddress()
          .then((addr) => setAccount(addr))
          .catch(() => setAccount(null))
        const gameContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        )
        setContract(gameContract)
      })
    }
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        const bal = await provider.getBalance(account)
        setBalance(ethers.formatEther(bal))
      }
    }
    fetchBalance()
  }, [account, provider])

  useEffect(() => {
    if (!contract) return

    const handleFlipResult = (
      player: string,
      betAmount: any,
      choice: string,
      result: string,
      payout: any,
      event: any,
    ) => {
      console.log('FlipResult Event:', {
        player,
        betAmount,
        choice,
        result,
        payout,
        event,
      })

      setFlipResult({
        player,
        betAmount: ethers.formatEther(betAmount),
        choice,
        result,
        payout: ethers.formatEther(payout),
        txHash: '',
      })

      setCoinImage(result === 'Heads' ? headsImageUrl : tailsImageUrl)
    }

    contract.on('FlipResult', handleFlipResult)
    return () => {
      contract.off('FlipResult', handleFlipResult)
    }
  }, [contract])

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(web3Provider)
          web3Provider.getSigner().then((signer) => {
            const gameContract = new ethers.Contract(
              contractAddress,
              contractABI,
              signer,
            )
            setContract(gameContract)
          })
        } else {
          setAccount(null)
          setContract(null)
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      if (window.ethereum.selectedAddress) {
        handleAccountsChanged([window.ethereum.selectedAddress])
      }
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            'accountsChanged',
            handleAccountsChanged,
          )
        }
      }
    }
  }, [])

  const handleFlip = async () => {
    if (!account || !provider || !contract || !isConnected) {
      setPopupMessage('Please re-connect your wallet first')
      return
    }
    if (balance && parseFloat(balance) < parseFloat(betAmount)) {
      setPopupMessage('Insufficient balance')
      return
    }

    setIsFlipping(true)
    setFlipResult(null)
    setCoinImage(spinningImageUrl)

    try {
      const tx = await contract.flipCoin(selectedSide, {
        value: ethers.parseEther(betAmount),
      })
      console.log('Transaction Hash:', tx.hash)

      const receipt = await tx.wait()
      console.log('Flip Transaction Receipt:', receipt)

      receipt.logs.forEach((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log)
          if (!parsedLog) return

          console.log('FlipResult Event Parsed:', parsedLog)

          const player: string = parsedLog.args[0]
          const betAmountValue: string = ethers.formatEther(parsedLog.args[1])
          const choice: string = parsedLog.args[2]
          const result: string = parsedLog.args[3]
          const payoutValue: string = ethers.formatEther(parsedLog.args[4])

          setFlipResults((prevResults) => [
            {
              player,
              betAmount: betAmountValue,
              choice,
              result,
              payout: payoutValue,
              txHash: tx.hash,
            },
            ...prevResults,
          ])

          setFlipResult({
            player,
            betAmount: betAmountValue,
            choice,
            result,
            payout: payoutValue,
            txHash: tx.hash,
          })

          setCoinImage(result === 'Heads' ? headsImageUrl : tailsImageUrl)

          if (parseFloat(payoutValue) > 0) {
            setTotalWin((prevWin) => prevWin + parseFloat(payoutValue))
          } else {
            setTotalLoss((prevLoss) => prevLoss + parseFloat(betAmountValue))
          }
        } catch (error) {
          console.error('Failed log parsing:', error)
        }
      })
    } catch (error: any) {
      if (
        error?.code === 4001 ||
        error.message.toLowerCase().includes('cancel')
      ) {
        setPopupMessage('Transaction canceled')
      } else {
        setPopupMessage('Transaction failed')
      }
    } finally {
      setIsFlipping(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.widthLimiter}>
        <div className={styles.centerContainer}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>Looking for STT?</div>
            <div className={styles.secondaryTitle}>
              Experience the Thrill of Every Flip!
            </div>
            <div className={styles.somflipContainer}>
              <h2 className={styles.header}>YourBeFun - Flip Game</h2>
              <div className={styles.coinContainer}>
                <Image
                  src={coinImage}
                  alt="Coin"
                  className={styles.coinImage}
                />
              </div>

              <div className={styles.coinSelection}>
                <button
                  className={`${styles.sideBtn} ${selectedSide === 'Heads' ? styles.active : ''}`}
                  onClick={() => setSelectedSide('Heads')}
                >
                  Heads
                </button>
                <button
                  className={`${styles.sideBtn} ${selectedSide === 'Tails' ? styles.active : ''}`}
                  onClick={() => setSelectedSide('Tails')}
                >
                  Tails
                </button>
              </div>

              <div className={styles.betSelection}>
                {['0.01', '0.05', '0.1', '0.25', '0.5', '1'].map((amount) => (
                  <button
                    key={amount}
                    className={`${styles.betBtn} ${betAmount === amount ? styles.active : ''}`}
                    onClick={() => setBetAmount(amount)}
                  >
                    {amount} STT
                  </button>
                ))}
              </div>

              <button
                className={styles.flipBtn}
                onClick={handleFlip}
                disabled={isFlipping}
              >
                {isFlipping ? 'Flipping...' : 'Flip!'}
              </button>

              {flipResult && (
                <div className={styles.resultContainer}>
                  <h3>
                    <p
                      className={
                        parseFloat(flipResult.payout) > 0
                          ? styles.winText
                          : styles.loseText
                      }
                    >
                      {parseFloat(flipResult.payout) > 0
                        ? `Awesome! You just bagged ${flipResult.payout} STT`
                        : 'Oh no, you lost this round!'}
                    </p>
                  </h3>
                </div>
              )}

              <div className={styles.lastFlipsContainer}>
                <h3>Detail Flips</h3>
                <ul>
                  {flipResults.slice(0, 5).map((flip, index) => (
                    <li key={index}>
                      <span>
                        <b>Choice:</b> {flip.choice}
                      </span>{' '}
                      |{' '}
                      <span>
                        <b>Result:</b> {flip.result}
                      </span>{' '}
                      |{' '}
                      <span>
                        <b>Bet:</b> {flip.betAmount} STT
                      </span>{' '}
                      |{' '}
                      <span
                        className={
                          parseFloat(flip.payout) > 0
                            ? styles.winText
                            : styles.loseText
                        }
                      >
                        {parseFloat(flip.payout) > 0
                          ? ` Won: ${flip.payout} STT`
                          : ` Lost: ${flip.betAmount} STT`}
                      </span>
                      {flip.txHash ? (
                        <a
                          href={`${BlockExplorer}/tx/${flip.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.viewTx}
                        >
                          View
                        </a>
                      ) : (
                        <span className={styles.noTx}>No TX</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {popupMessage && (
                <div className={styles.popupOverlay}>
                  <div className={styles.popupContent}>
                    <p>⚠️ {popupMessage}</p>
                    <button onClick={() => setPopupMessage(null)}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SomFlip
