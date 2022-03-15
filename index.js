//const mashaSpeak = require('mashaSpeak');
//hue_api.<fonction>

const axios = require('axios');
const config = require('./config.json');
const masterURL = `http://${config.hue_Bridge_IP}/api/${config.username}/lights`;

/*----------------------------------------- Other -----------------------------------------*/

/*------------------------ Utilitary ------------------------*/

function hexToHSB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
      h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  var HSL = new Object();
  HSL['h']=Math.round(h*65535);
  HSL['s']=Math.round(s*254);
  HSL['b']=Math.round(l*254);
  return HSL;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function stringToMS(duration) {
  regex = /\D/g
  if (duration.match(/^\d*h$/g)) { //heures
    return parseInt(duration.replace(regex,''))*60*60*1000
  }
  else if (duration.match(/^\d*m$/g)) { //minutes
    return parseInt(duration.replace(regex,''))*60*1000
  }
  else if (duration.match(/^\d*s$/g)) { //secondes
    return parseInt(duration.replace(regex,''))*1000
  }
}

function simplifyData(data) {
  simplifiedData = [];
  for (const property in data) {
    index = simplifiedData.length;
    simplifiedData[index] = new Object();
    simplifiedData[index].id = property;
  }
  for (var i = 0; i < simplifiedData.length; i++) {
    regex = /(^\s*|\s*$)/g
    simplifiedData[i].room = data[simplifiedData[i].id].name.split('-')[0].replaceAll(regex,'');
    simplifiedData[i].name = data[simplifiedData[i].id].name;
    simplifiedData[i].state = new Object();
    simplifiedData[i].state.on = data[simplifiedData[i].id].state.on;
    if (data[simplifiedData[i].id].type.toLowerCase().match(/color/g)) {
      simplifiedData[i].state.hue = data[simplifiedData[i].id].state.hue;
      simplifiedData[i].state.sat = data[simplifiedData[i].id].state.sat;
      simplifiedData[i].state.bri = data[simplifiedData[i].id].state.bri;
      simplifiedData[i].type = 'rgb';
    }
    else {
      simplifiedData[i].state.bri = data[simplifiedData[i].id].state.bri;
      simplifiedData[i].type = 'white';
    }
  }
  return simplifiedData;
}

/*------------------------ Get ------------------------*/

async function getSimplifiedData() {
  axios.get(masterURL).then(data => {
    return simplifyData(data.data);
  });
}

async function getRoomLightsByName(name) {
  await getSimplifiedData().then(data => {
    if (data) {
      return array.filter(light => light.room.toLowerCase() = name.toLowerCase()).map(light => light.id);
    }
  });
}

async function getRoomLightsByID(id) {
  await getSimplifiedData().then(data => {
    if (data) {
      name = data.find(light => light.id = id).room;
      return array.filter(light => light.room.toLowerCase() = name.toLowerCase()).map(light => light.id);
    }
  });
}

async function getRoomLights(input) {
  if (input.match(/\d*/g)) {
    return getRoomLightsByID(input)
  }
  else {
    return getRoomLightsByName(input)
  }
}

/*----------------------------------------- Single -----------------------------------------*/

/*------------------------ Base ------------------------*/

async function setOnOrOff(id,on) { //bool
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          on: on,
      });
  } catch (err) {
      console.error(err);
  }
}

async function setOnOrOffColor(id,on,hue,sat,bri) { //bool
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          on: on,
          hue: hue,
          sat: sat,
          bri: bri
      });
  } catch (err) {
      console.error(err);
  }
}

async function setOnOrOffColorFromHex(id,on,hex) {
  hsb = hexToHSB(hex);
  setOnOrOffColor(id,on,hsb['h'],hsb['s'],hsb['b'])
}

async function setHue(id,hue) { //max 65535
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          hue: hue,
      });
  } catch (err) {
      console.error(err);
  }
}

async function setSat(id,sat) { //max 254
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          sat: sat,
      });
  } catch (err) {
      console.error(err);
  }
}

async function setBri(id,bri) { //max 254
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          bri: bri,
      });
  } catch (err) {
      console.error(err);
  }
}

/*------------------------ Complex ------------------------*/

async function setAll(id,hue,sat,bri) {
  url = `${masterURL}/${id}/state`;
  try {
      return await axios.put(url, {
          hue: hue,
          sat: sat,
          bri: bri
      });
  } catch (err) {
      console.error(err);
  }
}

async function setHueFromHex(id,hex) {
  hsb = hexToHSB(hex);
  setHue(id,hsb['h']);
}

