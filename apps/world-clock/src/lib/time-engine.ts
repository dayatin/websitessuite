/**
 * Precision IANA Time Engine & Solar Calculator
 * Powered 100% by native Intl.DateTimeFormat with zero heavy runtime dependencies.
 */

export interface CityRecord {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
  flag: string;
  isPopular?: boolean;
}

export interface ZoneTimeInfo {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedTime12: string;
  formattedTime24: string;
  formattedDate: string;
  formattedIso: string;
  utcOffsetMinutes: number;
  formattedUtcOffset: string;
  isDST: boolean;
  abbr: string;
  dayPeriod: "morning" | "afternoon" | "evening" | "night";
}

export interface SolarTimes {
  sunriseTime: string;
  sunsetTime: string;
  solarNoonTime: string;
  dayLengthMinutes: number;
  isDaylight: boolean;
}

export interface OverlapSlot {
  hourUtc: number;
  cityTimes: {
    cityId: string;
    cityName: string;
    localHour: number;
    localFormatted: string;
    isWorkingHour: boolean; // 9:00 - 18:00
    isAcceptableHour: boolean; // 8:00 - 21:00
  }[];
  quality: "optimal" | "acceptable" | "inconvenient" | "sleeping";
}

export const WORLD_CITIES: CityRecord[] = [
  // Popular Global Hubs
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
    lat: 51.5074,
    lng: -0.1278,
    flag: "🇬🇧",
    isPopular: true,
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
    lat: 40.7128,
    lng: -74.006,
    flag: "🇺🇸",
    isPopular: true,
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    country: "United States",
    countryCode: "US",
    timezone: "America/Los_Angeles",
    lat: 37.7749,
    lng: -122.4194,
    flag: "🇺🇸",
    isPopular: true,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    timezone: "Asia/Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    flag: "🇯🇵",
    isPopular: true,
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
    lat: 1.3521,
    lng: 103.8198,
    flag: "🇸🇬",
    isPopular: true,
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
    lat: 25.2048,
    lng: 55.2708,
    flag: "🇦🇪",
    isPopular: true,
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris",
    lat: 48.8566,
    lng: 2.3522,
    flag: "🇫🇷",
    isPopular: true,
  },
  {
    id: "berlin",
    name: "Berlin",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
    lat: 52.52,
    lng: 13.405,
    flag: "🇩🇪",
    isPopular: true,
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
    lat: -33.8688,
    lng: 151.2093,
    flag: "🇦🇺",
    isPopular: true,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
    lat: 19.076,
    lng: 72.8777,
    flag: "🇮🇳",
    isPopular: true,
  },
  {
    id: "hong-kong",
    name: "Hong Kong",
    country: "Hong Kong",
    countryCode: "HK",
    timezone: "Asia/Hong_Kong",
    lat: 22.3193,
    lng: 114.1694,
    flag: "🇭🇰",
    isPopular: true,
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canada",
    countryCode: "CA",
    timezone: "America/Toronto",
    lat: 43.6532,
    lng: -79.3832,
    flag: "🇨🇦",
    isPopular: true,
  },
  {
    id: "chicago",
    name: "Chicago",
    country: "United States",
    countryCode: "US",
    timezone: "America/Chicago",
    lat: 41.8781,
    lng: -87.6298,
    flag: "🇺🇸",
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    countryCode: "BR",
    timezone: "America/Sao_Paulo",
    lat: -23.5505,
    lng: -46.6333,
    flag: "🇧🇷",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    countryCode: "AR",
    timezone: "America/Argentina/Buenos_Aires",
    lat: -34.6037,
    lng: -58.3816,
    flag: "🇦🇷",
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    timezone: "Africa/Cairo",
    lat: 30.0444,
    lng: 31.2357,
    flag: "🇪🇬",
  },
  {
    id: "johannesburg",
    name: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
    timezone: "Africa/Johannesburg",
    lat: -26.2041,
    lng: 28.0473,
    flag: "🇿🇦",
  },
  {
    id: "zurich",
    name: "Zurich",
    country: "Switzerland",
    countryCode: "CH",
    timezone: "Europe/Zurich",
    lat: 47.3769,
    lng: 8.5417,
    flag: "🇨🇭",
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    timezone: "Europe/Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
    flag: "🇳🇱",
  },
  {
    id: "auckland",
    name: "Auckland",
    country: "New Zealand",
    countryCode: "NZ",
    timezone: "Pacific/Auckland",
    lat: -36.8485,
    lng: 174.7633,
    flag: "🇳🇿",
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    countryCode: "KR",
    timezone: "Asia/Seoul",
    lat: 37.5665,
    lng: 126.978,
    flag: "🇰🇷",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    timezone: "Asia/Bangkok",
    lat: 13.7563,
    lng: 100.5018,
    flag: "🇹🇭",
  },
  {
    id: "honolulu",
    name: "Honolulu",
    country: "United States",
    countryCode: "US",
    timezone: "Pacific/Honolulu",
    lat: 21.3069,
    lng: -157.8583,
    flag: "🇺🇸",
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    countryCode: "IS",
    timezone: "Atlantic/Reykjavik",
    lat: 64.1466,
    lng: -21.9426,
    flag: "🇮🇸",
  },
];

