import { TimeEngine } from "./time-engine.ts";

export interface ExchangeRecord {
  id: string;
  name: string;
  code: string;
  cityId: string;
  cityName: string;
  country: string;
  timezone: string;
  openHour: number;
  openMinute: number;
  closeHour: number;
  closeMinute: number;
  flag: string;
}

export interface MarketStatus {
  exchange: ExchangeRecord;
  isOpen: boolean;
  statusText: string;
  localTimeFormatted: string;
  isWeekend: boolean;
  sessionState: "open" | "closed" | "pre-market" | "weekend";
}

export const FINANCIAL_EXCHANGES: ExchangeRecord[] = [
  {
    id: "nyse",
    name: "New York Stock Exchange / NASDAQ",
    code: "NYSE",
    cityId: "new-york",
    cityName: "New York",
    country: "United States",
    timezone: "America/New_York",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
    flag: "🇺🇸",
  },
  {
    id: "lse",
    name: "London Stock Exchange",
    code: "LSE",
    cityId: "london",
    cityName: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    openHour: 8,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 30,
    flag: "🇬🇧",
  },
  {
    id: "tse",
    name: "Tokyo Stock Exchange",
    code: "TSE",
    cityId: "tokyo",
    cityName: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    openHour: 9,
    openMinute: 0,
    closeHour: 15,
    closeMinute: 0,
    flag: "🇯🇵",
  },
  {
    id: "hkex",
    name: "Hong Kong Stock Exchange",
    code: "HKEX",
    cityId: "hong-kong",
    cityName: "Hong Kong",
    country: "Hong Kong",
    timezone: "Asia/Hong_Kong",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
    flag: "🇭🇰",
  },
  {
    id: "fwb",
    name: "Frankfurt Stock Exchange (Xetra)",
    code: "FWB",
    cityId: "berlin",
    cityName: "Frankfurt / Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
    openHour: 9,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 30,
    flag: "🇩🇪",
  },
  {
    id: "asx",
    name: "Australian Securities Exchange",
    code: "ASX",
    cityId: "sydney",
    cityName: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    openHour: 10,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
    flag: "🇦🇺",
  },
];

export class MarketHoursEngine {
  private engine: TimeEngine;

  constructor() {
    this.engine = new TimeEngine();
  }

  getAllExchanges(): ExchangeRecord[] {
    return FINANCIAL_EXCHANGES;
  }

  getExchangeById(id: string): ExchangeRecord | null {
    return FINANCIAL_EXCHANGES.find((e) => e.id === id.toLowerCase().trim()) || null;
  }

  getExchangeForCity(cityId: string): ExchangeRecord | null {
    return FINANCIAL_EXCHANGES.find((e) => e.cityId === cityId.toLowerCase().trim()) || null;
  }

  /**
   * Evaluates real-time trading status for an exchange.
   */
  getMarketStatus(exchange: ExchangeRecord, date: Date = new Date()): MarketStatus {
    const timeInfo = this.engine.getTimeForZone(date, exchange.timezone);

    // Determine day of week in target timezone (0 = Sun, 6 = Sat)
    const localDate = new Date(Date.UTC(timeInfo.year, timeInfo.month - 1, timeInfo.day));
    const dayOfWeek = localDate.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const currentMinutes = timeInfo.hours * 60 + timeInfo.minutes;
    const openMinutes = exchange.openHour * 60 + exchange.openMinute;
    const closeMinutes = exchange.closeHour * 60 + exchange.closeMinute;

    let isOpen = false;
    let sessionState: MarketStatus["sessionState"] = "closed";
    let statusText = "Market Closed";

    if (isWeekend) {
      sessionState = "weekend";
      statusText = "Closed (Weekend)";
    } else if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      isOpen = true;
      sessionState = "open";
      const remainingMinutes = closeMinutes - currentMinutes;
      const h = Math.floor(remainingMinutes / 60);
      const m = remainingMinutes % 60;
      statusText = `Open (Closes in ${h > 0 ? `${h}h ` : ""}${m}m)`;
    } else if (currentMinutes < openMinutes) {
      sessionState = "pre-market";
      const untilOpen = openMinutes - currentMinutes;
      const h = Math.floor(untilOpen / 60);
      const m = untilOpen % 60;
      statusText = `Pre-Market (Opens in ${h > 0 ? `${h}h ` : ""}${m}m)`;
    } else {
      sessionState = "closed";
      statusText = "Closed for the day";
    }

    return {
      exchange,
      isOpen,
      statusText,
      localTimeFormatted: timeInfo.formattedTime12,
      isWeekend,
      sessionState,
    };
  }

  /**
   * Retrieves status for all global exchanges simultaneously.
   */
  getAllMarketStatuses(date: Date = new Date()): MarketStatus[] {
    return FINANCIAL_EXCHANGES.map((ex) => this.getMarketStatus(ex, date));
  }
}
