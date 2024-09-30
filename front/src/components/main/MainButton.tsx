import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import IcWalletConnect from "@/assets/icons/Landing/ic_wallet_connect.svg";
import IcWalletStake from "@/assets/icons/Landing/ic_wallet_stake.svg";
import useTonConnect from "@/hooks/contract/useTonConnect";

const MainButton = () => {
  const { connected, tonConnectUI } = useTonConnect();
  const navigate = useNavigate();

  const handleSwitchWalletFunction = () => {
    if (connected) {
      return;
    } else {
      tonConnectUI.connectWallet();
    }
  };

  return (
    <TonWalletWrapper onClick={handleSwitchWalletFunction}>
      {connected ? (
        <TonConnectCenterBox>
          <img src={IcWalletStake} alt="stake" /> {`${tonConnectUI.account?.address.slice(0, 6)}...${tonConnectUI.account?.address.slice(-4)}`}
        </TonConnectCenterBox>
      ) : (
        <TonConnectCenterBox>
          <img src={IcWalletConnect} alt="connect" /> Connect wallet
        </TonConnectCenterBox>
      )}
    </TonWalletWrapper>
  );
};

export default MainButton;

const TonWalletWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  padding: 1rem 2rem;

  border-radius: 42px;
  background-color: #1f53ff;

  cursor: pointer;
`;

const TonConnectCenterBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  color: #fff;
  ${({ theme }) => theme.fonts.Nexton_Body_Text_Large_2};
`;
