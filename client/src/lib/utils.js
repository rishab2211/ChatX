import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import animationData from "../assets/Two-people-chatting.json";



export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  'bg-gradient-to-br from-purple-600 to-blue-600',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-green-500 to-emerald-500',
  'bg-gradient-to-br from-yellow-500 to-orange-500',
  'bg-gradient-to-br from-indigo-500 to-purple-500',
  'bg-gradient-to-br from-red-500 to-pink-500',
  'bg-gradient-to-br from-teal-500 to-green-500'
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }
  return colors[0]; // Fallback to the first color if out of range
};


export const animationDefaultOptions = {
  loop:true,
  autoplay:true,
  animationData
}