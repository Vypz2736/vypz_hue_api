/*-------------------- Get --------------------*/

getSimplifiedData()
//returns promise array of all the lights

getRoomLights(input)
//returns array of lights IDs

/*-------------------- Single --------------------*/

/*---------- Simple ----------*/

setOnOrOff(id,on)
//sets the light on or off

setOnOrOffColor(id,on,hue,sat,bri)
//sets the light on or off and sets a color

setOnOrOffColorFromHex(id,on,hex)

setHue(id,hue)
//sets the hue of the light

setSat(id,sat)
//sets the sat of the light

setBri(id,bri)
//sets the bri of the light

/*---------- Complex ----------*/

setAll(id,hue,sat,bri)
//sets all the values of the light to the selected color

setHueFromHex(id,hex)
//sets the hue of the light to the selected color from hexadecimal code

setAllFromHex(id,hex)
//sets all the values of the light to the selected color from hexadecimal code

blink(id,count)
//blinks the light

blinkColor(id,hue,sat,bri,count)
//blink the light with specific color

blinkColorFromHex(id,hex,count)
//blink the light with specific color from hexadecimal code

/*---------- Smooth ----------*/

smoothDown(id,duration,steps,value)
//smoothly decreases the light brightess to specified value (or zero) with specified duration and number or steps

smoothUp(id,duration,steps,value)
//smoothly increases the light brightess to specified value (or config default) with specified duration and number or steps

smoothUpColor(id,hue,sat,bri,duration,steps,value)
//smoothly decreases the light brightess to specified color with specified value (or zero) with specified duration and number or steps

smoothUpColorFromHex(id,hex,duration,steps,value)
//smoothly decreases the light brightess to specified color from hex with specified value (or zero) with specified duration and number or steps

smoothHue(id,hue,duration,steps)
//smoothly sets the hue of the light to specified hue with specified duration and steps

smoothAll(idea,hue,sat,bri,duration,steps)
//smoothly sets all the values of the light to specified color with specified duration and steps

smoothHueFromHex(id,hex,duration)
//smoothly sets the hue of the light to specified hue from hex with specified duration and steps

smoothAllFromHex(id,hex,duration)
//smoothly sets all the values of the light to specified color from hex with specified duration and steps

/*-------------------- Multiple --------------------*/

/*---------- Simple ----------*/

multipleOnOrOff(id,on)
//sets the array of lights on or off

multipleOnOrOffColor(id,on,hue,sat,bri)
//sets the array of lights on or off and sets a color

multipleOnOrOffColorFromHex(id,on,hex)

multipleHue(id,hue)
//sets the hue of the array of lights

multipleSat(id,sat)
//sets the sat of the array of lights

multipleBri(id,bri)
//sets the bri of the array of lights

/*---------- Complex ----------*/

multipleAll(id,hue,sat,bri)
//sets all the values of the array of lights to the selected color

multipleHueFromHex(id,hex)
//sets the hue of the array of lights to the selected color from hexadecimal code

multipleAllFromHex(id,hex)
//sets all the values of the array of lights to the selected color from hexadecimal code

multipleBlink(id,count)
//blinks the array of lights

multipleBlinkColor(id,hue,sat,bri,count)
//blink the array of lights with specific color

multipleBlinkColorFromHex(id,hex,count)
//blink the array of lights with specific color from hexadecimal code

/*---------- Smooth ----------*/

multipleSmoothDown(id,duration,steps,value)
//smoothly decreases the array of lights brightess to specified value (or zero) with specified duration and number or steps

multipleSmoothUp(id,duration,steps,value)
//smoothly increases the array of lights brightess to specified value (or config default) with specified duration and number or steps

multipleSmoothUpColor(id,hue,sat,bri,duration,steps,value)
//smoothly decreases the array of lights brightess to specified color with specified value (or zero) with specified duration and number or steps

multipleSmoothUpColorFromHex(id,hex,duration,steps,value)
//smoothly decreases the array of lights brightess to specified color from hex with specified value (or zero) with specified duration and number or steps

multipleSmoothHue(id,hue,duration,steps)
//smoothly sets the hue of the array of lights to specified hue with specified duration and steps

multipleSmoothAll(idea,hue,sat,bri,duration,steps)
//smoothly sets all the values of the array of lights to specified color with specified duration and steps

multipleSmoothHueFromHex(id,hex,duration)
//smoothly sets the hue of the array of lights to specified hue from hex with specified duration and steps

multipleSmoothAllFromHex(id,hex,duration)
//smoothly sets all the values of the array of lights to specified color from hex with specified duration and steps
