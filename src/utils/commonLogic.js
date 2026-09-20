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

    if (Number(price)<=0)
      return {
        grade:'',
        maxCrystalPackets:0
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
  workTypeCodesAbbr:(code) => {
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
  advancePercentage:[10, 20, 30, 40, 50,60,70]
}