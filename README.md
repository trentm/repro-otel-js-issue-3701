https://github.com/open-telemetry/opentelemetry-js/issues/3701

/me trying to repro to verify the suggested require-in-the-middle change will work


# setup

```
git clone https://github.com/trentm/repro-otel-js-issue-3701.git
cd repro-otel-js-issue-3701
npm install
npm start  # runs the esbuild and 'node dist/repro.js'
```

# current status

I'm unable to get to the same repro as described in the issue.
The esbuild works without warning, and running the bundled script fails
in a different way:

```
% node --version
v16.19.0

% npm start

> repro-otel-js-issue-3701@1.0.0 start
> npm run build && node dist/repro.js


> repro-otel-js-issue-3701@1.0.0 build
> esbuild --bundle src/repro.ts --outdir=dist --platform=node


  dist/repro.js  1.5mb ⚠️

⚡ Done in 114ms
file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:2217
    var os = require("os");
             ^

ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and '/Users/trentm/tm/repro-otel-js-issue-3701/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
    at node_modules/@opentelemetry/core/build/src/platform/node/environment.js (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:2217:14)
    at __require (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:9:50)
    at node_modules/@opentelemetry/core/build/src/platform/node/index.js (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:3837:18)
    at __require (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:9:50)
    at node_modules/@opentelemetry/core/build/src/platform/index.js (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:3868:18)
    at __require (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:9:50)
    at node_modules/@opentelemetry/core/build/src/common/time.js (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:3878:22)
    at __require (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:9:50)
    at node_modules/@opentelemetry/core/build/src/index.js (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:4717:18)
    at __require (file:///Users/trentm/tm/repro-otel-js-issue-3701/dist/repro.js:9:50)
```

I notice that my bundle is bundling the *commonjs* build output of `@opentelemetry/instrumentation` (e.g. `node_modules/@opentelemetry/instrumentation/build/src/autoLoaderUtils.js`) rather than the ESM build output that is referenced by @matthias-pichler-warrify (e.g. `../../.yarn/__virtual__/@opentelemetry-instrumentation-virtual-4be7f7a678/0/cache/@opentelemetry-instrumentation-npm-0.36.1-606efe6525-07401e23e0.zip/node_modules/@opentelemetry/instrumentation/build/esm/platform/node/RequireInTheMiddleSingleton.js`). I'm not sure what in "tsconfig.json" or the esbuild args or `"type": "module"` in package.json could be the difference here.