async function setAllFromHex(id,hex) {
  hsb = hexToHSB(hex);
  setAll(id,hsb['h'],hsb['s'],hsb['b']);
}

async function blink(id,count=config.default_Blink_Count) {
  count *= 2
  axios.get(masterURL).then(data => {
    on = data.data[id].state.on
    if (!on) {
      count++;
    }
    for (let i = 0, p = Promise.resolve(); i < count; i++) {
      p = p.then(_ => new Promise(resolve =>
        setTimeout(async function () {
          if (i % 2 == 0) {
            setOnOrOff(id,false)
          }
          else {
            setOnOrOff(id,true)
          }
          resolve();
        }, 750)
      ));
    }
  });
}

async function blinkColor(id,hue,sat,bri,count=config.default_Blink_Count) {
  count *= 2
  axios.get(masterURL).then(data => {
    on = data.data[id].state.on
    currenthue = data.data[id].state.hue
    currentsat = data.data[id].state.sat
    currentbri = data.data[id].state.bri
    if (!on) {
      count++;
    }
    for (let i = 0, p = Promise.resolve(); i <= count; i++) {
      p = p.then(_ => new Promise(resolve =>
        setTimeout(async function () {
          if (i == count) {
            setAll(id,currenthue,currentsat,currentbri)
          }
          else if (i % 2 == 0) {
            setOnOrOff(id,false)
          }
          else {
            setOnOrOffColor(id,true,hue,sat,bri)
          }
          resolve();
        }, 750)
      ));
    }
  });
}

async function blinkColorFromHex(id,hex,count=config.default_Blink_Count) {
  hsb = hexToHSB(hex);
  blinkColor(id,hsb['h'],hsb['s'],hsb['b'],count);
}

/*------------------------ Smooth ------------------------*/

async function smoothDown(id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=0) {
  duration = stringToMS(duration)
  axios.get(masterURL).then(data => {
    bri = data.data[id].state.bri
    freq = Math.round(duration/steps)
    for (let i = 1,p = Promise.resolve(); i <= steps+1;i++) {
      if (i == steps+1) {
        p = p.then(_ => new Promise(resolve =>
          setTimeout(async function () {
            setOnOrOff(id,false);
            resolve();
          }, freq)
        ));
      }
      else {
        p = p.then(_ => new Promise(resolve =>
          setTimeout(async function () {
            setBri(id,Math.round(bri+(value-bri)/steps*i))
            resolve();
          }, freq)
        ));
      }
    }
  });
}

async function smoothUp(id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  duration = stringToMS(duration)
  axios.get(masterURL).then(data => {
    on = bri = data.data[id].state.on
    bri = data.data[id].state.bri
    if (!on) {
      setOnOrOff(id,true);
      if (bri > 1) {
        setBri(id,1)
        bri = 1
      }
    }
    freq = Math.round(duration/steps)
    for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
      p = p.then(_ => new Promise(resolve =>
        setTimeout(async function () {
          setBri(id,Math.round(bri+(value-bri)/steps*i))
          resolve();
        }, freq)
      ));
    }
  });
}

async function smoothUpColor(id,hue,sat,bri,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  duration = stringToMS(duration)
  bri = 1
  setOnOrOffColor(id,true,hue,sat,bri)
  freq = Math.round(duration/steps)
  for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
    p = p.then(_ => new Promise(resolve =>
      setTimeout(async function () {
        setBri(id,Math.round(bri+(value-bri)/steps*i))
        resolve();
      }, freq)
    ));
  }
}

async function smoothUpColorFromHex(id,hex,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  hsb = hexToHSB(hex);
  smoothUpColor(id,hsb['h'],hsb['s'],hsb['b'],duration,steps,value);
}

async function smoothHue(id,hue,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  axios.get(masterURL).then(data => {
    currenthue = data.data[id].state.hue
    duration = stringToMS(duration)
    if (mod(hue - currenthue,65535) < mod(65535 - hue + currenthue,65535)) {
      gap = mod(hue - currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              setHue(id,Math.round(mod(currenthue+gap/steps*i,65535)))
              resolve();
            }, freq)
          ));
        }
      }
    }
    else {
      gap = mod(65535 - hue + currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              setHue(id,Math.round(mod(currenthue-gap/steps*i,65535)))
              resolve();
            }, freq)
          ));
        }
      }
    }
  });
}

