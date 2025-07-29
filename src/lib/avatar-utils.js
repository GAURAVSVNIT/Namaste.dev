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
