// expressions.js
export const expressions = {
  neutral: {
    browOuterUpLeft: 0,
    browInnerUp: 0,
    eyeWideLeft: 0,
    jawOpen: 0,
  },
  curious: {
    browOuterUpLeft: 0.7,
    browInnerUp: 0.4,
    eyeWideLeft: 0.4,
    jawOpen: 0.2,
  },
  lol: {
    expression: "lol"
  },
  happy: {
    expression: "happy"
  },
  sad: {
    browInnerUp: 0.5,
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    eyeLookDownLeft: 0.3,
  },
  angry: {
    expression: "rage"
  },
  surprised: {
    browInnerUp: 0.7,
    eyeWideLeft: 0.9,
    eyeWideRight: 0.9,
    jawOpen: 0.9,
  },
  confused: {
    browOuterUpLeft: 0.7,
    browDownRight: 0.5,
    mouthFrownLeft: 0.3,
    eyeLookDownRight: 0.4,
  },
  disgusted: {
    noseSneerLeft: 0.9,
    noseSneerRight: 0.9,
    mouthFrownLeft: 0.5,
    browDownLeft: 0.5,
  },
  excited: {
    mouthSmileLeft: 0.9,
    mouthSmileRight: 0.9,
    eyeWideLeft: 0.7,
    eyeWideRight: 0.7,
    jawOpen: 0.5,
  },
  scared: {
    expression: "scared"
  },
  sleepy: {
    eyeBlinkLeft: 0.9,
    eyeBlinkRight: 0.9,
    mouthFunnel: 0.3,
    browOuterUpLeft: 0.2,
  }
};

export const expressionEmojis = {
  neutral: "😐",
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  curious: "🤔",
  disgusted: "🤢",
  confused: "😵",
  sleepy: "😴",
  excited: "😃",
  scared: "😨",
  lol: "😂",
};

export const selectedPoses = {
    "power-stance": "🧍",
    "relaxed": "🧍",
    "standing": "🧍",
    "thumbs-up": "🧍",
}