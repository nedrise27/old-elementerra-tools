import _ from 'lodash';

export function calculatePrice(quote: number, base: number) {
    return _.round(quote * base, 8);
}

export function normalize(val: number, max: number, min: number) {
    return (val - min) / (max - min);
}
