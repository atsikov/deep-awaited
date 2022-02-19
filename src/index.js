function deepAwaited(value) {
  return new Proxy(value, {
    get: (target, prop) => {
      if (prop in target && prop !== "toString") {
        const promisePropValue = target[prop]
        if (typeof promisePropValue === "function") {
          return (...params) =>
            deepAwaited(promisePropValue.apply(target, params))
        }
      }

      return (...params) =>
        deepAwaited(
          target.then(resolved => {
            const resolvedPropValue = resolved[prop]
            if (typeof resolvedPropValue === "function") {
              return resolvedPropValue.apply(resolved, params)
            } else {
              return resolvedPropValue
            }
          }),
        )
    },
  })
}

module.exports = { deepAwaited }
module.exports.default = deepAwaited
