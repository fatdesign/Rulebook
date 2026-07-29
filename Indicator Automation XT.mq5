//+------------------------------------------------------------------+
//|                                       Indicator Automation XT.mq5 |
//|                                        Copyright 2025, Limitless |
//|                                                              |
//+------------------------------------------------------------------+
#property copyright "Copyright 2026, Limitless"
#property link      "https://www.mql5.com/en/users/ayvaniniyisi/seller"
#property version   "5.70" // Add SuperTrend filter+visual line; fix session-end-close (was tied to opening session, ran too rarely in tester); fix invalid-stops on wide-min-stop-distance symbols
#property description "Indicator Automation XT - Professional Universal Signal Engine"
#property strict

#include <Trade\Trade.mqh>
#include <ChartObjects\ChartObjectsLines.mqh>
#include <ChartObjects\ChartObjectsTxtControls.mqh>

//--- ENUMS
enum ENUM_CALC_MODE {
   MODE_POINTS, // Points
   MODE_ATR     // ATR
};

enum ENUM_SESSION_TYPE_EA {
   SESSION_NONE,
   SESSION_TOKYO,
   SESSION_LONDON,
   SESSION_NY
};

//--- INPUT PARAMETERS
input group "--- Indicator Settings ---"
input string   InpIndicatorName  = "Examples\\ParabolicSAR"; // Indicator Path
input int      InpBuyBuffer      = 0;                       // Buy Signal Buffer Index
input int      InpSellBuffer     = 0;                       // Sell Signal Buffer Index
input bool     InpOnBarClose     = true;                    // Wait for Bar Close?

input group "--- Stop Loss Settings ---"
input bool          InpUseSL       = true;              // Enable Stop Loss?
input ENUM_CALC_MODE InpSLMode      = MODE_POINTS;       // SL Mode
input int           InpStopLoss    = 500;               // SL: Fixed Points (0 = Disabled)
input double        InpSLATRMult   = 2.0;               // SL: ATR Multiplier (0 = Disabled)

input group "--- Take Profit Settings ---"
input bool          InpUseTP       = true;              // Enable Take Profit?
input ENUM_CALC_MODE InpTPMode      = MODE_POINTS;       // TP Mode
input int           InpTakeProfit  = 1000;              // TP: Fixed Points (0 = Disabled)
input double        InpTPATRMult   = 4.0;               // TP: ATR Multiplier (0 = Disabled)

input group "--- Common ATR Settings ---"
input int           InpATRPeriod   = 14;                // ATR Period

input group "--- SuperTrend Filter ---"
input bool     InpUseSuperTrendFilter   = true;             // Enable SuperTrend Trend Filter?
input int      InpSuperTrendPeriod      = 10;               // SuperTrend ATR Period
input double   InpSuperTrendMultiplier  = 3.0;              // SuperTrend Multiplier
input bool     InpShowSuperTrendLine    = true;             // Draw SuperTrend Line on Chart?
input int      InpSuperTrendVisibleBars = 300;              // How Many Recent Bars to Draw

input group "--- Risk & Session Settings ---"
input bool     InpUseAutoLot     = true;                    // Enable Auto-Lot?
input double   InpRiskPercent    = 1.0;                     // Risk % per Trade
input double   InpFixedLot       = 0.1;                     // Fixed Lot (if Auto-Lot is off or SL is off)
input bool     InpUseTokyo       = true;                    // Enable Tokyo Session?
input int      InpTokyoStart     = 1;                       // Tokyo: Start Hour (Server Time)
input int      InpTokyoEnd       = 5;                       // Tokyo: End Hour (Server Time)
input int      InpTokyoMaxTrades = 4;                       // Tokyo: Max Trades (0 = Disabled)
input bool     InpTokyoCloseAtEnd= false;                   // Tokyo: Close Trades at Session End?
input bool     InpUseLondon      = true;                    // Enable London Session?
input int      InpLondonStart    = 10;                      // London: Start Hour (Server Time)
input int      InpLondonEnd      = 14;                      // London: End Hour (Server Time)
input int      InpLondonMaxTrades= 4;                       // London: Max Trades (0 = Disabled)
input bool     InpLondonCloseAtEnd=false;                   // London: Close Trades at Session End?
input bool     InpUseNY          = true;                    // Enable New York Session?
input int      InpNYStart        = 14;                      // New York: Start Hour (Server Time)
input int      InpNYEnd          = 19;                      // New York: End Hour (Server Time)
input int      InpNYMaxTrades    = 4;                       // NY: Max Trades (0 = Disabled)
input bool     InpNYCloseAtEnd   = false;                   // NY: Close Trades at Session End?

