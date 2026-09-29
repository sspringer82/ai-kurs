import { tool } from 'langchain';
import { z } from 'zod';

// Tool 1: reine Berechnung – Monatsrate einer Annuitätenfinanzierung
export const mortgageCalculator = tool(
  async ({ amount, interest, years }) => {
    const monthlyRate = interest / 100 / 12;
    const months = years * 12;
    const payment =
      (amount * monthlyRate * (1 + monthlyRate) ** months) /
      ((1 + monthlyRate) ** months - 1);

    return JSON.stringify({ monthlyPayment: payment.toFixed(2), months });
  },
  {
    name: 'mortgage_calculator',
    description: 'Berechnet die monatliche Rate eines Annuitätendarlehens.',
    schema: z.object({
      amount: z.coerce.number().describe('Darlehensbetrag in Euro'),
      interest: z.coerce.number().describe('Jährlicher Zinssatz in Prozent, z. B. 4'),
      years: z.coerce.number().describe('Laufzeit in Jahren'),
    }),
  },
);

// Tool 2: externe API – aktuelles Wetter über Open-Meteo (kein API-Key nötig)
export const getWeatherForCity = tool(
  async ({ city }) => {
    const geo = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de`,
    ).then((response) => response.json());

    const location = geo.results?.[0];
    // Fehler als Text zurückgeben, damit das Modell reagieren kann
    if (!location) return `Fehler: Stadt "${city}" wurde nicht gefunden.`;

    const weather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m`,
    ).then((response) => response.json());

    return `In ${location.name} (${location.country}) hat es aktuell ${weather.current.temperature_2m}°C bei ${weather.current.wind_speed_10m} km/h Wind.`;
  },
  {
    name: 'get_weather_for_city',
    description: 'Liefert das aktuelle Wetter für eine Stadt.',
    schema: z.object({
      city: z.string().describe('Name der Stadt, z. B. Berlin'),
    }),
  },
);