async function smoothAll(idea,hue,sat,bri,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  axios.get(masterURL).then(data => {
    currenthue = data.data[id].state.hue
    currentsat = data.data[id].state.sat
    currentbri = data.data[id].state.bri
    duration = stringToMS(duration)
    if (mod(hue - currenthue,65535) < mod(65535 - hue + currenthue,65535)) {
      gap = mod(hue - currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              setHue(id,)
              setAll(id,Math.round(mod(currenthue+gap/steps*i,65535)),Math.round(currentsat+(sat-currentsat)/steps*i),Math.round(currentbri+(bri-currentbri)/steps*i))
              resolve();
            }, freq)
          ));
        }
      }
    }
    else {
      gap = mod(65535 - hue + currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              setAll(id,Math.round(mod(currenthue-gap/steps*i,65535)),Math.round(currentsat+(sat-currentsat)/steps*i),Math.round(currentbri+(bri-currentbri)/steps*i))
              resolve();
            }, freq)
          ));
        }
      }
    }
  });
}

async function smoothHueFromHex(id,hex,duration=config.defaultSmoothHueDuration) {
  hsb = hexToHSB(hex);
  smoothHue(id,hsb['h'],duration);
}

async function smoothAllFromHex(id,hex,duration=config.defaultSmoothHueDuration) {
  hsb = hexToHSB(hex);
  smoothAll(id,hsb['h'],hsb['s'],hsb['b'],duration);
}

/*----------------------------------------- Multiple -----------------------------------------*/

/*------------------------ Base ------------------------*/

async function multipleOnOrOff(id,on) {
  for (var i = 0; i < id.length; i++) {
    setOnOrOff(id[i],on)
  }
}

async function multipleOnOrOffColor(id,on,hue,sat,bri) {
  for (var i = 0; i < id.length; i++) {
    setOnOrOffColor(id[i],on,hue,sat,bri)
  }
}

async function multipleOnOrOffColorFromHex(id,on,hex) {
  hsb = hexToHSB(hex);
  for (var i = 0; i < id.length; i++) {
    setOnOrOffColor(id[i],on,hsb['h'],hsb['s'],hsb['b'])
  }
}

async function multipleHue(id,hue) {
  for (var i = 0; i < id.length; i++) {
    setHue(id[i],hue)
  }
}

async function multipleSat(id,sat) {
  for (var i = 0; i < id.length; i++) {
    setSat(id[i],sat)
  }
}

async function multipleBri(id,bri) {
  for (var i = 0; i < id.length; i++) {
    setBri(id[i],bri)
  }
}

/*------------------------ Complex ------------------------*/

async function multipleAll(id,hue,sat,bri) {
  for (var i = 0; i < id.length; i++) {
    setAll(id[i],hue,sat,bri)
  }
}

async function multipleHueFromHex(id,hex) {
  hsb = hexToHSB(hex);
  for (var i = 0; i < id.length; i++) {
    setHue(id[i],hsb['h']);
  }
}

async function multipleAllFromHex(id,hex) {
  hsb = hexToHSB(hex);
  for (var i = 0; i < id.length; i++) {
    setAll(id[i],hsb['h'],hsb['s'],hsb['b']);
  }
}

async function multipleBlink(id,count=config.default_Blink_Count) {
  for (var i = 0; i < id.length; i++) {
    blink(id[i],count)
  }
}

async function multipleBlinkColor(id,hue,sat,bri,count=config.default_Blink_Count) {
  for (var i = 0; i < id.length; i++) {
    blinkColor(id[i],hue,sat,bri,count)
  }
}

async function multipleBlinkColorFromHex(id,hex,count=config.default_Blink_Count) {
  hsb = hexToHSB(hex);
  multipleBlinkColor(id,hsb['h'],hsb['s'],hsb['b'],count)
}

/*------------------------ Smooth ------------------------*/

async function multipleSmoothDown(id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=0) {
  duration = stringToMS(duration)
  axios.get(masterURL).then(data => {
    bri = data.data[id[0]].state.bri
    freq = Math.round(duration/steps)
    for (let i = 1,p = Promise.resolve(); i <= steps+1;i++) {
      if (i == steps+1) {
        p = p.then(_ => new Promise(resolve =>
          setTimeout(async function () {
            for (var j = 0; j < id.length; j++) {
              setOnOrOff(id[j],false);
            }
            resolve();
          }, freq)
        ));
      }
      else {
        p = p.then(_ => new Promise(resolve =>
          setTimeout(async function () {
            for (var j = 0; j < id.length; j++) {
              setBri(id[j],Math.round(bri+(value-bri)/steps*i))
            }
            resolve();
          }, freq)
        ));
      }
    }
  });
}

