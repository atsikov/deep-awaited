# deep-awaited

Tired of nested `await`s? Don't like to assign awaited results to intermediate variables? There's finally a solution!

With `deep-awaited` you can simply chain your calls and get the result with a single line

```js
/* /user/info returns `{ name: "John Doe" }` */
await deepAwaited(fetch("/user/info")).json().name() // resolves to "John Doe"
```

Library is written in ES6 with provided TypeScript definitions. `deep-awaited` is based on Proxy so you will need to polyfill it when targeting old browsers.

## API

`deepAwaited(promise)`

The only method exported from the library. It wraps the provided promise so that you could immediately access properties of a value to be resolved.

### Limitation

In order to have a nice chaining, each non-function field is wrapped with a function. If you us TypeScript, the provided definitions will take care of it. Same comes to array element access.

## Examples

Access the required field in a fetched json

```js
await deepAwaited(fetch("/user/info")).json().name() // resolves to "John Doe"
```

Parse strings from the request payload

```js
await deepAwaited(fetch("/user/info")).json().name().split(" ")[0]() // resolves to "John"
```

Chain asynchronous calls in end-to-end tests (eg Playwright)

```js
await findByRole(page, "button").click()
```
