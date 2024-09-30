import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Slide, toast, ToastContainer } from "react-toastify";
import styled from "styled-components";

import Header from "@/components/common/Header";
import { WelcomeModal } from "@/components/main/Modal/WelcomeModal";
import { useManageReferral } from "@/hooks/api/referral/useManageReferral";
import { useTrackReferral } from "@/hooks/api/referral/useTrackReferral";

import "react-toastify/dist/ReactToastify.css";
import { Card, CardActions } from "@mui/material";
import useTonConnect from "@/hooks/contract/useTonConnect";
const tele = (window as any).Telegram.WebApp;

const PumpList = [
  {
    coin: getRandomCoinName(),
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
  },
  {
    coin: getRandomCoinName(),
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
  },
  {
    coin: getRandomCoinName(),
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
  },
  {
    coin: getRandomCoinName(),
    ...getLiquityAndVolume(),
    createdTime: Date.now(),
  },
];

function getRandomCoinName() {
  const coins = ["BTC", "ETH", "LTC", "XRP", "DOGE", "BNB", "ADA", "DOT", "SOL", "MATIC"];
  return coins[Math.floor(Math.random() * coins.length)];
}

function getLiquityAndVolume() {
  const totalVolume = getRandomInt(1000, 10000000);
  const currentLiquity = getRandomInt(50, totalVolume); // Ensure currentLiquity <= totalVolume
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
  const [value, setValue] = useState([]);

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(prev => {
      const updatedValue = [...prev];
      updatedValue[index] = Number(newValue);
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
        {/* <TabSelectionContainer>
          <TabSelection
            active={tabSelection === "list"}
            special={false}
            onClick={() => {
              setTabSelection("list");
            }}
          >
            <List width={30} />
            <p>Pump List</p>
          </TabSelection>
          <TabSelection
            active={tabSelection === "create"}
            special={false}
            onClick={() => {
              setTabSelection("create");
            }}
          >
            <CirclePlus width={30} />
            <p>Create a Pumpt</p>
          </TabSelection>
          <TabSelection
            active={false}
            special={true}
            onClick={() => {
              window.location.href = "https://t.me/addstickers/FARM_by_pump_upton_bot";
            }}
          >
            <BadgePercent width={30} />
            <p>Add Sticker</p>
          </TabSelection>
        </TabSelectionContainer> */}
        {tabSelection === "list" ? (
          <ContentContainer>
            {sortedPumpList.map((pump, index) => (
              <Card key={index} style={{ margin: "2rem" }}>
                <PumpCard style={{ fontSize: "24px", display: "flex", gap: "1rem", marginBottom: "-1rem" }}>
                  <p>Coin Name:</p>
                  <p>
                    {pump.coin} <a href="https://google.com">view detail</a>
                  </p>
                </PumpCard>
                <PumpCard style={{ fontSize: "24px", display: "flex", gap: "1rem", marginBottom: "-1rem" }}>
                  <p>Current Liquity:</p>
                  <p>{pump.currentLiquity}</p>
                </PumpCard>
                <PumpCard style={{ fontSize: "24px", display: "flex", gap: "1rem" }}>
                  <p>Total Volumn need:</p>
                  <p>{pump.totalVolume}</p>
                </PumpCard>
                <ProgressBarContainerMain>
                  <ProgressBarContainer>
                    <ProgressBarFill progress={((pump.currentLiquity * 100) / pump.totalVolume).toString()} />
                  </ProgressBarContainer>
                </ProgressBarContainerMain>
                <CardActions style={{ display: "flex", justifyContent: "space-between" }}>
                  <InputBox
                    type="text"
                    inputMode="numeric"
                    value={value[index]}
                    onChange={event => {
                      handleChange(index, event);
                    }}
                    placeholder="amount you want to put?"
                  />
                  <PaymentButtonContainer>
                    {connected ? (
                      <>
                        <PaymentButton
                          onClick={() => {
                            setPumpList(prev => {
                              const newPumpList = [...prev];
                              if (newPumpList[index].currentLiquity + value[index] > newPumpList[index].totalVolume) {
                                toast("You can't put more than total volume");
                                return newPumpList;
                              }
                              newPumpList[index].currentLiquity += value[index];
                              toast("Successfully Pumped");
                              return newPumpList;
                            });
                          }}
                        >
                          Pay with TON
                        </PaymentButton>
                        <PaymentButton
                          onClick={() => {
                            setPumpList(prev => {
                              const newPumpList = [...prev];
                              if (newPumpList[index].currentLiquity + value[index] > newPumpList[index].totalVolume) {
                                toast("You can't put more than total volume");
                                return newPumpList;
                              }
                              newPumpList[index].currentLiquity += value[index];
                              toast("Successfully Pumped");
                              return newPumpList;
                            });
                          }}
                        >
                          Pay with ETH
                        </PaymentButton>
                        <PaymentButton
                          onClick={() => {
                            setPumpList(prev => {
                              const newPumpList = [...prev];
                              if (newPumpList[index].currentLiquity + value[index] > newPumpList[index].totalVolume) {
                                toast("You can't put more than total volume");
                                return newPumpList;
                              }
                              newPumpList[index].currentLiquity += value[index];
                              toast("Successfully Pumped");
                              return newPumpList;
                            });
                          }}
                        >
                          Pay with USDT
                        </PaymentButton>
                      </>
                    ) : (
                      <>
                        <PaymentButton onClick={() => toast("Please connect your wallet first")}>
                          Pay with TON
                        </PaymentButton>
                        <PaymentButton onClick={() => toast("Please connect your wallet first")}>
                          Pay with ETH
                        </PaymentButton>
                        <PaymentButton onClick={() => toast("Please connect your wallet first")}>
                          Pay with USDT
                        </PaymentButton>
                      </>
                    )}
                  </PaymentButtonContainer>
                </CardActions>
              </Card>
            ))}
          </ContentContainer>
        ) : (
          <ContentContainer>
            {/* <Line>
              <TokenInfo>Token Name</TokenInfo>
              <InputBox type="text" placeholder="" />
            </Line>
            <Line>
              <TokenInfo>Total Volumn Needs to Raise</TokenInfo>
              <InputBox type="text" placeholder="" />
            </Line>
            <Line>
              <TokenInfo>create</TokenInfo>
              <InputBox type="text" placeholder="" />
            </Line> */}
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

const TokenInfo = styled.div`
  display: flex;
  font-size: 2rem;
`;

const Line = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  ${({ theme }) => theme.fonts.Telegram_SemiBold};
`;

const PaymentButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const PaymentButton = styled.button`
  padding: 1rem;
  border: none;
  border-radius: 24px;
  background-color: #1f53ff;
  color: #fff;
  cursor: pointer;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const InputBox = styled.input`
  outline: none;
  border: none;
  border: 2px solid #000;
  border-radius: 24px;
  font-size: 1.5rem;
  padding: 1rem;
  width: 30%;
  @media (max-width: 768px) {
    font-size: 1rem;
    width: 20%;
  }
`;

const ProgressBarContainerMain = styled.div`
  width: 100%;
  height: auto;
  padding: 1rem;
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
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  padding: 2rem 0;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  gap: 1rem;
`;

const TabSelectionContainer = styled.div`
  padding: 1rem 1rem;
  height: 40px;
  width: 100%;
  display: flex;
  gap: 1rem;
  ${({ theme }) => theme.fonts.Telegram_SemiBold};
`;

const TabSelection = styled.div<{ active: boolean; special: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  font-size: 2rem;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 42px;
  color: #fff;
  ${({ active }) => active && "background-color: #1f53ff;"}
  ${({ special }) => special && "background: linear-gradient(90deg, red, orange);"}
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    opacity: 0.8;
  }
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
