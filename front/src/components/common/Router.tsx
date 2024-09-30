import { BrowserRouter, Route, Routes } from "react-router-dom";

import Dashboard from "@/pages/Dashboard/Dashboard";
import BorrowDetail from "@/pages/Loan/BorrowDetail";
import Loan from "@/pages/Loan/Loan";
import Main from "@/pages/Main/Main";
import Menu from "@/pages/Menu/Menu";
import MyAsset from "@/pages/MyAsset/MyAsset";
import NftList from "@/pages/MyAsset/NftList";
import StakingNftDetail from "@/pages/MyAsset/StakingNftDetail";
import UnstakingDetail from "@/pages/MyAsset/UnstakingDetail";
import UnstakingList from "@/pages/MyAsset/UnstakingList";
import Nlp from "@/pages/Nlp/Nlp";
import Referral from "@/pages/Referral/Referral";
import Amount from "@/pages/Stake/Amount";
import Leverage from "@/pages/Stake/Leverage";
import NFTPreview from "@/pages/Stake/NFTPreview";
import NominatorList from "@/pages/Stake/NominatorList";
import Swap from "@/pages/Swap/Swap";
import UnstakingBetaInfo from "@/pages/Unstaking/UnstakingBetaInfo";
import UnstakingNftDetail from "@/pages/Unstaking/UnstakingNftDetail";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
