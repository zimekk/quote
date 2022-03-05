# quote

[zimekk.github.io/quote](https://zimekk.github.io/quote)

## install

```sh
nvm install v12
npm i -g yarn
```

```sh
node -v # v12.22.6
yarn -v # 1.22.17
```

## run

```sh
yarn
yarn start # ⚡️[server]: Server is running at http://localhost:8080
```

```sh
curl http://localhost:8080 # <!DOCTYPE html>
```

## docker

```sh
docker-compose config # services:
docker-compose up --build # app_1  | ⚡️[server]: Server is running at http://localhost:8080
```

```sh
curl http://localhost:8080 # <!DOCTYPE html>
```

## pulumi

```sh
pulumi login --local
pulumi stack init quote
pulumi new -f typescript
```

```sh
pulumi up
pulumi stack
pulumi stack --show-urns
pulumi state delete urn:pulumi:...
```

## hooks

```sh
yarn husky install
yarn husky add .husky/pre-commit "yarn pretty-quick --staged"
yarn husky add .husky/commit-msg "yarn commitlint --edit \$1"
```
