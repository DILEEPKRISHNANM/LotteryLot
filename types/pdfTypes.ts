type LotteryPDFData = {
  header: {
    drawName: string;
    drawCode: string;
    drawDate: string;
  };
  body: {
    firstPrize: {
      ticket: string[];
      location: string;
      agent: string;
      agency_no: string;
    };
    consolation: {
      prize: string;
      
    };
  };
};
