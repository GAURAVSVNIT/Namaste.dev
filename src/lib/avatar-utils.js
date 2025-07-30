import { expressions } from './avatar-data';

export const generateBlendShapeQuery = (expressionName) => {
  const expr = expressions[expressionName];
  if (!expr) return '';

  const blendShapeParams = [];
  const otherParams = [];

  for (const [key, value] of Object.entries(expr)) {
    if (key.toLowerCase().endsWith("expression")) {
      otherParams.push(`${key}=${encodeURIComponent(value)}`);
    } else {
      blendShapeParams.push(`blendShapes[${key}]=${value}`);
    }
  }

  const allParams = [...blendShapeParams, ...otherParams];
  return allParams.length > 0 ? allParams.join('&') : '';
};


export function rgbToHex(rgbString) {
  const [r, g, b] = rgbString.split(',').map(Number);

  if ([r, g, b].some(n => isNaN(n) || n < 0 || n > 255)) {
    throw new Error('Invalid RGB values. Must be numbers between 0 and 255.');
  }

  const toHex = (n) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}