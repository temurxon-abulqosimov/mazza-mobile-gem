export interface Market {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  center: {
    lat: number;
    lng: number;
  };
  defaultRadiusKm: number;
}
