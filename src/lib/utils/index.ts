export * from './price';
export * from './elements';

export type LoadingState = 'initial' | 'loading' | 'loaded';

export async function asyncSleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
