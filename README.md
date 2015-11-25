# node-red-contrib-ui

## Install

```
cd ~\.node-red
npm install node-red-contrib-ui
```

Open your node-red instance and you should have UI nodes available at the bottom.
The UI interface is available at <http://localhost:1880/ui> (if default node-red settings are used)


## Developers

```
cd ~\.node-red\node-modules
git clone https://github.com/andrei-tatar/node-red-contrib-ui.git
cd node-red-contrib-ui
npm install
```
The plugin uses the ```dist``` folder if it exists and contains an ```index.html``` file. Make sure to delete it if you want to use the non-minified version.
