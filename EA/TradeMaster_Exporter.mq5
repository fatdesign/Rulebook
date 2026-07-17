//+------------------------------------------------------------------+
//|                                         TradeMaster_Exporter.mq5 |
//|                                        Copyright 2026, Limitless |
//|              https://www.mql5.com/en/users/ayvaniniyisi/seller   |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Limitless"
#property link      "https://www.mql5.com/en/users/ayvaniniyisi/seller"
#property version   "1.00"

//--- input parameters
input string   InpLicenseKey = "DEMO_KEY";      // API License Key
input int      InpMaxTrades  = 50;              // Max Trades to Export

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("TradeMaster Exporter starting...");
   
   // We call our export function right away for testing purposes
   string jsonData = ExportTradeHistory(InpMaxTrades);
   
   Print("=== TRADEMASTER EXPORTER JSON OUTPUT ===");
   Print(jsonData);
   Print("========================================");
   
   // Send to Cloudflare Worker
   SendToServer(jsonData);
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // In the final version, we will detect NEW trades here and trigger the export.
}

//+------------------------------------------------------------------+
//| Format History into JSON                                         |
//+------------------------------------------------------------------+
string ExportTradeHistory(int maxTrades)
{
   string json = "[";
   
   // Select entire history
   if(!HistorySelect(0, TimeCurrent())) {
      Print("Failed to select history!");
      return "[]";
   }
   
   int totalDeals = HistoryDealsTotal();
   ulong outDeals[];
   ArrayResize(outDeals, maxTrades);
   int found = 0;
   
   // 1. Find the last N "OUT" deals (Closing deals)
   for(int i = totalDeals - 1; i >= 0 && found < maxTrades; i--)
   {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket > 0)
      {
         long entryType = HistoryDealGetInteger(ticket, DEAL_ENTRY);
         if(entryType == DEAL_ENTRY_OUT || entryType == DEAL_ENTRY_INOUT)
         {
            outDeals[found] = ticket;
            found++;
         }
      }
   }
   
   // 2. Loop through the found outDeals to build JSON
   for(int i = 0; i < found; i++)
   {
      ulong dealTicket = outDeals[i];
      ulong positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);
      
      string symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
      double volume = HistoryDealGetDouble(dealTicket, DEAL_VOLUME);
      double profit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT);
      double swap   = HistoryDealGetDouble(dealTicket, DEAL_SWAP);
      double comm   = HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);
      long closeTime = HistoryDealGetInteger(dealTicket, DEAL_TIME);
      
      // Calculate net profit
      double netProfit = profit + swap + comm;
      
      long openTime = closeTime; // Fallback
      string side = "Unknown";
      
      // Get Open time by selecting by position ID
      if(HistorySelectByPosition(positionId))
      {
         int posDeals = HistoryDealsTotal();
         for(int j = 0; j < posDeals; j++)
         {
            ulong inDeal = HistoryDealGetTicket(j);
            if(HistoryDealGetInteger(inDeal, DEAL_ENTRY) == DEAL_ENTRY_IN)
            {
               openTime = HistoryDealGetInteger(inDeal, DEAL_TIME);
               long dealType = HistoryDealGetInteger(inDeal, DEAL_TYPE);
               side = (dealType == DEAL_TYPE_BUY) ? "Buy" : (dealType == DEAL_TYPE_SELL) ? "Sell" : "Unknown";
               break;
            }
         }
      }
      
      // Build JSON Object
      string tradeObj = "{";
      tradeObj += "\"ticket\":" + IntegerToString(positionId) + ",";
      tradeObj += "\"symbol\":\"" + symbol + "\",";
      tradeObj += "\"side\":\"" + side + "\",";
      tradeObj += "\"volume\":" + DoubleToString(volume, 2) + ",";
      tradeObj += "\"net_profit\":" + DoubleToString(netProfit, 2) + ",";
      tradeObj += "\"open_time\":" + IntegerToString(openTime) + ",";
      tradeObj += "\"close_time\":" + IntegerToString(closeTime);
      tradeObj += "}";
      
      if(i > 0) json += ",";
      json += tradeObj;
   }
   
   json += "]";
   return json;
}

//+------------------------------------------------------------------+
//| Send JSON Payload to Server via WebRequest                       |
//+------------------------------------------------------------------+
void SendToServer(string jsonPayload)
{
   string url = "https://trademaster.f-klavun.workers.dev/";
   string headers = "Content-Type: application/json\r\n";
   headers += "Authorization: " + InpLicenseKey + "\r\n";
   
   uchar data[];
   StringToCharArray(jsonPayload, data, 0, WHOLE_ARRAY, CP_UTF8);
   
   // StringToCharArray adds a null terminator at the end. WebRequest doesn't need it.
   int dataLen = ArraySize(data) - 1; 
   if(dataLen > 0) ArrayResize(data, dataLen);
   
   uchar result[];
   string resultHeaders;
   
   Print("Sending data to server: ", url);
   int res = WebRequest("POST", url, headers, 10000, data, result, resultHeaders);
   
   if(res == 200)
   {
      string responseStr = CharArrayToString(result);
      Print("Server Response: ", responseStr);
   }
   else
   {
      Print("WebRequest failed! Error code: ", res, ", GetLastError: ", GetLastError());
      Print("Make sure to add ", url, " to Tools -> Options -> Expert Advisors -> Allow WebRequest!");
   }
}
