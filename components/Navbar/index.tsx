import Image from 'next/image'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import styles from './styles.module.scss'

import logo from './assets/somnia-light.svg'
import twitter from './assets/twitter.svg'

const Navbar = () => {
  return (
    <div className={styles.container}>
      {/* Alert Section */}
      <div className={styles.alertContainer}>
        <span>
          ⚠️ Built on Somnia Network (Testnet). No real assets involved. Check{' '}
          <a
            href="https://github.com/wakco/monster-somnia"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            GitHub Repository
          </a>{' '}
          for security details.
        </span>
      </div>

      <div className={`${styles.logoContainer} ${styles.hideOnMobile}`}>
        <Image
          src={logo}
          alt="Logo"
          width={40}
          onClick={() =>
            window.open('https://testnet.somnia.network/', '_blank')
          }
        />
      </div>

      <div className={styles.navigationContainer}></div>

      <div className={styles.connectionsContainer}>
        <div
          className={`${styles.dcButton} ${styles.hideOnMobile}`}
          onClick={() => window.open('https://x.com/wakco17', '_blank')}
        >
          <Image src={twitter} alt="Twitter-x" width={30} />
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openConnectModal,
            openAccountModal,
            openChainModal,
            mounted,
          }) => {
            const ready = mounted
            const connected = ready && account && chain

            return (
              <>
                {connected && (
                  <button
                    onClick={openChainModal}
                    className={`${styles.connectButton} ${styles.hideOnMobile}`}
                  >
                    {chain.name}
                  </button>
                )}

                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className={styles.connectButton}
                >
                  {connected
                    ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                    : 'Connect Wallet'}
                </button>

                {connected && (
                  <button
                    onClick={() =>
                      window.open('https://mint.monster.fun', '_blank')
                    }
                    className={`${styles.connectButton} ${styles.hideOnMobile}`}
                  >
                    Fun Mint
                  </button>
                )}
              </>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}

export default Navbar
