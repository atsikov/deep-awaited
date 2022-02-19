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

type WrapReturnType<T> = WrappedAwaited<AwaitedResult<WrapArray<T>>>

// Wrap functions with up to 4 overloads
type WrapFunction<T> = T extends {
  (...params: infer P1): infer R1
  (...params: infer P2): infer R2
  (...params: infer P3): infer R3
  (...params: infer P4): infer R4
}
  ? {
      (...params: P1): WrapReturnType<R1>
      (...params: P2): WrapReturnType<R2>
      (...params: P3): WrapReturnType<R3>
      (...params: P4): WrapReturnType<R4>
    }
  : T extends {
      (...params: infer P1): infer R1
      (...params: infer P2): infer R2
      (...params: infer P3): infer R3
    }
  ? {
      (...params: P1): WrapReturnType<R1>
      (...params: P2): WrapReturnType<R2>
      (...params: P3): WrapReturnType<R3>
    }
  : T extends {
      (...params: infer P1): infer R1
      (...params: infer P2): infer R2
    }
  ? {
      (...params: P1): WrapReturnType<R1>
      (...params: P2): WrapReturnType<R2>
    }
  : T extends {
      (...params: infer P1): infer R1
    }
  ? {
      (...params: P1): WrapReturnType<R1>
    }
  : T

type WrappedString = {
  [K in keyof string]: string[K] extends (...params: infer P) => infer R
    ? WrapFunction<string[K]>
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