async function multipleSmoothUp(id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  duration = stringToMS(duration)
  axios.get(masterURL).then(data => {
    on = data.data[id[0]].state.on
    bri = data.data[id[0]].state.bri
    if (!on) {
      for (var j = 0; j < id.length; j++) {
        setOnOrOff(id[j],true);
      }
      if (bri > 1) {
        for (var j = 0; j < id.length; j++) {
          setBri(id[j],1)
        }
        bri = 1
      }
    }
    freq = Math.round(duration/steps)
    for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
      p = p.then(_ => new Promise(resolve =>
        setTimeout(async function () {
          for (var j = 0; j < id.length; j++) {
            setBri(id[j],Math.round(bri+(value-bri)/steps*i))
          }
          resolve();
        }, freq)
      ));
    }
  });
}

async function multipleSmoothUpColor(id,hue,sat,bri,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  duration = stringToMS(duration)
  bri = 1
  for (var j = 0; j < id.length; j++) {
    setOnOrOffColor(id[j],true,hue,sat,bri)
  }
  freq = Math.round(duration/steps)
  for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
    p = p.then(_ => new Promise(resolve =>
      setTimeout(async function () {
        for (var j = 0; j < id.length; j++) {
          setBri(id[j],Math.round(bri+(value-bri)/steps*i))
        }
        resolve();
      }, freq)
    ));
  }
}

async function multipleSmoothUpColorFromHex(id,hex,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) {
  hsb = hexToHSB(hex);
  multipleSmoothUpColor(id,hsb['h'],hsb['s'],hsb['b'],duration,steps,value);
}

async function multipleSmoothHue(id,hue,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  axios.get(masterURL).then(data => {
    currenthue = data.data[id[0]].state.hue
    duration = stringToMS(duration)
    if (mod(hue - currenthue,65535) < mod(65535 - hue + currenthue,65535)) {
      gap = mod(hue - currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              for (var j = 0; j < id.length; j++) {
                setHue(id[j],Math.round(mod(currenthue+gap/steps*i,65535)))
              }
              resolve();
            }, freq)
          ));
        }
      }
    }
    else {
      gap = mod(65535 - hue + currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              for (var j = 0; j < id.length; j++) {
                setHue(id[j],Math.round(mod(currenthue-gap/steps*i,65535)))
              }
              resolve();
            }, freq)
          ));
        }
      }
    }
  });
}

async function multipleSmoothAll(id,hue,sat,bri,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  axios.get(masterURL).then(data => {
    currenthue = data.data[id[0]].state.hue
    currentsat = data.data[id[0]].state.sat
    currentbri = data.data[id[0]].state.bri
    duration = stringToMS(duration)
    if (mod(hue - currenthue,65535) < mod(65535 - hue + currenthue,65535)) {
      gap = mod(hue - currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              for (var j = 0; j < id.length; j++) {
                setAll(id[j],Math.round(mod(currenthue+gap/steps*i,65535)),Math.round(currentsat+(sat-currentsat)/steps*i),Math.round(currentbri+(bri-currentbri)/steps*i))
              }
              resolve();
            }, freq)
          ));
        }
      }
    }
    else {
      gap = mod(65535 - hue + currenthue,65535)
      if (gap > 10) {
        freq = Math.round(duration/steps)
        for (let i = 1,p = Promise.resolve(); i <= steps;i++) {
          p = p.then(_ => new Promise(resolve =>
            setTimeout(async function () {
              for (var j = 0; j < id.length; j++) {
                setAll(id[j],Math.round(mod(currenthue-gap/steps*i,65535)),Math.round(currentsat+(sat-currentsat)/steps*i),Math.round(currentbri+(bri-currentbri)/steps*i))
              }
              resolve();
            }, freq)
          ));
        }
      }
    }
  });
}

async function multipleSmoothHueFromHex(id,hex,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  hsb = hexToHSB(hex);
  multipleSmoothHue(id,hsb['h'],duration,steps);
}

async function multipleSmoothAllFromHex(id,hex,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) {
  hsb = hexToHSB(hex);
  multipleSmoothAll(id,hsb['h'],hsb['s'],hsb['b'],duration,steps);
}

/*----------------------------------------- Exports -----------------------------------------*/

