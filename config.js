// Configuration and shared state for the Shopifolk animation

export const CONFIG = {
    nodeSize: 3.5,
    samplingGap: 5,
    logoScale: 4,
    hoverRadius: 2,
    hoverDurationMin: 2000,
    hoverDurationMax: 4000,
    mouseRadius: 35,
    repelStrength: 25,
    repelDuration: 150,
    returnDuration: 400,
    lightGreen: '#95BF47',
    darkGreen: '#5E8E3E',
    textAnimDelay: 500,
    textAnimDuration: 1200,
    textStaggerDelay: 250,
    centerAdjustX: 0,
    centerAdjustY: 0,
    terminalCharDelay: 30,
};

// Shared state
export const state = {
    nodes: [],
    logoPositions: [],
    mouseX: -1000,
    mouseY: -1000,
    terminalAnimated: false,
    mouseRepelDisabled: false,
    globeInstance: null,
    globePoints: [],
};
