import deepAwaited from "."

it("should resolve a simple promise", async () => {
  expect(await deepAwaited(Promise.resolve("a"))).toBe("a")
})

it("should call promise result method", async () => {
  expect(await deepAwaited(Promise.resolve("abc")).charAt(0)).toBe("a")
})

it("should await for the promise chain", async () => {
  const promise = Promise.resolve({
    next: () => Promise.resolve("abc"),
  })
  expect(await deepAwaited(promise).next().charAt(0)).toBe("a")
})

it("should call deeply nested method", async () => {
  const promise = Promise.resolve({
    next: () => "abc",
  })
  expect(await deepAwaited(promise).next().split("b")[0]?.()).toBe("a")
})

it("should wrap deeply nested field with a function", async () => {
  const promise = Promise.resolve({
    next: () =>
      Promise.resolve({
        a: "a",
      }),
  })
  expect(
    await deepAwaited(promise).next().a().charAt(0).replace("a", "b"),
  ).toBe("b")
})

it("should wrap deeply nested getter with a function", async () => {
  const promise = Promise.resolve({
    next: () =>
      Promise.resolve({
        get a() {
          return "a"
        },
      }),
  })
  expect(
    await deepAwaited(promise).next().a().charAt(0).replace("a", "b"),
  ).toBe("b")
})

it("should respect method context", async () => {
  const foo = {
    a: "abc",
    next: function () {
      return this.a
    },
  }

  const promise = Promise.resolve({
    foo: () => Promise.resolve(foo),
  })
  expect(
    await deepAwaited(promise).foo().next().charAt(0).replace("a", "b"),
  ).toBe("b")
})

it("should respect es6 class member context", async () => {
  class Foo {
    private a = "abc"
    public next() {
      return this.a
    }
  }

  const promise = Promise.resolve({
    foo: () => Promise.resolve(new Foo()),
  })
  expect(
    await deepAwaited(promise).foo().next().charAt(0).replace("a", "b"),
  ).toBe("b")
})

it("should respect nested promise rejection", async () => {
  const promise = Promise.resolve({
    next: () =>
      new Promise<string>(() => {
        throw new Error("abc")
      }),
  })

  expect(deepAwaited(promise).next()).rejects.toEqual(new Error("abc"))
})

it("should respect promise.then", async () => {
  const promise = Promise.resolve({
    next: () => Promise.resolve("abc"),
  })

  expect(
    await deepAwaited(promise)
      .next()
      .then(() => 123)
      .toFixed(2),
  ).toBe("123.00")
})

it("should respect promise.catch", async () => {
  const promise = Promise.resolve({
    next: () =>
      new Promise<string>(() => {
        throw new Error("abc")
      }),
  })

  expect(
    await deepAwaited(promise)
      .next()
      .catch((e: Error) => Promise.resolve(e.message))
      .charAt(0)
      .replace("a", "b"),
  ).toBe("b")
})

it("should respect promise.finally", async () => {
  const promise = Promise.resolve({
    next: () =>
      new Promise<string>(() => {
        throw new Error("abc")
      }),
  })

  const onFinally = jest.fn()
  try {
    await deepAwaited(promise)
      .next()
      .catch(() => {})
      .finally(onFinally)
  } catch {}

  expect(onFinally).toBeCalled()
})
