import phoneServer from "fullstack-phone/server";
import phoneClient from "fullstack-phone/client";
const meta = phoneServer.loadMeta();
const phoneHandler = phoneClient.createPhoneHandler(meta);

/**
 * Get random int between min and max (inclusive)
 * https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range/1527820#1527820
 * @param {*} min
 * @param {*} max
 * @returns
 */
 function getRandomInt({ min = 0, max = 99 } = {}) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate a random string of digits of given length
 * @param {number} length
 * @return {string} the digit sequence
 */
function getRandomDigits(length = 1) {
    return new Array(length)
        .fill(1) // fill with 1's because map doesn't do anything with empty elements
        .map(() => getRandomInt({ min: 0, max: 9 })) // replace each 1 with a random single digit
        .join(""); // join into a string
}

/**
 * Given country and phone type, generate a random, valid phone number
 * Using example phone number to get the proper length
 * And preserving the first 3 digits of the example number (to make finding a valid number faster)
 *
 * @param {string} region
 * @return {Object} {countryCode, nationalNumber} random but valid nationalNumber
 */
function generateRandomPhoneNumber(region) {
    const {
        countryCode,
        nationalNumber: seedNumber
    } = (phoneHandler.getExampleNumberForType("MOBILE", region) || phoneHandler.getExampleNumberForType("FIXED_LINE", region)); // some regions don't have mobile numbers, so fall back to fixed line
    const constant = seedNumber.substring(0, 3); // keep first 3 numbers from example phone (otherwise finding a valid number can take forever)
    const remainingLength = seedNumber.length - 3;

    let nationalNumber, newPhoneObj;
    // generate random numbers until it's a valid number for the region
    do {
        nationalNumber = constant + getRandomDigits(remainingLength);
        newPhoneObj = { countryCode, nationalNumber };
        // console.log("Trying", country, nationalNumber);
    } while (phoneHandler.validatePhoneNumber(newPhoneObj, region) instanceof Error);
    return { countryCode, nationalNumber };
}


function main() {

    phoneHandler.getSupportedRegions().sort().forEach(region => {
        const element = document.createElement("div");
        const {
            countryCode = "",
            nationalNumber = ""
        } = (generateRandomPhoneNumber(region) || {});
        element.innerHTML = `${region} <b>+${countryCode}</b> ${nationalNumber} <a href="https://libphonenumber.appspot.com/phonenumberparser?number=%2B${countryCode}${nationalNumber}">libphonenumber</a>`;
        document.body.appendChild(element);
    });
}

main();
