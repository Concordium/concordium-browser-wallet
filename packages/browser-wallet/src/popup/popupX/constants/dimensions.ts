export type Dimensions = {
    width: number;
    height: number;
};

// < 1080p
export const small: Dimensions = {
    width: 260,
    height: 440,
};

// >= 1080p
export const medium: Dimensions = {
    width: 312,
    height: 528,
};

// >=1440p
export const large: Dimensions = {
    width: 375,
    height: 600, // Max allowed
};
