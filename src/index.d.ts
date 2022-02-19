type AwaitedResult<T> = T extends Promise<infer R> ? Promise<R> & R : T

type WrappedPromise<T> = Omit<Promise<T>, "then" | "catch"> & {
  then: WrapPromiseThen<T>
  catch: WrapPromiseCatch
}

type WrapPromiseMethods<T, K extends "then" | "catch"> = K extends "then"
  ? WrapPromiseThen<T>
  : WrapPromiseCatch

type WrapPromiseThen<T> = <TResult1 = T, TResult2 = never>(
  onfulfilled?:
    | ((value: T) => TResult1 | PromiseLike<TResult1>)
    | undefined
    | null,
  onrejected?:
    | ((reason: any) => TResult2 | PromiseLike<TResult2>)
    | undefined
    | null,
) => WrappedPromise<TResult1 | TResult2> & WrappedAwaited<TResult1 | TResult2>

type WrapPromiseCatch = <TResult = never>(
  onrejected?:
    | ((reason: any) => TResult | PromiseLike<TResult>)
    | undefined
    | null,
) => WrappedPromise<TResult> & WrappedAwaited<TResult>

type WrappedString = {
  [K in keyof string]: string[K] extends (...params: infer P) => infer R
    ? (...params: P) => WrappedAwaited<AwaitedResult<WrapArray<R>>>
    : () => string[K]
}

type WrappedNumber = {
  [K in keyof number]: number[K] extends (...params: infer P) => infer R
    ? (...params: P) => WrappedAwaited<AwaitedResult<WrapArray<R>>>
    : () => number[K]
}

type WrappedBoolean = {
  [K in keyof boolean]: boolean[K] extends (...params: infer P) => infer R
    ? (...params: P) => WrappedAwaited<AwaitedResult<WrapArray<R>>>
    : () => boolean[K]
}

type WrapNativePrimitive<T extends string | number | boolean> = T extends string
  ? WrappedString
  : T extends number
  ? WrappedNumber
  : T extends boolean
  ? WrappedBoolean
  : never

type WrapArray<T> = T extends Array<infer R>
  ? Array<() => R>
  : T extends ReadonlyArray<infer R>
  ? ReadonlyArray<() => R>
  : T

export type WrappedAwaited<T> = T extends Promise<infer R>
  ? WrappedPromise<WrappedAwaited<R>> & WrappedAwaited<R>
  : T extends string | number | boolean
  ? AwaitedResult<WrapNativePrimitive<T>>
  : {
      [K in keyof T]: K extends "then" | "catch"
        ? WrapPromiseMethods<T, K>
        : T[K] extends (...params: infer P) => infer R
        ? (...params: P) => WrappedAwaited<WrapArray<R>>
        : () => WrappedAwaited<WrapArray<T[K]>>
    }

type D = WrappedAwaited<Promise<string>>["catch"]

export declare function deepAwaited<T>(value: Promise<T>): WrappedAwaited<T>
export default deepAwaited