input group "--- Profit Protection (Trailing/BE) ---"
input bool     InpUseTrailing    = false;                   // Enable Trailing Stop?
input int      InpTrailingStop   = 300;                     // Trailing Stop (Points)
input int      InpTrailingStep   = 50;                      // Trailing Step (Points)
input bool     InpUseBreakEven   = false;                   // Enable Break-Even?
input int      InpBETrigger      = 400;                     // BE Trigger (Points)
input int      InpBEPoints       = 50;                      // BE Offset (Points)

input group "--- Partial Close Settings ---"
input bool     InpUsePartialClose= false;                   // Enable Partial Close?
input int      InpPCTrigger      = 500;                     // Profit Points for Partial Close
input double   InpPCPercent      = 50.0;                    // % volume to close

input group "--- Account Protection ---"
input bool     InpUseMaxDailyLoss= true;                    // Enable Max Daily Loss Protection?
input double   InpMaxDailyLossPct= 2.0;                     // Max Daily Loss % (Equity, 0 = Disabled)
input bool     InpUseMaxSpread   = true;                    // Enable Max Spread Filter?
input int      InpMaxSpread      = 50;                      // Max Allowed Spread (Points, 0 = Disabled)
input int      InpMaxTradesDay   = 10;                      // Max Trades per Day (0 = Disabled)

input group "--- Visual Settings ---"
input bool     InpShowDashboard  = true;                    // Show Info Panel?

input group "--- Expert Settings ---"
input int      InpMagic          = 123456;                  // Magic Number
input bool     InpReversal       = true;                    // Close opposite signals
input bool     InpSendPush       = true;                    // Notifications

//--- GLOBAL VARIABLES
int      m_handle    = INVALID_HANDLE;
int      m_atrHandle = INVALID_HANDLE;
int      m_stAtrHandle = INVALID_HANDLE;
CTrade   m_trade;
datetime m_lastBarTime      = 0;
bool     m_protectionHalted = false;

//--- PERFORMANCE CACHE ---
// Cache für teure HistorySelect-Aufrufe
double   m_cachedDailyPnLPct  = 0.0;
int      m_cachedTradesToday   = 0;
datetime m_lastProtectionCheck = 0;
datetime m_lastDayChecked      = 0;   // Tag, für den der Cache gilt

// Throttle für ManagePositions (nur alle N Ticks)
int      m_tickCounter         = 0;
const int MANAGE_EVERY_N_TICKS = 5;   // ManagePositions alle 5 Ticks