exports.getSimplifiedData = () => getSimplifiedData()
exports.getRoomLights = (input) => getRoomLights(input)
exports.setOnOrOff = (id,on) => setOnOrOff(id,on)
exports.setOnOrOffColor = (id,on,hue,sat,bri) => setOnOrOffColor(id,on,hue,sat,bri)
exports.setOnOrOffColorFromHex = (id,on,hex) => setOnOrOffColorFromHex(id,on,hex)
exports.setHue = (id,hue) => setHue(id,hue)
exports.setSat = (id,sat) => setSat(id,sat)
exports.setBri = (id,bri) => setBri(id,bri)
exports.setAll = (id,hue,sat,bri) => setAll(id,hue,sat,bri)
exports.setHueFromHex = (id,hex) => setHueFromHex(id,hex)
exports.setAllFromHex = (id,hex) => setAllFromHex(id,hex)
exports.blink = (id,count=config.default_Blink_Count) => blink(id,count)
exports.blinkColor = (id,hue,sat,bri,count=config.default_Blink_Count) => blinkColor(id,hue,sat,bri,count)
exports.blinkColorFromHex = (id,hex,count=config.default_Blink_Count) => blinkColorFromHex(id,hex,count)
exports.smoothDown = (id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=0) => smoothDown(id,duration,steps,value)
exports.smoothUp = (id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) => smoothUp(id,duration,steps,value)
exports.smoothUpColor = (id,hue,sat,bri,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) => smoothUpColor(id,hue,sat,bri,duration,steps,value)
exports.smoothUpColorFromHex = (id,hex,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) => smoothUpColorFromHex(id,hex,duration,steps,value)
exports.smoothHue = (id,hue,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => smoothHue(id,hue,duration,steps)
exports.smoothAll = (idea,hue,sat,bri,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => smoothAll(idea,hue,sat,bri,duration,steps)
exports.smoothHueFromHex = (id,hex,duration=config.defaultSmoothHueDuration) => smoothHueFromHex(id,hex,duration)
exports.smoothAllFromHex = (id,hex,duration=config.defaultSmoothHueDuration) => smoothAllFromHex(id,hex,duration)
exports.multipleOnOrOff = (id,on) => multipleOnOrOff(id,on)
exports.multipleOnOrOffColor = (id,on,hue,sat,bri) => multipleOnOrOffColor(id,on,hue,sat,bri)
exports.multipleOnOrOffColorFromHex = (id,on,hex) => multipleOnOrOffColorFromHex(id,on,hex)
exports.multipleHue = (id,hue) => multipleHue(id,hue)
exports.multipleSat = (id,sat) => multipleSat(id,sat)
exports.multipleBri = (id,bri) => multipleBri(id,bri)
exports.multipleAll = (id,hue,sat,bri) => multipleAll(id,hue,sat,bri)
exports.multipleHueFromHex = (id,hex) => multipleHueFromHex(id,hex)
exports.multipleAllFromHex = (id,hex) => multipleAllFromHex(id,hex)
exports.multipleBlink = (id,count=config.default_Blink_Count) => multipleBlink(id,count)
exports.multipleBlinkColor = (id,hue,sat,bri,count=config.default_Blink_Count) => multipleBlinkColor(id,hue,sat,bri,count)
exports.multipleBlinkColorFromHex = (id,hex,count=config.default_Blink_Count) => multipleBlinkColorFromHex(id,hex,count)
exports.multipleSmoothDown = (id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value) => multipleSmoothDown(id,duration,steps,value)
exports.multipleSmoothUp = (id,duration,steps,value) => multipleSmoothUp(id,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri)
exports.multipleSmoothUpColor = (id,hue,sat,bri,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) => multipleSmoothUpColor(id,hue,sat,bri,duration,steps,value)
exports.multipleSmoothUpColorFromHex = (id,hex,duration=config.defaultSmoothOnOrOffDuration,steps=config.default_Steps,value=config.default_Bri) => multipleSmoothUpColorFromHex(id,hex,duration,steps,value)
exports.multipleSmoothHue = (id,hue,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => multipleSmoothHue(id,hue,duration,steps)
exports.multipleSmoothAll = (id,hue,sat,bri,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => multipleSmoothAll(id,hue,sat,bri,duration,steps)
exports.multipleSmoothHueFromHex = (id,hex,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => multipleSmoothHueFromHex(id,hex,duration,steps)
exports.multipleSmoothAllFromHex = (id,hex,duration=config.defaultSmoothHueDuration,steps=config.default_Steps) => multipleSmoothAllFromHex(id,hex,duration,steps)