export class TimeEngine {
  private cities: Map<string, CityRecord>;

  constructor(customCities: CityRecord[] = WORLD_CITIES) {
    this.cities = new Map(customCities.map((c) => [c.id, c]));
  }

  getAllCities(): CityRecord[] {
    return Array.from(this.cities.values());
  }

  getPopularCities(): CityRecord[] {
    return this.getAllCities().filter((c) => c.isPopular);
  }

  getCityById(id: string): CityRecord | null {
    return this.cities.get(id.toLowerCase().trim()) || null;
  }

  searchCities(query: string): CityRecord[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getPopularCities();
    return this.getAllCities().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q),
    );
  }

  /**
   * Resolves comprehensive time, offset, and DST details for any IANA timezone.
   */
  getTimeForZone(date: Date = new Date(), timezone = "UTC"): ZoneTimeInfo {
    // Format parts using Intl
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });

    const parts = dtf.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "0";

    const year = Number.parseInt(getPart("year"), 10);
    const month = Number.parseInt(getPart("month"), 10);
    const day = Number.parseInt(getPart("day"), 10);
    const hours = Number.parseInt(getPart("hour"), 10) % 24;
    const minutes = Number.parseInt(getPart("minute"), 10);
    const seconds = Number.parseInt(getPart("second"), 10);
    const abbr = getPart("timeZoneName");

    // Calculate UTC offset minutes
    // Construct local ISO date in target timezone and measure diff from UTC
    const localDateAsUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    const utcOffsetMinutes = Math.round((localDateAsUtc.getTime() - date.getTime()) / 60000);

    // Format UTC Offset string (e.g. UTC+05:30 or UTC-05:00)
    const sign = utcOffsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(utcOffsetMinutes);
    const offsetHours = Math.floor(absMinutes / 60)
      .toString()
      .padStart(2, "0");
    const offsetMins = (absMinutes % 60).toString().padStart(2, "0");
    const formattedUtcOffset = `UTC${sign}${offsetHours}:${offsetMins}`;

    // DST Check: Compare current offset against January (standard winter in North) vs July (summer in North)
    const janDate = new Date(date.getFullYear(), 0, 15);
    const julDate = new Date(date.getFullYear(), 6, 15);
    const janOffset = this.getOffsetMinutes(janDate, timezone);
    const julOffset = this.getOffsetMinutes(julDate, timezone);
    const standardOffset = Math.min(janOffset, julOffset);
    const isDST = janOffset !== julOffset && utcOffsetMinutes > standardOffset;

    // Format 12-hour string
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const formattedTime12 = `${h12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
    const formattedTime24 = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    // Date string
    const dateDtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const formattedDate = dateDtf.format(date);

    // Day period
    let dayPeriod: ZoneTimeInfo["dayPeriod"] = "night";
    if (hours >= 5 && hours < 12) dayPeriod = "morning";
    else if (hours >= 12 && hours < 17) dayPeriod = "afternoon";
    else if (hours >= 17 && hours < 21) dayPeriod = "evening";

    const formattedIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${formattedTime24}:${String(seconds).padStart(2, "0")}${sign}${offsetHours}:${offsetMins}`;

    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds,
      formattedTime12,
      formattedTime24,
      formattedDate,
      formattedIso,
      utcOffsetMinutes,
      formattedUtcOffset,
      isDST,
      abbr,
      dayPeriod,
    };
  }

  private getOffsetMinutes(date: Date, timezone: string): number {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "0";
    const y = Number.parseInt(getPart("year"), 10);
    const m = Number.parseInt(getPart("month"), 10);
    const d = Number.parseInt(getPart("day"), 10);
    const h = Number.parseInt(getPart("hour"), 10) % 24;
    const min = Number.parseInt(getPart("minute"), 10);
    const s = Number.parseInt(getPart("second"), 10);
    const local = new Date(Date.UTC(y, m - 1, d, h, min, s));
    return Math.round((local.getTime() - date.getTime()) / 60000);
  }

  /**
   * Astronomical Solar Calculator (Approximate Sunrise, Sunset & Solar Noon)
   */
  calculateSolarTimes(date: Date, lat: number, lng: number, timezone: string): SolarTimes {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);

    // Approximate solar declination (radians)
    const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365;
    const declination =
      0.006918 -
      0.399912 * Math.cos(gamma) +
      0.070257 * Math.sin(gamma) -
      0.006758 * Math.cos(2 * gamma) +
      0.000907 * Math.sin(2 * gamma);

    // Equation of time in minutes
    const eqTime =
      229.18 *
      (0.000075 +
        0.001868 * Math.cos(gamma) -
        0.032077 * Math.sin(gamma) -
        0.014615 * Math.cos(2 * gamma) -
        0.040849 * Math.sin(2 * gamma));

    const latRad = (lat * Math.PI) / 180;
    // Zenith for sunrise/sunset is 90.833 degrees (accounting for atmospheric refraction)
    const zenith = (90.833 * Math.PI) / 180;

    let hourAngleCos =
      (Math.cos(zenith) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination));

    // Polar day / polar night clamping
    hourAngleCos = Math.max(-1, Math.min(1, hourAngleCos));
    const hourAngleDeg = (Math.acos(hourAngleCos) * 180) / Math.PI;

    // Solar noon in UTC minutes from midnight
    const solarNoonUtcMinutes = 720 - 4 * lng - eqTime;
    const sunriseUtcMinutes = solarNoonUtcMinutes - hourAngleDeg * 4;
    const sunsetUtcMinutes = solarNoonUtcMinutes + hourAngleDeg * 4;
    const dayLengthMinutes = Math.round(hourAngleDeg * 8);

    // Convert minutes from midnight to localized formatted strings
    const formatMinutesToZone = (utcMinutes: number) => {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      d.setUTCMinutes(utcMinutes);
      const zoneInfo = this.getTimeForZone(d, timezone);
      return zoneInfo.formattedTime12;
    };

    const currentZoneInfo = this.getTimeForZone(date, timezone);
    const currentMinutes = currentZoneInfo.hours * 60 + currentZoneInfo.minutes;
    const zoneOffset = currentZoneInfo.utcOffsetMinutes;
    const localSunriseMinutes = (sunriseUtcMinutes + zoneOffset + 1440) % 1440;
    const localSunsetMinutes = (sunsetUtcMinutes + zoneOffset + 1440) % 1440;
    const isDaylight =
      currentMinutes >= localSunriseMinutes && currentMinutes <= localSunsetMinutes;

    return {
      sunriseTime: formatMinutesToZone(sunriseUtcMinutes),
      sunsetTime: formatMinutesToZone(sunsetUtcMinutes),
      solarNoonTime: formatMinutesToZone(solarNoonUtcMinutes),
      dayLengthMinutes,
      isDaylight,
    };
  }

  /**
   * Computes 24-hour overlap matrix across multiple cities for golden meeting windows.
   */
  findOverlapHours(cityIds: string[], baseDate: Date = new Date()): OverlapSlot[] {
    const selectedCities = cityIds
      .map((id) => this.getCityById(id))
      .filter((c): c is CityRecord => c !== null);

    if (selectedCities.length === 0) return [];

    const slots: OverlapSlot[] = [];

    // Analyze every hour of the 24-hour day in UTC
    for (let hUtc = 0; hUtc < 24; hUtc++) {
      const utcDate = new Date(baseDate);
      utcDate.setUTCHours(hUtc, 0, 0, 0);

      const cityTimes = selectedCities.map((city) => {
        const timeInfo = this.getTimeForZone(utcDate, city.timezone);
        const isWorkingHour = timeInfo.hours >= 9 && timeInfo.hours < 18; // 9 AM - 6 PM
        const isAcceptableHour = timeInfo.hours >= 8 && timeInfo.hours < 21; // 8 AM - 9 PM

        return {
          cityId: city.id,
          cityName: city.name,
          localHour: timeInfo.hours,
          localFormatted: timeInfo.formattedTime12,
          isWorkingHour,
          isAcceptableHour,
        };
      });

      // Assess overlap quality
      const allWorking = cityTimes.every((c) => c.isWorkingHour);
      const allAcceptable = cityTimes.every((c) => c.isAcceptableHour);
      const anySleeping = cityTimes.some((c) => c.localHour >= 23 || c.localHour < 7);

      let quality: OverlapSlot["quality"] = "inconvenient";
      if (allWorking) {
        quality = "optimal";
      } else if (allAcceptable) {
        quality = "acceptable";
      } else if (anySleeping) {
        quality = "sleeping";
      }

      slots.push({
        hourUtc: hUtc,
        cityTimes,
        quality,
      });
    }

    return slots;
  }
}
