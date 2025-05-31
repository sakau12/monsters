import { DisclaimerComponent } from '@rainbow-me/rainbowkit'

const Disclaimer: DisclaimerComponent = ({ Text }) => (
  <Text>
    <b>
      This is a testnet experiment for fun and testing. Messages sent with{' '}
      SOMNIA TESTNET TOKEN (STT) have no real value and only test smart contract
      interactions on the Somnia Network.
    </b>
  </Text>
)

export default Disclaimer
