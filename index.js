const cors = require('cors');
const express = require('express');
const path = require('path');
// const fso = require('fs');
const fs = require('fs').promises;
const logger = require('morgan');
// const Radio = require('piwebradio');
// const app = express();
// const handle = app.getRequestHandler();
// const config = require('./config');

// config.radios = JSON.parse(fso.readFileSync(path.resolve(__dirname, 'files', 'radios.json'))).radios;
// const radio = new Radio(config);

// const writeMPDRadioFile = (radios) => (fs.writeFile(path.resolve('/', 'home', 'pi', 'radios', 'radios.m3u'), `#EXTM3U\r\n${radios.map((r) => r.url).join('\r\n')}`));


const server = express();
server.use(logger('dev'));
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.get('/api/radios', (req, res) => {
  fs.readFile(path.resolve(__dirname, 'files', 'radios.json')).then((json) => {
    res.send(json);
  });
});
server.post('/api/radios', (req, res) => {
  const { name } = req.body;
  const { url } = req.body;
  fs.readFile(path.resolve(__dirname, 'files', 'radios.json')).then((json) => {
    const { radios } = JSON.parse(json);
    if (radios.find((r) => r.name === name)) {
      res.send({ error: 'DUPLICATE_NAME' });
    } else {
      radios.push({ name, url });
      fs.writeFile(path.resolve(__dirname, 'files', 'radios.json'), JSON.stringify({ radios }))
        .then(() => {
          res.send({ error: null });
          // radio.refreshRadios(radios);
        });
    }
  });
});
server.patch('/api/radios', (req, res) => {
  const { oldName } = req.body;
  const { newName } = req.body;
  const { newUrl } = req.body;
  fs.readFile(path.resolve(__dirname, 'files', 'radios.json')).then((json) => {
    const { radios } = JSON.parse(json);
    const oldRadio = radios.find((r) => r.name === oldName);
    const existingRadio = radios.find((r) => r.name === newName);
    if (oldRadio === undefined) {
      res.send({ error: 'NO_RADIO' });
    } else if (existingRadio && existingRadio !== oldRadio) {
      res.send({ error: 'DUPLICATE_NAME' });
    } else {
      oldRadio.name = newName;
      oldRadio.url = newUrl;
      fs.writeFile(path.resolve(__dirname, 'files', 'radios.json'), JSON.stringify({ radios }))
        .then(() => {
          res.send({ error: null });
          // radio.refreshRadios(radios);
        });
    }
  });
});
server.put('/api/radios', (req, res) => {
  const { name } = req.body;
  const { newIndex } = req.body;
  fs.readFile(path.resolve(__dirname, 'files', 'radios.json')).then((json) => {
    const { radios } = JSON.parse(json);
    let index = newIndex < 0 ? 0 : newIndex;
    index = index > radios.length - 1 ? radios.length - 1 : index;
    const oldRadioIndex = radios.findIndex((r) => r.name === name);
    if (oldRadioIndex === -1) {
      res.send({ error: 'NO_RADIO' });
    } else {
      const oldRadio = radios.splice(oldRadioIndex, 1);
      radios.splice(index, 0, oldRadio[0]);
      fs.writeFile(path.resolve(__dirname, 'files', 'radios.json'), JSON.stringify({ radios }))
        .then(() => {
          res.send({ error: null });
          // radio.refreshRadios(radios);
        });
    }
  });
});
server.delete('/api/radios', (req, res) => {
  const { name } = req.body;
  fs.readFile(path.resolve(__dirname, 'files', 'radios.json')).then((json) => {
    const { radios } = JSON.parse(json);
    fs.writeFile(path.resolve(__dirname, 'files', 'radios.json'), JSON.stringify({ radios: radios.filter((r) => r.name !== name) }))
      .then(() => {
        res.send({ error: null });
        // radio.refreshRadios(radios.filter((r) => r.name !== name));
      });
  });
});
// server.all('*', (req, res) => handle(req, res));

server.listen(8888, (err) => {
  if (err) throw err;
  console.log('> API listening on http://localhost:8888');
});
