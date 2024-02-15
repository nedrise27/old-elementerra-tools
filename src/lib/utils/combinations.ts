import _ from 'lodash';

export function cartesian(elements: string[]) {
    let r: string[][] = [];
    let max = 3;
    const elements4 = [_.clone(elements), _.clone(elements), _.clone(elements), _.clone(elements)];

    function helper(arr: any[], i: number) {
        for (let j = 0, l = elements4[i].length; j < l; j++) {
            let a = _.clone(arr);
            a.push(elements4[i][j]);
            if (i == max) {
                if (!r.find((item) => _.isEqual(item, a))) {
                    r.push(a);
                }
            } else {
                helper(a, i + 1);
            }
        }
    }

    helper([], 0);

    return r;
}

export function* cartesianIterator<T>(items: T[][]): Generator<T[]> {
    const remainder = items.length > 1 ? cartesianIterator(items.slice(1)) : [[]];
    for (let r of remainder) {
        for (let h of items.at(0)!) {
            yield [h, ...r];
        }
    }
}
