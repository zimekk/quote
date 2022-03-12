import fetch from "isomorphic-fetch";
import path from "path";
import express, { Router } from "express";
import { z } from "zod";
import { quote } from "@dev/api";

const TfiSchema = z
  .object({
    meta: z.object({
      currency: z.string(),
      division: z.string(),
      end_date: z.string(),
      end_value: z.number(),
      id: z.number(),
      limit: z.number(),
      name: z.string(),
      next: z.string().nullable(),
      offset: z.number(),
      only_full: z.boolean(),
      previous: z.string().nullable(),
      roi: z.number(),
      start_date: z.string(),
      start_value: z.number(),
      synthetic_value_to: z.string().nullable(),
      total_count: z.number(),
    }),
    objects: z.array(
      z.object({
        date: z.string(),
        roi: z.number(),
        unit: z.string(),
        value: z.number(),
      })
    ),
  })
  .transform(({ meta: { name }, objects }) =>
    objects.map(({ date, unit, value }) =>
      ((i) => ({
        id: `${unit}@${i}`,
        price: value,
        price_timestamp: i,
        symbol: name,
      }))(new Date(date).toISOString())
    )
  );

const parseTfiResponse = (res) =>
  res.json().then((body) => TfiSchema.parse(body));

export const router = Router()
  .use("/api/rates.json", (_req, res) =>
    fetch("https://www.jubi.plus/api/quote/v1/rates", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      // "body": "tokens=USDT,BTC,ETH,1INCH,1SOL,A5T,AAC,AAT,AAVE,ABBKS1,ACA,ADA,ADD1,AEGIS,AGLD1,ALD1,ALGO,ALICE,ANC1,ANT2,ANY,API31,AR1,ARMOR1,ARPA,ASKO,ASTR,ATLAS1,ATOM,AUCTION,AUDIO1,AURORA,AVALANCHE,AVN,AXS1,BACK1,BADGER1,BAL,BALPHA1,BAND,BCH,BCHA,BDP1,BEE1,BELT1,BEP20-IMT,BF,BHD,BIT,BKY,BMBC,BNB,BOBA1,BONE1,BOSON1,BSV,BTM,BTRST1,BUNNY1,BXH1,BZZ2,CAKE1,CELT,CERE,CFX1,CHE1,CLOVER42,CLV2,COMBO1,COMP,COVER2,COW1,CQT1,CRO1,CRV,CSPR1,DAFI1,DAI1,DAO,DASH,DDX1,DEP1,DESO,DHEDGE,DIA,DMG,DNA1,DODO1,DOGE,DOP1,DORA1,DYDX1,ELA,ELASTOS,ELROND,ENJ1,ENS,EOS,ETC,ETD1,ETHA1,ETHV2,FANSCOIN,FEI-HECO,FEI1,FILECOIN,FILESTAR,FINDORA,FLM1,FM,FORTH1,FOX,FRONTIER,FTM,FTT1,FXS1,GALA,GARI,GFI2,GLMR,GODS,GOF,GOG,GRAPH,GTC1,GXCHAIN,HADES,HBC,HCT2,HEGIC1,HFI1,HGT1,HIVE1,HOPR,HT,HUSD,ICP1,IDEX,IMX,INV,JASMY1,JBX1,JC,JENNY1,JF,JFI,JGN1,JOE1,JST,JT,JUSD,KAVA1,KCASH,KEEP,KEEP3RV1,KILT,KIMCHI1,KINE,KLP,KNC1,KONO1,KSM,KTON1,LAT2,LAVA1,LEASH1,LHB1,LIEN1,LINK,LOOKS,LOON,LPT2,LQTY,LTC,LUNA,MANA1,MAPS1,MASK1,MATH,MATIC1,MATTER1,MCB,MDX-HECO,MEER1,METAX,METIS1,MINA1,MIRROR,MKR,MONO,MTA,MVP1,MW1,MX,MXC,NCT1,NEAR-NEW,NEO,NEST,NFT2,NT2,NU,OCEAN3,OCT,OGN,OHM,OINFINANCE,OKB,OKS,OMG1,ONE2,ONT,OOE1,OOKI,OVR1,OXD,PAMP,PDEX1,PEOPLE,PERP1,PHX,PICKLE1,PIG,PLA1,PNEO,PNK,POLKADOT,POLS1,POND1,POT,PUSH,QI,QRDO,QTUM,RACA,RADAR,RAIN,RARI1,RAY1,RAZOR1,REN,RING,RLY1,ROCKI1,RON1,ROSE2,RUFF1,SAFE,SAFEMOON,SAKE1,SAND,SFG1,SHFT2,SHIB1,SIPHER,SKL2,SMARS3,SMP,SNX1,SOL2,SOS,SPELL,SQUID,SRM,STAFI,STORJ1,STOS1,SUN2,SUPER2,SUSHI1,SWFTC,TAI,THG,TIDAL1,TIMER1,TOKENLON,TOWN,TPT2,TRAC,TRIBE-HECO,TRIBE1,TRU1,TRX,TVK1,TWT1,UIP2,UNFI,UNI,UNITRADE,UP,USDC,USDT-AVAX-C,VALUE1,VEE,VP,WEVE,WOO1,XAS,XAVA1,XCH2,XEC,XEND1,XLM2,XOR,XRP,XRT1,XTZ,XVS1,XYO,YAMV3,YFI,YFII,YGG,ZEC,ZEN1,ZKS1,BTC,USDT&legalCoins=BTC,USDT,USD",
      body: "tokens=BTC,USDT,ATOM&legalCoins=BTC,USDT,USD",
      method: "POST",
    })
      .then((res) => res.json())
      .then((body) =>
        z
          .object({
            code: z.number(),
            data: z.array(
              z
                .object({
                  token: z.string(),
                  rates: z.record(z.string(), z.string()),
                })
                .strict()
            ),
          })
          .parse(body)
      )
      .then(({ data }) =>
        res.json({
          data,
        })
      )
  )
  .use("/api/quote.json", (_req, res) =>
    Promise.all([
      quote.find({}),
      fetch(
        ((to) =>
          `https://www.jubi.plus/api/quote/v1/klines?symbol=301.ATOMUSDT&interval=1m&from=${
            to - 60 * 1000
          }&to=${to}&limit=200`)(Math.round(Date.now() / 1000) * 1000)
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
      // fetch("https://bittrex.com/api/v1.1/public/getmarketsummaries")
      //   .then((res) => res.json())
      //   .then((body) =>
      //     z
      //       .object({
      //         success: z.boolean(),
      //         message: z.string(),
      //         result: z.array(
      //           z
      //             .object({
      //               MarketName: z.string(),
      //               High: z.number(),
      //               Low: z.number(),
      //               Volume: z.number(),
      //               Last: z.number(),
      //               BaseVolume: z.number(),
      //               TimeStamp: z.string(),
      //               Bid: z.number(),
      //               Ask: z.number(),
      //               OpenBuyOrders: z.number(),
      //               OpenSellOrders: z.number(),
      //               PrevDay: z.number(),
      //               Created: z.string(),
      //             })
      //             .strict()
      //         ),
      //       })
      //       .parse(body)
      //   )
      //   .then(({ result }) =>
      //     result.map(({ MarketName, TimeStamp, Last }) => ({
      //       id: `${MarketName}@${TimeStamp}`,
      //       price: Last,
      //       price_timestamp: TimeStamp,
      //       symbol: MarketName,
      //     }))
      //   ),
      fetch(
        "https://www.pkotfi.pl/_ajax/rest/v2/tfi/fund/74/values/?format=json&division=daily&unit=A"
      ).then(parseTfiResponse),
      fetch(
        "https://www.pkotfi.pl/_ajax/rest/v2/tfi/fund/75/values/?format=json&division=daily&unit=A"
      ).then(parseTfiResponse),
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
