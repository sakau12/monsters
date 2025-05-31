import Image from 'next/image'

import styles from './styles.module.scss'

import Somnia from './assets/somnia.gif'

const About = () => {
  return (
    <div className={styles.container}>
      <div className={styles.widthLimiter}>
        <div className={styles.centerContainer}>
          <div className={styles.titleContainer}>
            <div className={styles.title}>Get to Know?</div>

            <div className={styles.secondaryTitle}>
              Drop a Message, Flex Your STT!
            </div>
          </div>
        </div>

        <div className={styles.descriptionContainer}>
          Send fun messages using SOMNIA TESTNET TOKEN (STT) on the Somnia
          testnet! Just drop 0.001 STT, and your message goes straight to the
          &quot;Recently Fun Messages&quot; list for everyone to see. This site
          is all about experimenting, vibing, and having fun while testing smart
          contract interactions. So go ahead—send it, flex it, and keep
          exploring!
          <br />
          <br />
          Big shoutout to Somnia Network for making this possible and Quills for
          the inspiration! Keep exploring, keep having fun!
        </div>

        <div className={styles.listContainer}>
          <div className={styles.leftSide}>
            <Image src={Somnia} alt="Somnia" fill className={styles.image} />
          </div>

          <div className={styles.rightSide}>
            <ul>
              <li>
                All messages sent through LRMN are recorded on the blockchain
                and cannot be edited or deleted. Once it’s on-chain, it stays
                there forever, so think carefully before sending a message!
              </li>
              <li>
                LRMN does not collect, store, or track any personal data. Your
                interactions are purely on-chain, and we do not have access to
                your private information.
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.text}>
            * LRMN is a testnet experiment for fun and exploration. Messages
            sent using SOMNIA TESTNET TOKEN (STT) have no real-world value and
            are purely for testing smart contract interactions on the Somnia
            network. We&apos;re not responsible for user-submitted messages—so
            keep it cool and have fun testing!
          </div>

          <div className={styles.text}>
            * Security Reminder: We will never ask for your private key or seed
            phrase. Keep your wallet secure and always verify the smart contract
            you’re interacting with. Stay safe and enjoy the testnet!
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