//--- DASHBOARD OBJECTS
CChartObjectLabel m_lblBg, m_lblProfit, m_lblSpread, m_lblStatus, m_lblSession, m_lblSuperTrend;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(InpIndicatorName == "") { Print("Error: Identifier empty!"); return(INIT_PARAMETERS_INCORRECT); }
   m_handle = iCustom(_Symbol, _Period, InpIndicatorName);
   if(m_handle == INVALID_HANDLE) { Print("Error: Handle failed!"); return(INIT_FAILED); }
   m_atrHandle = iATR(_Symbol, _Period, InpATRPeriod);
   if(InpUseSuperTrendFilter || InpShowSuperTrendLine)
   {
      m_stAtrHandle = iATR(_Symbol, _Period, InpSuperTrendPeriod);
      if(m_stAtrHandle == INVALID_HANDLE) { Print("Error: SuperTrend ATR handle failed!"); return(INIT_FAILED); }
   }
   m_trade.SetExpertMagicNumber(InpMagic);
   
   // Cache invalidieren
   m_lastProtectionCheck = 0;
   m_lastDayChecked      = 0;
   m_cachedDailyPnLPct   = 0.0;
   m_cachedTradesToday   = 0;
   m_tickCounter         = 0;
   
   InitDashboard();
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(m_handle != INVALID_HANDLE) IndicatorRelease(m_handle);
   if(m_atrHandle != INVALID_HANDLE) IndicatorRelease(m_atrHandle);
   if(m_stAtrHandle != INVALID_HANDLE) IndicatorRelease(m_stAtrHandle);
   ObjectsDeleteAll(0, "IAXT_ST_");
   DeinitDashboard();
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   m_tickCounter++;

   // 0. SuperTrend line visualization - once per new bar, independent of
   //    InpOnBarClose (that setting only affects signal timing, not drawing)
   if(InpShowSuperTrendLine)
   {
      static datetime lastSTBarTime = 0;
      datetime curBarTime = iTime(_Symbol, _Period, 0);
      if(curBarTime != lastSTBarTime)
      {
         lastSTBarTime = curBarTime;
         UpdateSuperTrendLine();
      }
   }

   // 1. Protection Check — nur 1x pro Minute (nicht jeden Tick!)
   datetime currentTime = TimeCurrent();
   if(currentTime - m_lastProtectionCheck >= 60) // alle 60 Sekunden
   {
      RefreshProtectionCache();
      m_lastProtectionCheck = currentTime;
   }

   bool dailyLossTriggered = InpUseMaxDailyLoss && InpMaxDailyLossPct > 0 && m_cachedDailyPnLPct <= -InpMaxDailyLossPct;
   bool maxTradesTriggered = InpMaxTradesDay > 0 && m_cachedTradesToday >= InpMaxTradesDay;

   if(dailyLossTriggered || maxTradesTriggered)
   {
      if(!m_protectionHalted) {
         CloseAllPositions();
         m_protectionHalted = true;
         if(dailyLossTriggered)
            PrintFormat("DAILY PROTECTION TRIGGERED: Max Daily Loss of %.2f%% reached (Current: %.2f%%). Trading stopped for today.", InpMaxDailyLossPct, m_cachedDailyPnLPct);
         else
            PrintFormat("DAILY PROTECTION TRIGGERED: Max Trades per Day (%d) reached. Trading stopped for today.", InpMaxTradesDay);
      }
   }
   
   // 2. Manage Positions — gedrosselt, nicht jeden Tick
   if(m_tickCounter % MANAGE_EVERY_N_TICKS == 0)
   {
      ManagePositions();
   }

   // Session-end close is cheap (just a position loop + time arithmetic) and
   // time-critical - throttling it the same way as ManagePositions() meant
   // that in tester modes with few ticks per bar (Open Prices Only, 1-Minute
   // OHLC) it could miss the exact session-end moment for many bars in a row,
   // making it look like it wasn't working at all. Runs every tick now.
   CheckSessionEndClose();

   // 3. New Signal Logic
   datetime currentBarTime = iTime(_Symbol, _Period, 0);
   if(InpOnBarClose)
   {
      if(m_lastBarTime == currentBarTime) return;
      m_lastBarTime = currentBarTime;
   }

   // 4. Filters (Sessions, Spread, Protection)
   if(m_protectionHalted) return;
   
   ENUM_SESSION_TYPE_EA activeSession = GetActiveSession();
   if(activeSession == SESSION_NONE) return;

   // Check Session Trade Limit
   int allowedTrades = 0;
   if(activeSession == SESSION_TOKYO)  allowedTrades = InpTokyoMaxTrades;
   else if(activeSession == SESSION_LONDON) allowedTrades = InpLondonMaxTrades;
   else if(activeSession == SESSION_NY)     allowedTrades = InpNYMaxTrades;

   if(allowedTrades > 0) {
      if(GetSessionTradeCount(activeSession) >= allowedTrades) {
         UpdateDashboard();
         return;
      }
   }
   
   int spread = (int)SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   if(InpUseMaxSpread && InpMaxSpread > 0 && spread > InpMaxSpread) {
      UpdateDashboard();
      return;
   }

   // 5. Signals
   double buyVal[], sellVal[];
   ArraySetAsSeries(buyVal, true); ArraySetAsSeries(sellVal, true);
   int startPos = InpOnBarClose ? 1 : 0;
   
   if(CopyBuffer(m_handle, InpBuyBuffer, startPos, 1, buyVal) <= 0) return;
   if(CopyBuffer(m_handle, InpSellBuffer, startPos, 1, sellVal) <= 0) return;

   bool isBuy  = (buyVal[0] != EMPTY_VALUE && buyVal[0] != 0);
   bool isSell = (sellVal[0] != EMPTY_VALUE && sellVal[0] != 0);

   if(InpUseSuperTrendFilter && (isBuy || isSell))
   {
      int stDir = GetSuperTrendDirection(); // 1 = bullish (green), -1 = bearish (red), 0 = unavailable
      if(isBuy  && stDir != 1)  isBuy  = false;
      if(isSell && stDir != -1) isSell = false;
   }

   if(isBuy)  ExecuteOrder(ORDER_TYPE_BUY);
   if(isSell) ExecuteOrder(ORDER_TYPE_SELL);
   
   UpdateDashboard();
}

