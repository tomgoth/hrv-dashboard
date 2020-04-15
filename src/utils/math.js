export const asc = arr => arr.sort((a, b) => a - b);

export const max = arr => asc(arr)[arr.length - 1];

export const sum = arr => arr.reduce((a, b) => a + b, 0);

export const mean = arr => sum(arr) / arr.length;

// sample standard deviation
export const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

export const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

export const ln = (x) => { return Math.log(x) }



