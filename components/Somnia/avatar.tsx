import Image from 'next/image'
import { AvatarComponent } from '@rainbow-me/rainbowkit'
import avatar from './avatar.png'

const CustomAvatar: AvatarComponent = ({ size }) => {
  return (
    <Image
      src={avatar.src}
      alt="AvatarChains"
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  )
}

export default CustomAvatar
