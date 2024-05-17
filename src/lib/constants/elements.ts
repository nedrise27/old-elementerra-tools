export const BASE_ELEMENT_PRICE: number = 10000;
export const BASE_ELEMENTS: string[] = [
    'AqLM9JqF5wv5DZynY8CducahkB7JWPxWpDL29TPRwmNV', // Air
    'DyYYN86vMZy6E8MVYEcrRTHwMJk5z66iDTPhHBYAafc2', // Earth
    'H1PLKchzLBgMNMnHLV15NScrMoXJXkgbCog2WnLxzjHn', // Fire
    'Bw4iN1gCvzmdiY9WfuEG1QJaxheTXif2fxuqQ5KQR2zT', // Water
];
export const BASE_ELEMENTS_PRICES: Record<string, number> = {
    AqLM9JqF5wv5DZynY8CducahkB7JWPxWpDL29TPRwmNV: BASE_ELEMENT_PRICE, // Air
    DyYYN86vMZy6E8MVYEcrRTHwMJk5z66iDTPhHBYAafc2: BASE_ELEMENT_PRICE, // Earth
    H1PLKchzLBgMNMnHLV15NScrMoXJXkgbCog2WnLxzjHn: BASE_ELEMENT_PRICE, // Fire
    Bw4iN1gCvzmdiY9WfuEG1QJaxheTXif2fxuqQ5KQR2zT: BASE_ELEMENT_PRICE, // Water
};

export const FEES: Record<string | number, number> = {
    0: 1,
    1: 1.05,
    2: 1.075,
    3: 1.1,
    4: 1.125,
    5: 1.15,
    6: 1.175,
  };
  