//+------------------------------------------------------------------+
//| Cache für teure Protection-Berechnungen auffrischen              |
//| Wird nur alle 60s aufgerufen, nicht jeden Tick!                  |
//+------------------------------------------------------------------+
void RefreshProtectionCache()
{
   double balance = AccountInfoDouble(ACCOUNT_BALANCE);
   if(balance <= 0) { m_cachedDailyPnLPct = 0.0; m_cachedTradesToday = 0; return; }

   datetime startOfDay = iTime(_Symbol, PERIOD_D1, 0);

   // Prüfen ob ein neuer Tag begonnen hat → Cache zurücksetzen und Protection aufheben
   if(startOfDay != m_lastDayChecked)
   {
      m_cachedTradesToday = 0;
      m_lastDayChecked    = startOfDay;
      if(m_protectionHalted) {
         m_protectionHalted = false;
         Print("NEW DAY DETECTED. Daily protection limit reset. Trading resumed.");
      }
   }

   double closedProfitToday = 0.0;
   int    tradesCount        = 0;

   if(HistorySelect(startOfDay, TimeCurrent()))
   {
      int total = HistoryDealsTotal();
      for(int i = 0; i < total; i++)
      {
         ulong ticket = HistoryDealGetTicket(i);
         closedProfitToday += HistoryDealGetDouble(ticket, DEAL_PROFIT);
         closedProfitToday += HistoryDealGetDouble(ticket, DEAL_COMMISSION);
         closedProfitToday += HistoryDealGetDouble(ticket, DEAL_SWAP);
         
         if(HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN &&
            HistoryDealGetInteger(ticket, DEAL_MAGIC) == InpMagic)
            tradesCount++;
      }
   }

   double floatingPnL = AccountInfoDouble(ACCOUNT_PROFIT);
   m_cachedDailyPnLPct = (closedProfitToday + floatingPnL) / balance * 100.0;
   m_cachedTradesToday  = tradesCount;
}

