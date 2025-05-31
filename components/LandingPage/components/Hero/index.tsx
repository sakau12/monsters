import { useState, useEffect } from 'react'
import { Block, ethers } from 'ethers'
import { useAccount } from 'wagmi'
import styles from './styles.module.scss'
import contractABI from './SmartContractAbi.json'
import contractABInft from './SmartContractAbiNFT.json'

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
const contractAddressNFT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_NFT || ''
const BlockExplorer = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || ''
const URLRPCDefault = process.env.NEXT_PUBLIC_RPC_URL || ''

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Message {
  id: number
  address: string
  message: string
}

const Hero = () => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [account, setAccount] = useState<string | null>(null)
  const [lrmnFee, setLrmnFee] = useState<string>('0.001')
  const [nftMintFee, setNftMintFee] = useState<string>('0')
  const [showPopup, setShowPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [successTxUrl, setSuccessTxUrl] = useState<string | null>(null)
  const [isProcessingMessage, setIsProcessingMessage] = useState(false)
  const [isProcessingNFT, setIsProcessingNFT] = useState(false)

  const { isConnected } = useAccount()

  useEffect(() => {
    connectWallet()
    fetchMessages()
    fetchFee()
    fetchNFTFee()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      })

      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        setAccount(await signer.getAddress())
      }
    }
  }

  const fetchMessages = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(URLRPCDefault)
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider,
      )
      const data = await contract.getLastMessages()
      const totalMessages = await contract.totalMessages()

      setMessages(
        data.map((m: any, index: number) => ({
          id: Number(totalMessages) - index,
          address: m.sender,
          message: m.message,
        })),
      )
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchFee = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(URLRPCDefault)
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider,
      )
      const fee = await contract.lrmnFee()
      setLrmnFee(ethers.formatEther(fee))
    } catch (error) {
      console.error('Error fetching fee:', error)
    }
  }

  const fetchNFTFee = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(URLRPCDefault)
      const contract = new ethers.Contract(
        contractAddressNFT,
        contractABInft,
        provider,
      )
      const fee = await contract.getMintFee()
      setNftMintFee(ethers.formatEther(fee))
    } catch (error) {
      console.error('Error fetching NFT mint fee:', error)
    }
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setShowErrorPopup(true)
    const duration = msg.includes('Insufficient balance') ? 30000 : 10000

    setTimeout(() => {
      setShowErrorPopup(false)
      setErrorMessage(null)
    }, duration)
  }

  const showSuccess = (msg: string, txUrl?: string) => {
    setSuccessMessage(msg)
    if (txUrl) setSuccessTxUrl(txUrl)
    setShowSuccessPopup(true)
    setTimeout(() => {
      setShowSuccessPopup(false)
      setSuccessMessage(null)
      setSuccessTxUrl(null)
    }, 10000)
  }

  const checkBalanceAndSendMessage = async () => {
    if (!isConnected) {
      showError('Please connect your wallet first!')
      return
    }

    if (!message.trim()) {
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 10000)
      return
    }

    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      const balance = await provider.getBalance(userAddress)

      const fee = ethers.parseEther(lrmnFee)
      if (balance < fee) {
        showError(
          'Insufficient balance to send message. Please get faucet first at https://testnet.somnia.network/',
        )
        return
      }

      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      if (network.chainId !== BigInt(50312)) {
        showError('You are not connected to Somnia Network Testnet!')
        return
      }

      const messageContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer,
      )

      try {
        setIsProcessingMessage(true)
        const tx = await messageContract.sendMessage(message, {
          value: ethers.parseEther(lrmnFee),
        })
        await tx.wait()
        setMessage('')
        fetchMessages()
        const txUrl = `${BlockExplorer}/tx/${tx.hash}`
        showSuccess(
          'Blast a Message successful! Click here to view details.',
          txUrl,
        )
      } catch (error: any) {
        console.error('Error processing transaction:', error)
        showError(parseErrorMessage(error))
      } finally {
        setIsProcessingMessage(false)
      }
    }
  }

  const checkBalanceAndMintNFT = async () => {
    if (!isConnected) {
      showError('Please connect your wallet first!')
      return
    }

    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      const balance = await provider.getBalance(userAddress)

      const fee = ethers.parseEther(nftMintFee)
      if (balance < fee) {
        showError(
          'Insufficient balance to mint NFT. Please get faucet first at https://testnet.somnia.network/',
        )
        return
      }

      mintNFT()
    }
  }

  const mintNFT = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      if (network.chainId !== BigInt(50312)) {
        showError('You are not connected to Somnia Network Testnet!')
        return
      }

      const nftContract = new ethers.Contract(
        contractAddressNFT,
        contractABInft,
        signer,
      )

      try {
        setIsProcessingNFT(true)
        const tx = await nftContract.mintNft({
          value: ethers.parseEther(nftMintFee),
        })
        await tx.wait()
        fetchMessages()
        const txUrl = `${BlockExplorer}/tx/${tx.hash}`
        showSuccess(
          'Pop a Mint successfully! Click here to view details.',
          txUrl,
        )
      } catch (error: any) {
        console.error('Error processing NFT transaction:', error)
        showError(parseErrorMessage(error))
      } finally {
        setIsProcessingNFT(false)
      }
    }
  }

  const parseErrorMessage = (error: any) => {
    return (
      error.reason ||
      error.data?.message ||
      error.message ||
      'Transaction failed! Please try again.'
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.gridContainer}>
        <div className={styles.blankContainer} />
      </div>

      <div className={styles.positionContainer}>
        <div className={styles.statsContainer}></div>
      </div>

      <div className={styles.funMessageSection}>
        <div className={styles.funMessageInputContainer}>
          {showPopup && (
            <div className={`${styles.popupError} ${styles.show}`}>
              Please type something cool first!
            </div>
          )}

          {showErrorPopup && errorMessage && (
            <div className={`${styles.popupError} ${styles.show}`}>
              {errorMessage}
            </div>
          )}

          {showSuccessPopup && successMessage && (
            <div className={`${styles.popupError} ${styles.show}`}>
              {successTxUrl ? (
                <a
                  href={successTxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {successMessage}
                </a>
              ) : (
                successMessage
              )}
            </div>
          )}

          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="Type something cool..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 32))}
              className={styles.funMessageInput}
            />
            <span className={styles.charIndicator}>{message.length}/32</span>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button
            onClick={checkBalanceAndSendMessage}
            className={styles.funMessageButton}
            disabled={isProcessingMessage}
          >
            {isProcessingMessage ? 'Processing...' : 'Blast a Message'}
          </button>

          <button
            onClick={checkBalanceAndMintNFT}
            className={styles.funMessageButton}
            disabled={isProcessingNFT}
          >
            {isProcessingNFT ? 'Processing...' : 'Pop a Mint'}
          </button>
        </div>
        <div className={styles.funMessageAlert}>(0.001 STT)</div>

        <div className={styles.recentMessagesContainer}>
          <h3>Fresh Off the Keyboard</h3>
          <ul className={styles.recentMessagesList}>
            {messages.map(({ id, address, message }) => (
              <li key={id}>
                <strong>
                  [{id}] {address.slice(0, 6)}...{address.slice(-4)}:
                </strong>{' '}
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Hero
