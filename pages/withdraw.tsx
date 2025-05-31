import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import contractABI from './Withdraw/SmartContractAbiFlip.json'
import styles from './Withdraw/styles.module.scss'
import { useAccount } from 'wagmi'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_FLIPGAME || ''
declare global {
  interface Window {
    ethereum?: any
  }
}

const Withdraw = () => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [popupMessage, setPopupMessage] = useState<string | null>(null)
  const [withdrawingPercentage, setWithdrawingPercentage] = useState<
    number | null
  >(null)
  const [contractBalance, setContractBalance] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && window.ethereum && address) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(web3Provider)
      setAccount(address)
      web3Provider.getSigner().then((signer) => {
        const gameContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        )
        setContract(gameContract)
      })
    }
  }, [isConnected, address])

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

  useEffect(() => {
    const fetchContractBalance = async () => {
      if (provider) {
        const bal = await provider.getBalance(contractAddress)
        setContractBalance(ethers.formatEther(bal))
      }
    }
    fetchContractBalance()
    const interval = setInterval(fetchContractBalance, 30000)
    return () => clearInterval(interval)
  }, [provider, popupMessage])

  const handleWithdraw = async (percentage: number) => {
    if (!account || !provider || !contract || !isConnected) {
      setPopupMessage('Please connect your wallet first')
      return
    }
    if (!contractBalance) {
      setPopupMessage('Contract balance not available')
      return
    }

    const total = parseFloat(contractBalance)
    const withdrawAmount = total * (percentage / 100)

    try {
      setIsProcessing(true)
      setWithdrawingPercentage(percentage)

      const tx = await contract.withdrawFunds(
        ethers.parseEther(withdrawAmount.toString()),
      )
      console.log('Withdraw Transaction Hash:', tx.hash)
      await tx.wait()
      setPopupMessage(
        `Withdrawal of ${withdrawAmount.toFixed(4)} STT successful!`,
      )
    } catch (error: any) {
      console.error('Withdraw error:', error)
      setPopupMessage('Withdrawal failed')
    } finally {
      setWithdrawingPercentage(null)
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.somflipContainer}>
        <h2 className={styles.header}>YourBeFun - FlipGame Withdraw</h2>

        <div className={styles.withdrawContainer}>
          {/* Connect Wallet Button */}
          <div className={styles.connectContainer}>
            <ConnectButton />
          </div>

          {/* Tampilkan tombol withdraw hanya jika wallet sudah terkoneksi */}
          {isConnected && (
            <>
              <div className={styles.betSelection}>
                {['25%', '50%', '70%', '100%'].map((percentStr) => {
                  const percent = parseInt(percentStr)
                  return (
                    <button
                      key={percent}
                      className={styles.betBtn}
                      onClick={() => handleWithdraw(percent)}
                      disabled={isProcessing}
                    >
                      {withdrawingPercentage === percent
                        ? 'Processing...'
                        : percentStr}
                    </button>
                  )
                })}
              </div>

              {contractBalance && (
                <p className={styles.contractBalance}>
                  Contract Balance: {parseFloat(contractBalance).toFixed(4)} STT
                </p>
              )}
            </>
          )}
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
  )
}

export default Withdraw
