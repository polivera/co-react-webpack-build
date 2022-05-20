# React Module Federation Library

This package pre-configures webpack to work with module federation with react.

## Configuration

Changes on the configuration can be done through the package.json file, as well as indicate
which components should be exposes or consume.

|   Property   | Default Value |     type     | Description                                                                                                                                                                               |
|:------------:|:-------------:|:------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|     name     |      n/a      |    string    | This value will be used as package name in the federation url. <br/> Example: for the name 'package-name' the url will be: `packageName@http://localhost:1234/remoteEntry.js`             |
| sourceFolder |     ./src     |    string    |                                                                                                                                                                                           |
|     main     |   index.ts    |    string    | Entry file name. Webpack will look for it in the sourceFolder                                                                                                                             |
|     host     |   localhost   |    string    | Host to use. This will set webpack devServer.host                                                                                                                                         |
|     port     |     9000      |     int      | Port to use. This will set webpack devServer.port                                                                                                                                         |
|   exposes    |      [ ]      |    object    | A list of components to expose for module federation. The format should be: <br/> `{ "./ComponentName": "/path/to/component" }`                                                           |
|   remotes    |      [ ]      |    object    | A list of federated modules to consume. The format should be: <br/> `{ "ComponentName": "exposeName@http://host/remoteEntry.js" }`                                                        |
|    shared    |      [ ]      |    object    | A list of shared components. The format should be: <br/> `{ "react": { "singleton": true, "eager": true } }`<br/> The requiredVersion field will be retrieved from the dependency version |
| allowedHosts |     auto      | array/string | Allows you to whitelist services that are allowed to access the dev server. See [webpack documentation](https://webpack.js.org/configuration/dev-server/#devserverallowedhosts)           |

## Example of a package.json

```json
{
  "name": "test-app",
  "version": "1.0.0",
  "description": "Test App",
  "main": "index.ts",
  "port": 9091,
  "scripts": {
    "start": "co-dev-server",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Author",
  "license": "ISC",
  "homepage": "https://github.com/some-user/test-app#readme",
  "devDependencies": {
    "@types/jest": "^27.4.0",
    "@types/react": "^17.0.38",
    "@types/react-dom": "^17.0.11",
    "typescript": "^4.5.5"
  },
  "dependencies": {
    "co-react-webpack-build": "^1.0.22",
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  },
  "remotes": {
    "RemoteComponent": "remoteComponent@http://localhost:9091/remoteEntry.js"
  },
  "exposes": {
    "./TestComponent": "./components/TestComponent/index.tsx"
  },
  "shared": {
    "react": {
      "singleton": true,
      "eager": true
    },
    "react-dom": {
      "singleton": true,
      "eager": true
    }
  }
}
```
