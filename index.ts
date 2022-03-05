// import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import { config } from "dotenv";

const {
  DOCKER_HOST,
  IMAGE_NAME,
  REGISTRY_HOST,
  REGISTRY_USER,
  REGISTRY_PASS,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
} = config().parsed;

const remoteInstance = new docker.Provider(
  "remote",
  {
    host: DOCKER_HOST,
  }
  // { dependsOn: dockerInstallation }
);

const PORT = String(8080);

const myImage = new docker.Image("quote-image", {
  imageName: IMAGE_NAME,
  build: { context: ".", env: { PORT } },
  registry: {
    server: REGISTRY_HOST,
    username: REGISTRY_USER,
    password: REGISTRY_PASS,
  },
});

const myContainer = new docker.Container(
  "quote-container",
  {
    image: myImage.imageName,
    name: "quote_app_1",
    envs: [
      `VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}`,
      `VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}`,
    ],
    // ports: [{ internal: 8080, external: 8888 }],
  },
  {
    provider: remoteInstance,
  }
);
