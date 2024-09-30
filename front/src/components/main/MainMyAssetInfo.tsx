import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mutate } from "swr";

import { useBotPerformanceChart } from "@/hooks/api/dashboard/useBotPerformanceChart";
import { useBotPerformanceSummary } from "@/hooks/api/dashboard/useBotPerformanceSummary";
import { useEarningsbyAddress } from "@/hooks/api/dashboard/useEarningsbyAddress";
import { MainWrapper } from "@/pages/Menu/Menu.styled";

import MainButton from "./MainButton";

type AssetsView = "dashboard" | "asset";

const MainMyAssetInfo = ({
  address,
  refreshTonData,
}: {
  tonConnectUI: any;
  connected: boolean;
  address: string;
  balance: number;
  refreshTonData: () => Promise<void>;
  totalStaked: number;
  isLoading: boolean;
  isError: boolean;
}) => {
  const navigate = useNavigate();

  const [view, setView] = useState<AssetsView>("dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: performanceData, isLoading: performanceLoading } = useBotPerformanceSummary();
  const { data: chartData, isLoading: chartLoading } = useBotPerformanceChart(0);
  const { data: earningsData, isLoading: earningsLoading, error: earningsError } = useEarningsbyAddress(address);

  const handleViewChange = (view: AssetsView) => {
    setView(view);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        refreshTonData(),
        mutate(`/data/getAllStakeInfoByAddress?address=${address}`),
        mutate(`/data/getEarningsbyAddress/${address}`),
      ]);
    } catch (error) {
      console.error("An error occurred during the refresh operation:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <MainWrapper>
      <MainButton />
    </MainWrapper>
  );
};

export default MainMyAssetInfo;
