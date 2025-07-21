import multiavatar from '@multiavatar/multiavatar';

// Generate a random string for multiavatar
export const generateRandomAvatarId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Generate multiavatar SVG
export const generateMultiavatar = (seed) => {
  try {
    return multiavatar(seed);
  } catch (error) {
    console.error('Error generating multiavatar:', error);
    // Fallback to a simple SVG if multiavatar fails
    return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" fill="#6366f1"/>
      <text x="50" y="58" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
        ${seed.charAt(0).toUpperCase()}
      </text>
    </svg>`;
  }
};

// Convert SVG to data URL
export const svgToDataUrl = (svgString) => {
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

// Generate random multiavatar as data URL
export const generateRandomMultiavatar = () => {
  const seed = generateRandomAvatarId();
  const svg = generateMultiavatar(seed);
  return {
    svg,
    dataUrl: svgToDataUrl(svg),
    seed
  };
};

// Generate multiavatar from user data (name, email, etc.)
export const generateUserMultiavatar = (userData) => {
  const seed = userData.name || userData.email || userData.uid || 'default';
  const svg = generateMultiavatar(seed);
  return {
    svg,
    dataUrl: svgToDataUrl(svg),
    seed
  };
};