//+------------------------------------------------------------------+
//| Close all EA positions                                           |
//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetInteger(POSITION_MAGIC) == InpMagic && PositionGetString(POSITION_SYMBOL) == _Symbol)
            m_trade.PositionClose(ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Position Management (Trailing, BE, Partial)                      |
//+------------------------------------------------------------------+
void ManagePositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(PositionSelectByTicket(ticket))
      {
         if(PositionGetInteger(POSITION_MAGIC) == InpMagic && PositionGetString(POSITION_SYMBOL) == _Symbol)
         {
            double entryPrice = PositionGetDouble(POSITION_PRICE_OPEN);
            double currentSL  = PositionGetDouble(POSITION_SL);
            double vol        = PositionGetDouble(POSITION_VOLUME);
            ENUM_POSITION_TYPE type = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
            double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
            double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
            double profitPoints = (type == POSITION_TYPE_BUY) ? (bid - entryPrice) / _Point : (entryPrice - ask) / _Point;

            // --- PARTIAL CLOSE ---
            if(InpUsePartialClose && profitPoints >= InpPCTrigger)
            {
               if(vol > 0.01)
               {
                  double lotToClose = vol * InpPCPercent / 100.0;
                  double minLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
                  lotToClose = MathRound(lotToClose / SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP)) * SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
                  
                  if(lotToClose >= minLot && lotToClose < vol)
                  {
                     if(m_trade.PositionClose(ticket, lotToClose))
                     {
                        double targetBE = (type == POSITION_TYPE_BUY) ? entryPrice + InpBEPoints * _Point : entryPrice - InpBEPoints * _Point;
                        m_trade.PositionModify(ticket, NormalizeDouble(targetBE, _Digits), PositionGetDouble(POSITION_TP));
                        Print("Partial Close Executed. Remaining moved to BE.");
                        continue;
                     }
                  }
               }
            }

            // --- BREAK EVEN ---
            if(InpUseBreakEven && profitPoints >= InpBETrigger)
            {
               double targetBE = (type == POSITION_TYPE_BUY) ? entryPrice + InpBEPoints * _Point : entryPrice - InpBEPoints * _Point;
               if((type == POSITION_TYPE_BUY && (currentSL < targetBE || currentSL == 0)) ||
                  (type == POSITION_TYPE_SELL && (currentSL > targetBE || currentSL == 0)))
               {
                  m_trade.PositionModify(ticket, NormalizeDouble(targetBE, _Digits), PositionGetDouble(POSITION_TP));
               }
            }

            // --- TRAILING ---
            if(InpUseTrailing)
            {
               if(type == POSITION_TYPE_BUY && bid - entryPrice > InpTrailingStop * _Point)
               {
                  if(bid - InpTrailingStop * _Point > currentSL + InpTrailingStep * _Point || currentSL == 0)
                     m_trade.PositionModify(ticket, NormalizeDouble(bid - InpTrailingStop * _Point, _Digits), PositionGetDouble(POSITION_TP));
               }
               else if(type == POSITION_TYPE_SELL && entryPrice - ask > InpTrailingStop * _Point)
               {
                  if(ask + InpTrailingStop * _Point < currentSL - InpTrailingStep * _Point || currentSL == 0)
                     m_trade.PositionModify(ticket, NormalizeDouble(ask + InpTrailingStop * _Point, _Digits), PositionGetDouble(POSITION_TP));
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Dashboard Logic                                                  |
//+------------------------------------------------------------------+
void InitDashboard()
{
   if(!InpShowDashboard) return;
   
   int x = 10, y = 300;

   CreateLabel(m_lblBg,      "lblBg",      x,    y,    160, 130, " ",              10, clrDarkSlateGray);
   CreateLabel(m_lblProfit,  "lblProfit",  x+10, y+10, 0,   0,   "Daily PnL: 0.00%", 10, clrWhite);
   CreateLabel(m_lblSpread,  "lblSpread",  x+10, y+30, 0,   0,   "Spread: 0",      10, clrWhite);
   CreateLabel(m_lblSession, "lblSession", x+10, y+50, 0,   0,   "Session: N/A",   10, clrAqua);
   CreateLabel(m_lblStatus,  "lblStatus",  x+10, y+70, 0,   0,   "Status: OK",     10, clrSpringGreen);
   CreateLabel(m_lblSuperTrend, "lblSuperTrend", x+10, y+90, 0, 0, "SuperTrend: N/A", 10, clrWhite);
}

void UpdateDashboard()
{
   if(!InpShowDashboard) return;
   
   // Gecachten Wert verwenden — kein HistorySelect hier!
   double pnl = m_cachedDailyPnLPct;
   m_lblProfit.Description(StringFormat("Daily PnL: %.2f%%", pnl));
   m_lblProfit.Color(pnl >= 0 ? clrSpringGreen : clrTomato);
   
   int spread = (int)SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   bool spreadExceeded = InpUseMaxSpread && InpMaxSpread > 0 && spread > InpMaxSpread;
   if(InpUseMaxSpread && InpMaxSpread > 0)
      m_lblSpread.Description(StringFormat("Spread: %d %s", spread, (spreadExceeded ? "(!)" : "")));
   else
      m_lblSpread.Description(StringFormat("Spread: %d (Disabled)", spread));
   m_lblSpread.Color(spreadExceeded ? clrTomato : clrWhite);
   
   string session = "CLOSED";
   ENUM_SESSION_TYPE_EA activeSession = GetActiveSession();
   if(activeSession == SESSION_TOKYO) {
      int taken = GetSessionTradeCount(SESSION_TOKYO);
      if(InpTokyoMaxTrades > 0)
         session = StringFormat("TOKYO (%d/%d)", taken, InpTokyoMaxTrades);
      else
         session = StringFormat("TOKYO (%d)", taken);
   }
   else if(activeSession == SESSION_LONDON) {
      int taken = GetSessionTradeCount(SESSION_LONDON);
      if(InpLondonMaxTrades > 0)
         session = StringFormat("LONDON (%d/%d)", taken, InpLondonMaxTrades);
      else
         session = StringFormat("LONDON (%d)", taken);
   }
   else if(activeSession == SESSION_NY) {
      int taken = GetSessionTradeCount(SESSION_NY);
      if(InpNYMaxTrades > 0)
         session = StringFormat("NY (%d/%d)", taken, InpNYMaxTrades);
      else
         session = StringFormat("NY (%d)", taken);
   }
   
   m_lblSession.Description("Session: " + session);

   if(InpUseSuperTrendFilter)
   {
      int stDir = GetSuperTrendDirection();
      string stText = (stDir == 1) ? "Bullish" : (stDir == -1) ? "Bearish" : "N/A";
      m_lblSuperTrend.Description("SuperTrend: " + stText);
      m_lblSuperTrend.Color(stDir == 1 ? clrSpringGreen : (stDir == -1 ? clrTomato : clrWhite));
   }
   else
   {
      m_lblSuperTrend.Description("SuperTrend: Disabled");
      m_lblSuperTrend.Color(clrGray);
   }

   if(m_protectionHalted) {
      m_lblStatus.Description("Status: PROTECTED");
      m_lblStatus.Color(clrTomato);
   } else {
      m_lblStatus.Description("Status: RUNNING");
      m_lblStatus.Color(clrSpringGreen);
   }
}

void DeinitDashboard()
{
   m_lblBg.Delete(); m_lblProfit.Delete(); m_lblSpread.Delete(); m_lblStatus.Delete(); m_lblSession.Delete(); m_lblSuperTrend.Delete();
}

void CreateLabel(CChartObjectLabel &obj, string name, int x, int y, int w, int h, string text, int size, color clr)
{
   obj.Create(0, name, 0, x, y);
   obj.Description(text);
   obj.FontSize(size);
   obj.Color(clr);
   obj.Corner(CORNER_LEFT_UPPER);
   if(w > 0) {
      ObjectSetInteger(0, name, OBJPROP_XSIZE, w);
      ObjectSetInteger(0, name, OBJPROP_YSIZE, h);
   }
}

//+------------------------------------------------------------------+
//| Helper Functions                                                 |
//+------------------------------------------------------------------+
//+------------------------------------------------------------------+
//| Recomputes the classic SuperTrend recursively over a lookback      |
//| window (MQL5 has no built-in SuperTrend). Shared by the filter     |
//| direction check and the chart visualization so both always agree.  |
//+------------------------------------------------------------------+
bool ComputeSuperTrendArrays(MqlRates &rates[], double &finalUpper[], double &finalLower[], double &supertrend[], int &n)
{
   int bars = InpSuperTrendPeriod * 10 + 50; // enough history for the recursive bands to converge
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(_Symbol, _Period, 0, bars, rates);
   if(copied < InpSuperTrendPeriod + 10) return false;

   double atrBuf[];
   ArraySetAsSeries(atrBuf, true);
   if(CopyBuffer(m_stAtrHandle, 0, 0, copied, atrBuf) <= 0) return false;

   n = copied;
   ArrayResize(finalUpper, n);
   ArrayResize(finalLower, n);
   ArrayResize(supertrend, n);

   for(int idx = n - 1; idx >= 0; idx--) // idx = n-1 oldest ... idx = 0 newest
   {
      double atr = atrBuf[idx];
      double mid = (rates[idx].high + rates[idx].low) / 2.0;
      double basicUpper = mid + InpSuperTrendMultiplier * atr;
      double basicLower = mid - InpSuperTrendMultiplier * atr;

      if(idx == n - 1)
      {
         finalUpper[idx] = basicUpper;
         finalLower[idx] = basicLower;
         supertrend[idx] = (rates[idx].close <= basicUpper) ? basicUpper : basicLower;
         continue;
      }

      int p = idx + 1; // one bar older
      finalUpper[idx] = (basicUpper < finalUpper[p] || rates[p].close > finalUpper[p]) ? basicUpper : finalUpper[p];
      finalLower[idx] = (basicLower > finalLower[p] || rates[p].close < finalLower[p]) ? basicLower : finalLower[p];

      if(supertrend[p] == finalUpper[p])
         supertrend[idx] = (rates[idx].close <= finalUpper[idx]) ? finalUpper[idx] : finalLower[idx];
      else
         supertrend[idx] = (rates[idx].close >= finalLower[idx]) ? finalLower[idx] : finalUpper[idx];
   }

   return true;
}

//+------------------------------------------------------------------+
//| Direction as of the relevant bar (bar-close or current, matching   |
//| InpOnBarClose): +1 = bullish/green, -1 = bearish/red, 0 = n/a.      |
//+------------------------------------------------------------------+
int GetSuperTrendDirection()
{
   MqlRates rates[];
   double finalUpper[], finalLower[], supertrend[];
   int n;
   if(!ComputeSuperTrendArrays(rates, finalUpper, finalLower, supertrend, n))
      return 0;

   int checkShift = InpOnBarClose ? 1 : 0;
   if(checkShift >= n) return 0;

   return (supertrend[checkShift] == finalLower[checkShift]) ? 1 : -1;
}

//+------------------------------------------------------------------+
//| Draws/extends the SuperTrend line on the chart: one short segment  |
//| per newly closed bar, colored by trend direction. Old segments      |
//| beyond InpSuperTrendVisibleBars are pruned so object count stays    |
//| bounded during long Strategy Tester runs.                          |
//+------------------------------------------------------------------+
void UpdateSuperTrendLine()
{
   MqlRates rates[];
   double finalUpper[], finalLower[], supertrend[];
   int n;
   if(!ComputeSuperTrendArrays(rates, finalUpper, finalLower, supertrend, n))
      return;
   if(n < 3)
      return;

   bool bullish = (supertrend[1] == finalLower[1]);
   string name = "IAXT_ST_" + IntegerToString((long)rates[1].time);

   if(ObjectFind(0, name) < 0)
   {
      ObjectCreate(0, name, OBJ_TREND, 0, rates[2].time, supertrend[2], rates[1].time, supertrend[1]);
      ObjectSetInteger(0, name, OBJPROP_COLOR, bullish ? clrLime : clrRed);
      ObjectSetInteger(0, name, OBJPROP_WIDTH, 2);
      ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
      ObjectSetInteger(0, name, OBJPROP_RAY_LEFT, false);
      ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
      ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
   }

   int cutoffIdx = MathMin(InpSuperTrendVisibleBars, n - 1);
   PruneOldSuperTrendObjects(rates[cutoffIdx].time);
}

void PruneOldSuperTrendObjects(datetime cutoff)
{
   int prefixLen = StringLen("IAXT_ST_");
   for(int i = ObjectsTotal(0, -1, OBJ_TREND) - 1; i >= 0; i--)
   {
      string name = ObjectName(0, i, -1, OBJ_TREND);
      if(StringFind(name, "IAXT_ST_") != 0)
         continue;
      datetime t = (datetime)StringToInteger(StringSubstr(name, prefixLen));
      if(t > 0 && t < cutoff)
         ObjectDelete(0, name);
   }
}

double GetDistanceLimit(ENUM_CALC_MODE mode, int points, double multiplier)
{
   if(mode == MODE_POINTS) return (points > 0) ? (double)points : 0.0;
   if(multiplier <= 0.0) return 0.0;
   double atr[]; ArraySetAsSeries(atr, true);
   if(CopyBuffer(m_atrHandle, 0, 0, 1, atr) <= 0) return (points > 0) ? (double)points : 0.0;
   return MathRound(atr[0] * multiplier / _Point);
}

//+------------------------------------------------------------------+
//| Some symbols (esp. synthetic indices like Volatility 75/Boom/Crash |
//| on Deriv) enforce a much larger minimum SL/TP distance from price   |
//| than typical Forex/CFD symbols. Sending a stop tighter than this    |
//| gets rejected as "invalid stops" - this reads the broker's actual   |
//| requirement per symbol and widens the distance if needed, so the    |
//| EA adapts automatically instead of failing on some symbols.         |
//+------------------------------------------------------------------+
double GetMinStopDistancePoints()
{
   long stopsLevel  = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   long freezeLevel = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   double minLevel = (double)MathMax(stopsLevel, freezeLevel);
   return minLevel + 2; // small buffer against price movement/spread before the order reaches the server
}

ENUM_SESSION_TYPE_EA GetActiveSession()
{
   MqlDateTime dt; TimeCurrent(dt);
   int h = dt.hour;
   if(InpUseTokyo  && h >= InpTokyoStart  && h < InpTokyoEnd)  return SESSION_TOKYO;
   if(InpUseLondon && h >= InpLondonStart && h < InpLondonEnd) return SESSION_LONDON;
   if(InpUseNY     && h >= InpNYStart     && h < InpNYEnd)     return SESSION_NY;
   return SESSION_NONE;
}

int GetSessionTradeCount(ENUM_SESSION_TYPE_EA session)
{
   if(session == SESSION_NONE) return 0;
   
   datetime todayStart = iTime(_Symbol, PERIOD_D1, 0);
   if(todayStart <= 0) return 0;
   
   datetime sessionStart = 0;
   datetime sessionEnd = 0;
   
   if(session == SESSION_TOKYO) {
      sessionStart = todayStart + InpTokyoStart * 3600;
      sessionEnd   = todayStart + InpTokyoEnd * 3600;
   }
   else if(session == SESSION_LONDON) {
      sessionStart = todayStart + InpLondonStart * 3600;
      sessionEnd   = todayStart + InpLondonEnd * 3600;
   }
   else if(session == SESSION_NY) {
      sessionStart = todayStart + InpNYStart * 3600;
      sessionEnd   = todayStart + InpNYEnd * 3600;
   }
   
   int count = 0;
   if(HistorySelect(sessionStart, TimeCurrent())) {
      int total = HistoryDealsTotal();
      for(int i = 0; i < total; i++) {
         ulong ticket = HistoryDealGetTicket(i);
         if(ticket > 0) {
            datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
            if(dealTime >= sessionStart && dealTime < sessionEnd) {
               if(HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN &&
                  HistoryDealGetInteger(ticket, DEAL_MAGIC) == InpMagic) {
                  count++;
               }
            }
         }
      }
   }
   return count;
}

bool IsWithinTradingHours()
{
   return (GetActiveSession() != SESSION_NONE);
}

double CalculateLotSize(double slPoints)
{
   if(!InpUseAutoLot || slPoints <= 0) return InpFixedLot;
   double riskAmount = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPercent / 100.0;
   double tickValue  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double tickSize   = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tickValue <= 0 || tickSize <= 0) return InpFixedLot;
   double lot     = riskAmount / (slPoints * _Point / tickSize * tickValue);
   double stepLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   lot = MathFloor(lot / stepLot) * stepLot;
   return MathMax(SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN), MathMin(SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX), lot));
}

void ExecuteOrder(ENUM_ORDER_TYPE type)
{
   PrintFormat("ExecuteOrder called. Type: %s, InpReversal: %s, PositionsTotal: %d", 
               EnumToString(type), string(InpReversal), PositionsTotal());

   if(InpReversal) {
      for(int i = PositionsTotal() - 1; i >= 0; i--) {
         ulong ticket = PositionGetTicket(i);
         if(ticket > 0) {
            if(PositionGetInteger(POSITION_MAGIC) == InpMagic && PositionGetString(POSITION_SYMBOL) == _Symbol) {
               long posType = PositionGetInteger(POSITION_TYPE);
               PrintFormat("Checking position index %d (ticket %d): Type=%s, Magic=%d", 
                           i, ticket, EnumToString((ENUM_POSITION_TYPE)posType), PositionGetInteger(POSITION_MAGIC));
               if((type == ORDER_TYPE_BUY  && posType == POSITION_TYPE_SELL) ||
                  (type == ORDER_TYPE_SELL && posType == POSITION_TYPE_BUY)) {
                  PrintFormat("Opposite position found. Closing ticket %d...", ticket);
                  bool res = m_trade.PositionClose(ticket);
                  PrintFormat("PositionClose result: %s", string(res));
               }
            }
         }
      }
   }
   if(HasPosition(type)) {
      PrintFormat("Position of type %s already exists. Returning early.", EnumToString(type));
      return;
   }
   double slDist = InpUseSL ? GetDistanceLimit(InpSLMode, InpStopLoss, InpSLATRMult) : 0.0;
   double tpDist = InpUseTP ? GetDistanceLimit(InpTPMode, InpTakeProfit, InpTPATRMult) : 0.0;

   double minStopPoints = GetMinStopDistancePoints();
   if(slDist > 0 && slDist < minStopPoints)
   {
      PrintFormat("SL distance %.0f points is below %s's minimum stop level (%.0f) - widening to avoid 'invalid stops'.", slDist, _Symbol, minStopPoints);
      slDist = minStopPoints;
   }
   if(tpDist > 0 && tpDist < minStopPoints)
   {
      PrintFormat("TP distance %.0f points is below %s's minimum stop level (%.0f) - widening to avoid 'invalid stops'.", tpDist, _Symbol, minStopPoints);
      tpDist = minStopPoints;
   }

   double price  = (type == ORDER_TYPE_BUY) ? SymbolInfoDouble(_Symbol, SYMBOL_ASK) : SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double sl     = (slDist > 0) ? ((type == ORDER_TYPE_BUY) ? price - slDist * _Point : price + slDist * _Point) : 0;
   double tp     = (tpDist > 0) ? ((type == ORDER_TYPE_BUY) ? price + tpDist * _Point : price - tpDist * _Point) : 0;
   double lot    = CalculateLotSize(slDist);
   if(type == ORDER_TYPE_BUY)
      m_trade.Buy(lot, _Symbol, NormalizeDouble(price, _Digits), NormalizeDouble(sl, _Digits), NormalizeDouble(tp, _Digits));
   else
      m_trade.Sell(lot, _Symbol, NormalizeDouble(price, _Digits), NormalizeDouble(sl, _Digits), NormalizeDouble(tp, _Digits));
   if(InpSendPush) SendNotification("EA Alert: " + EnumToString(type));
}

bool HasPosition(ENUM_ORDER_TYPE type)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--) {
      ulong ticket = PositionGetTicket(i);
      if(ticket > 0) {
         if(PositionGetInteger(POSITION_MAGIC) == InpMagic && PositionGetString(POSITION_SYMBOL) == _Symbol) {
            long posType = PositionGetInteger(POSITION_TYPE);
            if((type == ORDER_TYPE_BUY  && posType == POSITION_TYPE_BUY) ||
               (type == ORDER_TYPE_SELL && posType == POSITION_TYPE_SELL)) return true;
         }
      }
   }
   return false;
}

