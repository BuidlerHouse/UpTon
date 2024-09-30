import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Slide, toast, ToastContainer } from "react-toastify";
import styled from "styled-components";

import Header from "@/components/common/Header";
import { WelcomeModal } from "@/components/main/Modal/WelcomeModal";
import { useManageReferral } from "@/hooks/api/referral/useManageReferral";
import { useTrackReferral } from "@/hooks/api/referral/useTrackReferral";
import { useTonConnectUI } from "@tonconnect/ui-react";

import "react-toastify/dist/ReactToastify.css";
import { Card, CardActions, CardMedia, CardContent, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import useTonConnect from "@/hooks/contract/useTonConnect";
const tele = (window as any).Telegram.WebApp;

const SelectBox = styled(Select)`
  // Add any custom styles here if needed
`;

const PumpList = [
  {
    coin: 'FARM',
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
    image: "https://artefarm.s3.ap-southeast-1.amazonaws.com/hackathon/test.png",
  },
  {
    coin: 'COIN',
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
    image: "https://artefarm.s3.ap-southeast-1.amazonaws.com/hackathon/coin_big.png",
  },
  // {
  //   coin: getRandomCoinName(),
  //   ...getLiquityAndVolume(),
  //   createdTime: Date.now(),
  //   image: "https://via.placeholder.com/150",
  // },
  // {
  //   coin: getRandomCoinName(),
  //   ...getLiquityAndVolume(),
  //   createdTime: Date.now(),
  //   image: "https://via.placeholder.com/150",
  // },
];

function getRandomCoinName() {
  const coins = ["BTC", "ETH", "LTC", "XRP", "DOGE", "BNB", "ADA", "DOT", "SOL", "MATIC"];
  return coins[Math.floor(Math.random() * coins.length)];
}

function getLiquityAndVolume() {
  const totalVolume = getRandomInt(100, 1000);
  const currentLiquity = getRandomInt(1, totalVolume); // Ensure currentLiquity <= totalVolume
  return { currentLiquity, totalVolume };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Main = () => {
  const location = useLocation();
  const { connected } = useTonConnect();
  const { trigger: triggerManageReferral } = useManageReferral();
  const { trigger } = useTrackReferral();
  const [modal, setModal] = useState(false);
  const [tabSelection, setTabSelection] = useState<"list" | "create">("list");
  const [pumpList, setPumpList] = useState(PumpList);
  const [value, setValue] = useState<string[]>([]);

  const handleChange = (index: number, event: SelectChangeEvent<unknown>) => {
    const newValue = event.target.value as string;
    setValue(prev => {
      const updatedValue = [...prev];
      updatedValue[index] = newValue;
      return updatedValue;
    });
  };

  // Show welcome modal if user hasn't visited before
  useEffect(() => {
    if (tele) {
      tele.ready();
      tele.expand(); // Expand the app to full screen
      tele.BackButton.hide();
    }

    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setModal(true); // Only show modal if user hasn't visited before
    }
  }, []);

  // Track referral on app launch
  useEffect(() => {
    const trackReferral = async () => {
      if (tele) {
        tele.ready();
        const isReferred = localStorage.getItem("referrerId");

        const referralId = tele.initDataUnsafe?.start_param;
        const userId = tele.initDataUnsafe?.user?.id;
        const username = tele.initDataUnsafe?.user?.username;

        try {
          // Send referral data to the server if the user hasn't visited Referral page
          if (userId) {
            await triggerManageReferral({ userId, username });
          }

          // If user has not been referred yet, track the referral
          if (referralId && userId && !isReferred) {
            const res = await trigger({ newUserId: userId, referralLink: referralId, username });
            const { data } = res;

            if (data.success) {
              toast(
                data.username
                  ? `🎊 You were successfully referred by User @${data.username}!`
                  : "🎊 You were successfully referred!",
                {
                  position: "top-center",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  transition: Slide,
                },
              );

              localStorage.setItem("referrerId", data.referrerId);
            }
          }
        } catch (error) {
          console.error("Error tracking referral:", error);
        }
      }
    };

    trackReferral();
  }, [trigger, triggerManageReferral]);

  // Show toast message when the user has successfully staked
  useEffect(() => {
    const { state } = location;

    if (state?.isStakeSuccess) {
      toast(`Transaction approved! Your balance will be updated within the next 30 seconds.`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });

      history.replaceState(null, "");
    }
  }, [location]);

  // Toggle welcome modal
  const toggleModal = useCallback(() => {
    setModal(prev => !prev);
    localStorage.setItem("hasVisited", "true");
  }, []);

  const sortedPumpList = pumpList.sort((a, b) => a.createdTime - b.createdTime);

  return (
    <>
      {modal && <WelcomeModal toggleModal={toggleModal} />}

      <MainWrapper>
        <Header isOpen={false} text="Pump Upton" backgroundType={false} />
        <MainBorder />
        {tabSelection === "list" ? (
          <ContentContainer>
            {sortedPumpList.map((pump, index) => (
              <Card key={index} style={{ margin: "2rem", borderRadius: "16px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                <CardContent>
                  <TokenInfoContainer>
                    <CardMedia
                      component="img"
                      height="140"
                      image={pump.image}
                      alt={pump.coin}
                      style={{ borderRadius: "50%", width: "140px", marginRight: "2rem", cursor: "pointer" }}
                      onClick={() => window.open(`https://t.me/addstickers/${pump.coin}_by_pump_upton_bot`, '_blank')}
                    />
                    <TokenDetails>
                      <PumpCard>
                        <TokenName>{pump.coin}</TokenName>
                        <ViewDetailLink href="https://t.me/+xoYFZz5mSS8zY2Q1">Join community</ViewDetailLink>
                      </PumpCard>
                      <PumpCard>
                        <TokenInfo>💰Liquidity:</TokenInfo>
                        <TokenValue>{pump.currentLiquity.toLocaleString()} TON</TokenValue>
                      </PumpCard>
                      <PumpCard>
                        <TokenInfo>🍎Volume Needed:</TokenInfo>
                        <TokenValue>{pump.totalVolume.toLocaleString()} TON</TokenValue>
                      </PumpCard>
                    </TokenDetails>
                  </TokenInfoContainer>
                  <ProgressBarContainerMain>
                    <ProgressBarContainer>
                      <ProgressBarFill progress={((pump.currentLiquity * 100) / pump.totalVolume).toString()} />
                    </ProgressBarContainer>
                  </ProgressBarContainerMain>
                  <CardActions style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                    <SelectBox
                      value={value[index] || "0.1"}
                      onChange={(event) => handleChange(index, event)}
                    >
                      <MenuItem value="0.1">0.1 TON</MenuItem>
                      <MenuItem value="1">1 TON</MenuItem>
                      <MenuItem value="10">10 TON</MenuItem>
                      <MenuItem value="100">100 TON</MenuItem>
                      <MenuItem value="1000">1000 TON</MenuItem>
                    </SelectBox>
                    <PaymentButtonContainer>
                      {connected ? (
                        <PaymentButton
                          onClick={async () => {
                            const selectedValue = Number(value[index]);
                            try {
                              if (true) {
                                setPumpList(prev => {
                                  const newPumpList = [...prev];
                                  if (newPumpList[index].currentLiquity + selectedValue > newPumpList[index].totalVolume) {
                                    toast("You can't put more than total volume");
                                    return newPumpList;
                                  }
                                  newPumpList[index].currentLiquity += selectedValue;
                                  toast("Successfully Pumped");
                                  return newPumpList;
                                });
                              }
                            } catch (error) {
                              console.error("Transaction failed:", error);
                              toast("Transaction failed. Please try again.");
                            }
                          }}
                        >
                          Pay with TON
                        </PaymentButton>
                      ) : (
                        <PaymentButton onClick={() => toast("Please connect your wallet first")}>
                          Pay with TON
                        </PaymentButton>
                      )}
                    </PaymentButtonContainer>
                  </CardActions>
                </CardContent>
              </Card>
            ))}
          </ContentContainer>
        ) : (
          <ContentContainer>
            {/* Create content here */}
          </ContentContainer>
        )}
      </MainWrapper>

      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        style={{ fontSize: "7rem" }}
      />
    </>
  );
};

export default Main;

const TokenInfoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const TokenDetails = styled.div`
  flex: 1;
`;

const TokenName = styled.h2`
  font-size: 2.4rem;
  margin: 0;
`;

const ViewDetailLink = styled.a`
  font-size: 1.6rem;
  color: #1f53ff;
  text-decoration: none;
  margin-left: 1rem;
`;

const TokenInfo = styled.span`
  font-size: 1.8rem;
  color: #666;
`;

const TokenValue = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
`;

const PaymentButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const PaymentButton = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 24px;
  background-color: #1f53ff;
  color: #fff;
  cursor: pointer;
  font-size: 1.6rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0039cb;
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
    padding: 0.8rem 1.6rem;
  }
`;

const InputBox = styled.input`
  outline: none;
  border: 2px solid #1f53ff;
  border-radius: 24px;
  font-size: 1.6rem;
  padding: 1rem;
  width: 40%;
  transition: border-color 0.3s;

  &:focus {
    border-color: #0039cb;
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
    width: 30%;
  }
`;

const ProgressBarContainerMain = styled.div`
  width: 100%;
  height: auto;
  padding: 1rem 0;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0df;
  border-radius: 24px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ progress: string }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background-color: #1f53ff;
  border-radius: 24px 0 0 24px;
  transition: width 0.4s ease-in-out;
`;

const PumpCard = styled.div`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
`;

const ContentContainer = styled.div`
  padding: 1rem;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: calc(100% - 2rem);
`;

const MainWrapper = styled.div`
  width: 100%;
  height: auto;
  min-height: 100%;
  background-color: #fff;
`;

export const MainBorder = styled.div`
  width: 100%;
  height: 0.5rem;
  background-color: #f1f4f4;
`;
