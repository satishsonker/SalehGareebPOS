export const commonLogic = {
  toQueryString: (obj, paramName) => {
    const params = new URLSearchParams();

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (!paramName) {
          params.append(key, String(value));
        } else {
          params.append(`${paramName}.${key}`, String(value));
        }
      }
    });
    return params.toString();
  },
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', {
      month: 'short'
    });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  },
  calculateGradeAndMaxCrystalPacket: (price) => {

    if (Number(price) <= 0)
      return {
        grade: '',
        maxCrystalPackets: 0
      };
    const slabs = [
      [750, 'C+', 2],
      [950, 'C', 3.5],
      [1200, 'B++', 5],
      [1500, 'B+', 6],
      [1800, 'B', 8],
      [2200, 'B', 10],
      [2500, 'A+', 12],
      [3000, 'A+', 14],
      [3500, 'A', 17],
      [5000, 'AA', 25],
      [100000, 'AAA', 30]
    ];

    const [_, grade, maxCrystalPackets] =
      slabs.find(([maxPrice]) => Number(price) <= maxPrice) || slabs.at(-1);

    return {
      grade,
      maxCrystalPackets
    };
  },
  workTypeCodesAbbr: (code) => {
    const workTypeCodes = {
      "1": "DSN",
      "2": "CUT",
      "3": "EMB",
      "4": "CRY",
      "5": "HEM",
      "6": "APL",
      "7": "STC",
      "0": "ALL"
    };
    return workTypeCodes[code] || code;
  },
  advancePercentage: [10, 20, 30, 40, 50, 60, 70],
  capitalizeFirstLetter: (str) => {
    if (!str) return ''; // Handle empty strings safely
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  defaultIfEmpty: (input, defaultValue) => {
    if (input === undefined || input === null || input === "")
      return defaultValue;
    return input;
  },
  calculatePercent: (amount, percent) => {
    return (amount / 100) * percent;
  },
  calculateVAT: (amount, vat=5) => {
    let vatAmount = (amount / 100) * vat;
    let totalAmount = vatAmount + amount;
    return { vatAmount, amountWithVat: totalAmount }
  },
  printDecimal: (number, defaultBlank) => {
    defaultBlank = commonLogic.defaultIfEmpty(defaultBlank, false);
    number = parseFloat(number);
    if (isNaN(number)) {
      if (!defaultBlank)
        return 0.00
      return "";
    }
    return number.toFixed(2);
  },
  throttling: (callback, wait, args) => {
    var timer = setTimeout(() => {
      callback(args);
      timer = undefined;
    }, wait);
    if (timer)
      return;
  },
   getHtmlDate: (date, format = "yyyymmdd") => {
        if (date === undefined)
            return "";
        if (typeof date !== "object") {
            date = new Date(date);
        }
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = (date.getDate()).toString().padStart(2, '0');
        var m = (date.getMinutes()).toString().padStart(2, '0');
        var s = (date.getSeconds()).toString().padStart(2, '0');
        var hours = date.getHours();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        if (format === "yyyymmdd")
            return `${date.getFullYear()}-${month}-${day}`;
        if (format === "ddmmyyyy")
            return `${day}-${month}-${date.getFullYear()}`;
        if (format === "ddmmyy")
            return `${day}-${month}-${date.getFullYear().toString().substr(2,2)}`;
        if (format === "ddmmyyyyhhmmss")
            return `${day}-${month}-${date.getFullYear()} ${hours.toString().padStart(2, '0')}:${m}:${s} ${ampm}`;
        if (format === "ddmmyyyyhhmm")
            return `${day}-${month}-${date.getFullYear()} ${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
    },
}