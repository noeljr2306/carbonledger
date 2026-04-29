import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTco2e(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}k tCO₂e`;
  if (value >= 1) return `${value.toFixed(2)} tCO₂e`;
  return `${(value * 1000).toFixed(1)} kgCO₂e`;
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}