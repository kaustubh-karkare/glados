### Installation

```
git clone https://github.com/kaustubh-karkare/productivity
cp config.json.example config.json
mkdir data # config.json specifies this as the database & backup location.
yarn install
yarn run server
```

### Data Format Change

```
yarn run backup-save
# modify the code
yarn run backup-load
```
