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
 * Given region and phone type, generate a random, valid phone number
 * Using example phone number to get the proper length
 * And preserving the first 3 digits of the example number (to make finding a valid number faster)
 *
 * @param {string} region
 * @param {string} type 'MOBILE', 'FIXED_LINE', etc.
 * @return {Object|null} {countryCode, nationalNumber} random but valid nationalNumber
 *                       null if the country doesn't have that type of phone number
 */
function generateRandomPhoneNumber(type, region) {
  const examplePhone = phoneHandler.getExampleNumberForType(type, region);
  // some regions don't have mobile numbers (just TA?)
  if (!examplePhone) {
    return null;
  }
  const { countryCode, nationalNumber: seedNumber } = examplePhone;
  const constant = seedNumber.substring(0, 3); // keep first 3 numbers from example phone (otherwise finding a valid number can take forever)
  const remainingLength = seedNumber.length - 3;

  let nationalNumber, newPhoneObj;
  // generate random numbers until it's a valid number for the region and matches the requested type
  do {
    nationalNumber = constant + getRandomDigits(remainingLength);
    newPhoneObj = { countryCode, nationalNumber };
    // console.log('Trying', country, nationalNumber);
  } while (!isValidForTypeAndRegion(newPhoneObj, region, type));
  return { countryCode, nationalNumber };
}

/**
 * Determine if given phoneObj is valid for the region and matches the type
 * Note: Returns true if the phone is FIXED_LINE_OR_MOBILE
 * @param {Object} phoneObj
 * @param {string} region
 * @param {string} type MOBILE or FIXED_LINE
 * @returns {Boolean}
 */
function isValidForTypeAndRegion(phoneObj, region, type) {
  // first check if the phone is valid for the region
  if (phoneHandler.validatePhoneNumber(phoneObj, region) instanceof Error) {
    return false;
  }
  // then check if it matches the type
  // can be lenient with FIXED_LINE_OR_MOBILE
  const phoneType = phoneHandler.inferPhoneNumberType(phoneObj);
  if (phoneType === "FIXED_LINE_OR_MOBILE" || phoneType === type) {
    return true;
  }
  return false;
}

// html template for example text
const getExampleHtml = ({ countryCode, nationalNumber }) =>
  `<b>+${countryCode}</b> ${nationalNumber} <a href='https://libphonenumber.appspot.com/phonenumberparser?number=%2B${countryCode}${nationalNumber}'>libphonenumber</a>`;

function main() {
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  headerRow.innerHTML =
    "<th>Region</th><th>Mobile Number</th><th>Fixed Line Number</th>";
  table.appendChild(headerRow);

  phoneHandler
    .getSupportedRegions()
    .sort()
    .forEach((region) => {
      const row = document.createElement("tr");

      // region cell
      const regionCell = document.createElement("td");
      regionCell.append(region);
      row.appendChild(regionCell);

      // mobile number cell
      const mobileCell = document.createElement("td");
      const mobileExample = generateRandomPhoneNumber("MOBILE", region);
      mobileCell.innerHTML = mobileExample
        ? getExampleHtml(mobileExample)
        : "N/A";
      row.appendChild(mobileCell);

      // fixed line number cell
      const fixedLineCell = document.createElement("td");
      const fixedLineExample = generateRandomPhoneNumber("FIXED_LINE", region);
      fixedLineCell.innerHTML = fixedLineExample
        ? getExampleHtml(fixedLineExample)
        : "N/A";
      row.appendChild(fixedLineCell);

      table.appendChild(row);
    });
  document.body.appendChild(table);
}

main();
