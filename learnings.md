- Bun has potential to replace a whole set of tools in a modern (bleeding edge) toolbox when it comes to developing typescript apps
- It is not there yet and will unlikely going to be there by 1.0 release scheduled for September 2023
- The main stumbling block at the moment is the lack of support for CSS loader
- Bun has some API compatibility with other modern tools such as esbuild to a point where you can try and make some of esbuild plugins work for bun
- The more realistic path forward is just use esbuild for bundling web assets today and aim to replace it with Bun when it matures
- Bun is fast
- Even if sometimes you have to downgrade parts of you pipeline back to Babel, the rest of the pipeline still feels fast
- There's no modern replacement to Babel. All the tools that position themselves as alternative to Babel only compete in the bundling space. Babel still seems like the only way to transpile features that are yet part of the spec or require explicit transpilation
- SolidJS is one of those "features" as it tries to do a lot of heavy lifting in transpilation time
- SolidJS is strange. Or React is and we just got used to thinking in React way. In any case, SolidJS mimiking React API does not aid learning process. In fact it makes it harder.
- SolidJS creates transpiled code that is earier to read and reason about than React. Though it's still not a pleasant process.
- SolidJS components functions run only once. If you want to react on prop change, you need to use functions, memos or do it in JSX directly so that it gets transpiled properly.
- SolidJS signals and effects could be used in global scope potentially elliminating the need in global state management.
- Working with `<input type="checkbox">` in SolidJS is funky. I could not make it fully controllable the same way you can do it in React.
- `window.history` is surprisingly funky and not at all what I'm used to after working with react-router history instance. I'm yet to figure out whether it's just my memory deceiving me.
- PostCSS is still the most enjoyable way for me to work with styles. Short of maybe Tailwind, but I wanted to write css by hand this time around.
- `patch-package` works with bun without a hitch and is still a life saver.
- `pino` in combination with `pino-pretty` is still pretty enjoyable logging framework, although a way to enforce some structure in logs is still desirable
- `zod` is a curious validation library for TS although the jury is still out on if you can merge it with decorator based approach such as TypeORM or TypeGraphQL uses.
- if you can't find a simple filter query parser, just write it yourself. Manual parsers are fun!
- `zod` can also work decently well as a replacement for `envalid` to define a schema for your env variables
- I've already forgot what you're missing by not having any dev tools for your global state management. Recoil is fun, but I do miss the level of introspection Redux provides.
- Temporal API's are justifiably complicated and are yet to be widely supported. So far, DayJS is still a winner in my eyes when it comes to dealing with timestamps.
- OAuth 2.1 suppose to be simplified version of OAuth 2.0 with all the best practices in one place and no need to go through another dozen of RFCs to paint a full picture. I'm yet to get through the entire spec, but it may be an interesting exercise to try and implement it myself and replace `oauth4webapi` that is currently used in this repo.
- After a long haitus, upgrading dependencies ended up being easier than anticipated. There were some minor breaking changes in Hono, and sqlite\drizzle, but pretty much everything else worked straight out of the box.
- Newer versions of Bun introduced some curious QoL improvements I want to remember of:
  - https://bun.sh/docs/runtime/jsx#logging
  - https://bun.sh/docs/runtime/jsx#prop-punning
  - https://bun.sh/docs/runtime/env#expansion
  - https://bun.sh/docs/runtime/hot#hot-mode
  - https://bun.sh/docs/runtime/autoimport
  - https://bun.sh/docs/runtime/debugger
- Github Actions have improved significantly over the years and warrant a fresh look. New types of events (https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) look particularly curious.
- It might be time to re-evaluate Bun.build and Bun.transpile maturity.
