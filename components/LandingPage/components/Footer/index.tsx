import Image from 'next/image'
import styles from './styles.module.scss'

import telegram from './assets/telegram.svg'
import discord from './assets/discord.svg'
import twitter from './assets/twitter.svg'

const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.bgContainer}>
        <div className={styles.titleContainer}>JOIN OUR COMMUNITY</div>

        <div className={styles.socialContainer}>
          <div className={styles.icon}>
            <Image
              src={telegram}
              alt="Telegram"
              width={50}
              height={50}
              onClick={() => window.open('https://t.me/somnianetwork')}
            />
          </div>

          <div className={styles.icon}>
            <Image
              src={discord}
              alt="Discord"
              width={40}
              height={40}
              onClick={() => window.open('https://discord.gg/somnia')}
            />
          </div>

          <div className={styles.icon}>
            <Image
              src={twitter}
              alt="Twitter"
              width={40}
              height={40}
              onClick={() => window.open('https://x.com/Somnia_Network')}
            />
          </div>
        </div>

        <div className={styles.copyrightContainer}>Made with ♥ in Bogor</div>
      </div>
    </div>
  )
}

export default Footer
