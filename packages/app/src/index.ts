import fetch from "isomorphic-fetch";
import path from "path";
import express, { Router } from "express";
import { z } from "zod";
import { quote } from "@dev/api";

export const router = Router()
  .use("/api/quote.json", (_req, res) =>
    Promise.all([
      quote.find({}),
      fetch(
        "https://www.jubi.plus/api/quote/v1/klines?symbol=301.SOL2USDT&interval=15m&from=1641946502000&to=1641956399000&limit=200"
      )
        .then((res) => res.json())
        .then((body) =>
          z
            .object({
              code: z.number(),
              data: z.array(
                z
                  .object({
                    t: z.number(),
                    s: z.string(),
                    sn: z.string(),
                    c: z.string(),
                    h: z.string(),
                    l: z.string(),
                    o: z.string(),
                    v: z.string(),
                  })
                  .strict()
              ),
            })
            .parse(body)
        )
        .then(({ data }) =>
          data.map(({ t, s, o }) =>
            ((i) => ({
              id: `${s}@${i}`,
              price: o,
              price_timestamp: i,
              symbol: s,
            }))(new Date(t).toISOString())
          )
        ),
      fetch("https://bittrex.com/api/v1.1/public/getmarketsummaries")
        .then((res) => res.json())
        .then((body) =>
          z
            .object({
              success: z.boolean(),
              message: z.string(),
              result: z.array(
                z
                  .object({
                    MarketName: z.string(),
                    High: z.number(),
                    Low: z.number(),
                    Volume: z.number(),
                    Last: z.number(),
                    BaseVolume: z.number(),
                    TimeStamp: z.string(),
                    Bid: z.number(),
                    Ask: z.number(),
                    OpenBuyOrders: z.number(),
                    OpenSellOrders: z.number(),
                    PrevDay: z.number(),
                    Created: z.string(),
                  })
                  .strict()
              ),
            })
            .parse(body)
        )
        .then(({ result }) =>
          result.map(({ MarketName, TimeStamp, Last }) => ({
            id: `${MarketName}@${TimeStamp}`,
            price: Last,
            price_timestamp: TimeStamp,
            symbol: MarketName,
          }))
        ),
    ]).then((sources) =>
      res.json({
        results: [].concat(...sources),
      })
    )
  )
  .use(require("./push").default());

class Server {
  app: Object;
  options: Object;

  constructor(options = {}) {
    this.options = options;

    if (typeof options.setupExitSignals === "undefined") {
      options.setupExitSignals = true;
    }
  }

  async initialize() {
    this.setupApp();
    this.setupMiddlewares();
    this.createServer();

    if (this.options.setupExitSignals) {
      const signals = ["SIGINT", "SIGTERM"];
      const exitProcess = () => process.exit();
      signals.forEach((signal) => {
        process.on(signal, () => this.stopCallback(exitProcess));
      });
    }
  }

  setupApp() {
    this.app = new express();
  }

  setupMiddlewares() {
    let middlewares = [];

    if (/** @type {NormalizedStatic[]} */ this.options.static.length > 0) {
      /** @type {NormalizedStatic[]} */
      this.options.static.forEach((staticOption) => {
        staticOption.publicPath.forEach((publicPath) => {
          middlewares.push({
            name: "express-static",
            path: publicPath,
            middleware: express.static(
              staticOption.directory,
              staticOption.staticOptions
            ),
          });
        });
      });
    }

    if (typeof this.options.setupMiddlewares === "function") {
      middlewares = this.options.setupMiddlewares(middlewares, this);
    }

    middlewares.forEach((middleware) => {
      if (typeof middleware === "function") {
        /** @type {import("express").Application} */
        this.app.use(middleware);
      } else if (typeof middleware.path !== "undefined") {
        /** @type {import("express").Application} */
        this.app.use(middleware.path, middleware.middleware);
      } else {
        /** @type {import("express").Application} */
        this.app.use(middleware.middleware);
      }
    });
  }

  createServer() {
    this.server = require("http").createServer(this.app);
    this.server.on("error", (error) => {
      throw error;
    });
  }

  async start() {
    this.logger = console;

    await this.initialize();

    const listenOptions = { host: this.options.host, port: this.options.port };

    await new Promise((resolve) => {
      this.server.listen(listenOptions, () => {
        resolve();
      });
    });

    if (typeof this.options.onListening === "function") {
      this.options.onListening(this);
    }
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          this.server = null;

          resolve();
        });

        for (const socket of this.sockets) {
          socket.destroy();
        }

        this.sockets = [];
      });

      if (this.middleware) {
        await new Promise((resolve, reject) => {
          this.middleware.close((error) => {
            if (error) {
              reject(error);

              return;
            }

            resolve();
          });
        });

        this.middleware = null;
      }
    }
  }

  stopCallback(callback) {
    this.stop().then(() => callback(null), callback);
  }
}

// https://stackoverflow.com/questions/6398196/detect-if-called-through-require-or-directly-by-command-line
if (process.mainModule.filename === __filename) {
  const defaultOptionsForStatic = {
    directory: path.join(process.cwd(), "public"),
    staticOptions: {},
    publicPath: ["/"],
    serveIndex: { icons: true },
  };

  const middleware = router;

  const server = new Server({
    port: 8080,
    static: [defaultOptionsForStatic],
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      devServer.app.use(require("morgan")("combined")).use(middleware);
      return middlewares;
    },
    onListening: function (devServer) {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      const port = devServer.server.address().port;
      console.log(`Listening on port: ${port}`);
    },
  });

  server.start();
}
