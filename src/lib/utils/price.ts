import _ from 'lodash';

export function calculatePrice(quote: number, base: number) {
    return _.round(quote * base, 8);
}

export function toFixedNoTralingZeroes(num: number, precision: number): string {
    return num.toFixed(precision).replace(/\.?0*$/, '');
}

export function normalize(val: number, max: number, min: number) {
    return (val - min) / (max - min);
}
