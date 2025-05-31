import NFTsScrolling from './components/NFTsScrolling'

import styles from './styles.module.scss'

const Team = () => {
  return (
    <div className={styles.container}>
      <div className={styles.centerContainer}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>Who’s Who?</div>
          <div className={styles.secondaryTitle}>Meet the Dream Team</div>
        </div>
        <div className={styles.carouselContainer}>
          <NFTsScrolling />
        </div>
      </div>
    </div>
  )
}

export default Team