//+------------------------------------------------------------------+
//| Closes any still-open position once an enabled "close at end"     |
//| session's end time passes TODAY - independent of which session   |
//| the position happened to open in. A position opened during London |
//| must still be closed at NY's end if InpNYCloseAtEnd is on and the  |
//| position is still open when NY ends; the old version only ever    |
//| matched a position against the single session it opened in, so a  |
//| London-opened trade with only NY-close-at-end enabled would never  |
//| get closed at all.                                                 |
//+------------------------------------------------------------------+
void CheckSessionEndClose()
{
   if(!InpTokyoCloseAtEnd && !InpLondonCloseAtEnd && !InpNYCloseAtEnd)
      return;

   datetime currentTime = TimeCurrent();
   MqlDateTime nowDt;
   TimeToStruct(currentTime, nowDt);
   datetime todayStart = currentTime - (nowDt.hour * 3600 + nowDt.min * 60 + nowDt.sec);

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket <= 0)
         continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic || PositionGetString(POSITION_SYMBOL) != _Symbol)
         continue;

      datetime posTime = (datetime)PositionGetInteger(POSITION_TIME);
      bool shouldClose = false;

      if(InpUseTokyo && InpTokyoCloseAtEnd)
      {
         datetime sessionEnd = todayStart + InpTokyoEnd * 3600;
         if(posTime < sessionEnd && currentTime >= sessionEnd) shouldClose = true;
      }
      if(InpUseLondon && InpLondonCloseAtEnd)
      {
         datetime sessionEnd = todayStart + InpLondonEnd * 3600;
         if(posTime < sessionEnd && currentTime >= sessionEnd) shouldClose = true;
      }
      if(InpUseNY && InpNYCloseAtEnd)
      {
         datetime sessionEnd = todayStart + InpNYEnd * 3600;
         if(posTime < sessionEnd && currentTime >= sessionEnd) shouldClose = true;
      }

      if(shouldClose)
      {
         PrintFormat("Session End reached for position ticket %d. Closing position...", ticket);
         m_trade.PositionClose(ticket);
      }
   }
}
