import styles from './styles.module.scss'

import all from './assets/all.png'

import Image from 'next/image'

const NFTsScrolling = () => {
  return (
    <div className={styles.carousel}>
      <Image src={all} alt="Teams" /> <Image src={all} alt="Teams" />
    </div>
  )
}

export default NFTsScrolling
