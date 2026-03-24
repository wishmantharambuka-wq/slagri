// Sri Lanka geographic hierarchy with coordinates
// Extracted from original map.html implementation

import { Province } from '@/lib/types/geo';

export const SRI_LANKA_HIERARCHY: Record<string, Province> = {
  western: {
    id: 'western',
    name: 'Western',
    coords: [6.9, 80.0],
    districts: {
      colombo: {
        id: 'western-colombo',
        name: 'Colombo',
        coords: [6.927, 79.861],
        provinceId: 'western',
        dsds: {
          colombo: { id: 'colombo', name: 'Colombo', type: 'DSD' },
          thimbirigasyaya: { id: 'thimbirigasyaya', name: 'Thimbirigasyaya', type: 'DSD' },
          ratmalana: { id: 'ratmalana', name: 'Ratmalana', type: 'DSD' },
          moratuwa: { id: 'moratuwa', name: 'Moratuwa', type: 'DSD' },
          dehiwala: { id: 'dehiwala', name: 'Dehiwala', type: 'DSD' },
          kotte: { id: 'kotte', name: 'Kotte', type: 'DSD' },
          kaduwela: { id: 'kaduwela', name: 'Kaduwela', type: 'DSD' },
          homagama: { id: 'homagama', name: 'Homagama', type: 'DSD' },
          maharagama: { id: 'maharagama', name: 'Maharagama', type: 'DSD' },
          padukka: { id: 'padukka', name: 'Padukka', type: 'DSD' },
          kesbewa: { id: 'kesbewa', name: 'Kesbewa', type: 'DSD' },
        },
      },
      gampaha: {
        id: 'western-gampaha',
        name: 'Gampaha',
        coords: [7.08, 79.99],
        provinceId: 'western',
        dsds: {
          gampaha: { id: 'gampaha', name: 'Gampaha', type: 'DSD' },
          negombo: { id: 'negombo', name: 'Negombo', type: 'DSD' },
          katana: { id: 'katana', name: 'Katana', type: 'DSD' },
          minuwangoda: { id: 'minuwangoda', name: 'Minuwangoda', type: 'DSD' },
          divulapitiya: { id: 'divulapitiya', name: 'Divulapitiya', type: 'DSD' },
          mirigama: { id: 'mirigama', name: 'Mirigama', type: 'DSD' },
          attanagalla: { id: 'attanagalla', name: 'Attanagalla', type: 'DSD' },
          dompe: { id: 'dompe', name: 'Dompe', type: 'DSD' },
          biyagama: { id: 'biyagama', name: 'Biyagama', type: 'DSD' },
          wattala: { id: 'wattala', name: 'Wattala', type: 'DSD' },
          jaela: { id: 'jaela', name: 'Ja-Ela', type: 'DSD' },
        },
      },
      kalutara: {
        id: 'western-kalutara',
        name: 'Kalutara',
        coords: [6.58, 79.96],
        provinceId: 'western',
        dsds: {
          kalutara: { id: 'kalutara', name: 'Kalutara', type: 'DSD' },
          beruwala: { id: 'beruwala', name: 'Beruwala', type: 'DSD' },
          dodangoda: { id: 'dodangoda', name: 'Dodangoda', type: 'DSD' },
          matugama: { id: 'matugama', name: 'Matugama', type: 'DSD' },
          agalawatta: { id: 'agalawatta', name: 'Agalawatta', type: 'DSD' },
          bulathsinhala: { id: 'bulathsinhala', name: 'Bulathsinhala', type: 'DSD' },
          ingiriya: { id: 'ingiriya', name: 'Ingiriya', type: 'DSD' },
          bandargama: { id: 'bandargama', name: 'Bandaragama', type: 'DSD' },
          horana: { id: 'horana', name: 'Horana', type: 'DSD' },
          panadura: { id: 'panadura', name: 'Panadura', type: 'DSD' },
        },
      },
    },
  },
  central: {
    id: 'central',
    name: 'Central',
    coords: [7.2, 80.6],
    districts: {
      kandy: {
        id: 'central-kandy',
        name: 'Kandy',
        coords: [7.29, 80.63],
        provinceId: 'central',
        dsds: {
          kandy: { id: 'kandy', name: 'Kandy', type: 'DSD' },
          kundasale: { id: 'kundasale', name: 'Kundasale', type: 'DSD' },
          harispattuwa: { id: 'harispattuwa', name: 'Harispattuwa', type: 'DSD' },
          akurana: { id: 'akurana', name: 'Akurana', type: 'DSD' },
          pathahewaheta: { id: 'pathahewaheta', name: 'Pathahewaheta', type: 'DSD' },
          udunuwara: { id: 'udunuwara', name: 'Udunuwara', type: 'DSD' },
          yatinuwara: { id: 'yatinuwara', name: 'Yatinuwara', type: 'DSD' },
          delthota: { id: 'delthota', name: 'Delthota', type: 'DSD' },
        },
      },
      nuwara_eliya: {
        id: 'central-nuwara_eliya',
        name: 'Nuwara Eliya',
        coords: [6.97, 80.77],
        provinceId: 'central',
        dsds: {
          nuwara_eliya: { id: 'nuwara_eliya', name: 'Nuwara Eliya', type: 'DSD' },
          kothmale: { id: 'kothmale', name: 'Kothmale', type: 'DSD' },
          hanguranketha: { id: 'hanguranketha', name: 'Hanguranketha', type: 'DSD' },
          walapane: { id: 'walapane', name: 'Walapane', type: 'DSD' },
          ambagamuwa: { id: 'ambagamuwa', name: 'Ambagamuwa', type: 'DSD' },
        },
      },
      matale: {
        id: 'central-matale',
        name: 'Matale',
        coords: [7.46, 80.62],
        provinceId: 'central',
        dsds: {
          matale: { id: 'matale', name: 'Matale', type: 'DSD' },
          ukuwela: { id: 'ukuwela', name: 'Ukuwela', type: 'DSD' },
          rattota: { id: 'rattota', name: 'Rattota', type: 'DSD' },
          dambulla: { id: 'dambulla', name: 'Dambulla', type: 'DSD' },
          galewela: { id: 'galewela', name: 'Galewela', type: 'DSD' },
          naula: { id: 'naula', name: 'Naula', type: 'DSD' },
        },
      },
    },
  },
  southern: {
    id: 'southern',
    name: 'Southern',
    coords: [6.05, 80.22],
    districts: {
      galle: {
        id: 'southern-galle',
        name: 'Galle',
        coords: [6.05, 80.22],
        provinceId: 'southern',
        dsds: {
          galle: { id: 'galle', name: 'Galle', type: 'DSD' },
          haberaduwa: { id: 'haberaduwa', name: 'Habaraduwa', type: 'DSD' },
          baddegama: { id: 'baddegama', name: 'Baddegama', type: 'DSD' },
          hikkaduwa: { id: 'hikkaduwa', name: 'Hikkaduwa', type: 'DSD' },
          ambalangoda: { id: 'ambalangoda', name: 'Ambalangoda', type: 'DSD' },
          elpitiya: { id: 'elpitiya', name: 'Elpitiya', type: 'DSD' },
          bentota: { id: 'bentota', name: 'Bentota', type: 'DSD' },
        },
      },
      matara: {
        id: 'southern-matara',
        name: 'Matara',
        coords: [5.95, 80.55],
        provinceId: 'southern',
        dsds: {
          matara: { id: 'matara', name: 'Matara', type: 'DSD' },
          devinuwara: { id: 'devinuwara', name: 'Devinuwara', type: 'DSD' },
          dickwella: { id: 'dickwella', name: 'Dickwella', type: 'DSD' },
          weligama: { id: 'weligama', name: 'Weligama', type: 'DSD' },
          akuressa: { id: 'akuressa', name: 'Akuressa', type: 'DSD' },
          kamburupitiya: { id: 'kamburupitiya', name: 'Kamburupitiya', type: 'DSD' },
        },
      },
      hambantota: {
        id: 'southern-hambantota',
        name: 'Hambantota',
        coords: [6.14, 81.12],
        provinceId: 'southern',
        dsds: {
          hambantota: { id: 'hambantota', name: 'Hambantota', type: 'DSD' },
          ambalantota: { id: 'ambalantota', name: 'Ambalantota', type: 'DSD' },
          tangalle: { id: 'tangalle', name: 'Tangalle', type: 'DSD' },
          beliatta: { id: 'beliatta', name: 'Beliatta', type: 'DSD' },
          tissamaharama: { id: 'tissamaharama', name: 'Tissamaharama', type: 'DSD' },
          lunugamvehera: { id: 'lunugamvehera', name: 'Lunugamvehera', type: 'DSD' },
        },
      },
    },
  },
  northern: {
    id: 'northern',
    name: 'Northern',
    coords: [9.66, 80.02],
    districts: {
      jaffna: {
        id: 'northern-jaffna',
        name: 'Jaffna',
        coords: [9.66, 80.02],
        provinceId: 'northern',
        dsds: {
          jaffna: { id: 'jaffna', name: 'Jaffna', type: 'DSD' },
          nallur: { id: 'nallur', name: 'Nallur', type: 'DSD' },
          chavakachcheri: { id: 'chavakachcheri', name: 'Chavakachcheri', type: 'DSD' },
          point_pedro: { id: 'point_pedro', name: 'Point Pedro', type: 'DSD' },
        },
      },
      kilinochchi: {
        id: 'northern-kilinochchi',
        name: 'Kilinochchi',
        coords: [9.38, 80.41],
        provinceId: 'northern',
        dsds: {
          karachchi: { id: 'karachchi', name: 'Karachchi', type: 'DSD' },
          poonakary: { id: 'poonakary', name: 'Poonakary', type: 'DSD' },
        },
      },
      mannar: {
        id: 'northern-mannar',
        name: 'Mannar',
        coords: [8.97, 79.9],
        provinceId: 'northern',
        dsds: {
          mannar: { id: 'mannar', name: 'Mannar', type: 'DSD' },
          nanattan: { id: 'nanattan', name: 'Nanattan', type: 'DSD' },
          musali: { id: 'musali', name: 'Musali', type: 'DSD' },
        },
      },
      vavuniya: {
        id: 'northern-vavuniya',
        name: 'Vavuniya',
        coords: [8.75, 80.49],
        provinceId: 'northern',
        dsds: {
          vavuniya: { id: 'vavuniya', name: 'Vavuniya', type: 'DSD' },
          vavuniya_north: { id: 'vavuniya_north', name: 'Vavuniya North', type: 'DSD' },
        },
      },
      mullaitivu: {
        id: 'northern-mullaitivu',
        name: 'Mullaitivu',
        coords: [9.26, 80.81],
        provinceId: 'northern',
        dsds: {
          puttukudiyiruppu: { id: 'puttukudiyiruppu', name: 'Puthukudiyiruppu', type: 'DSD' },
          oddusuddan: { id: 'oddusuddan', name: 'Oddusuddan', type: 'DSD' },
        },
      },
    },
  },
  eastern: {
    id: 'eastern',
    name: 'Eastern',
    coords: [7.87, 81.5],
    districts: {
      batticaloa: {
        id: 'eastern-batticaloa',
        name: 'Batticaloa',
        coords: [7.73, 81.67],
        provinceId: 'eastern',
        dsds: {
          batticaloa: { id: 'batticaloa', name: 'Batticaloa', type: 'DSD' },
          kattankudy: { id: 'kattankudy', name: 'Kattankudy', type: 'DSD' },
          eravur: { id: 'eravur', name: 'Eravur', type: 'DSD' },
        },
      },
      ampara: {
        id: 'eastern-ampara',
        name: 'Ampara',
        coords: [7.28, 81.67],
        provinceId: 'eastern',
        dsds: {
          ampara: { id: 'ampara', name: 'Ampara', type: 'DSD' },
          kalmunai: { id: 'kalmunai', name: 'Kalmunai', type: 'DSD' },
          sammanthurai: { id: 'sammanthurai', name: 'Sammanthurai', type: 'DSD' },
          akkaraipattu: { id: 'akkaraipattu', name: 'Akkaraipattu', type: 'DSD' },
        },
      },
      trincomalee: {
        id: 'eastern-trincomalee',
        name: 'Trincomalee',
        coords: [8.58, 81.21],
        provinceId: 'eastern',
        dsds: {
          trincomalee: { id: 'trincomalee', name: 'Trincomalee', type: 'DSD' },
          kinniya: { id: 'kinniya', name: 'Kinniya', type: 'DSD' },
          muttur: { id: 'muttur', name: 'Muttur', type: 'DSD' },
        },
      },
    },
  },
  north_central: {
    id: 'north_central',
    name: 'North Central',
    coords: [8.3, 80.4],
    districts: {
      anuradhapura: {
        id: 'north_central-anuradhapura',
        name: 'Anuradhapura',
        coords: [8.31, 80.4],
        provinceId: 'north_central',
        dsds: {
          anuradhapura: { id: 'anuradhapura', name: 'Anuradhapura', type: 'DSD' },
          thambuttegama: { id: 'thambuttegama', name: 'Thambuttegama', type: 'DSD' },
          kekirawa: { id: 'kekirawa', name: 'Kekirawa', type: 'DSD' },
          mihinthale: { id: 'mihinthale', name: 'Mihinthale', type: 'DSD' },
        },
      },
      polonnaruwa: {
        id: 'north_central-polonnaruwa',
        name: 'Polonnaruwa',
        coords: [7.94, 81.01],
        provinceId: 'north_central',
        dsds: {
          polonnaruwa: { id: 'polonnaruwa', name: 'Polonnaruwa', type: 'DSD' },
          hingurakgoda: { id: 'hingurakgoda', name: 'Hingurakgoda', type: 'DSD' },
          medirigiriya: { id: 'medirigiriya', name: 'Medirigiriya', type: 'DSD' },
        },
      },
    },
  },
  uva: {
    id: 'uva',
    name: 'Uva',
    coords: [6.98, 81.05],
    districts: {
      badulla: {
        id: 'uva-badulla',
        name: 'Badulla',
        coords: [6.98, 81.05],
        provinceId: 'uva',
        dsds: {
          badulla: { id: 'badulla', name: 'Badulla', type: 'DSD' },
          Bandarawela: { id: 'bandarawela', name: 'Bandarawela', type: 'DSD' },
          haputale: { id: 'haputale', name: 'Haputale', type: 'DSD' },
          welimada: { id: 'welimada', name: 'Welimada', type: 'DSD' },
        },
      },
      monaragala: {
        id: 'uva-monaragala',
        name: 'Monaragala',
        coords: [6.89, 81.34],
        provinceId: 'uva',
        dsds: {
          monaragala: { id: 'monaragala', name: 'Monaragala', type: 'DSD' },
          wellawaya: { id: 'wellawaya', name: 'Wellawaya', type: 'DSD' },
          buttala: { id: 'buttala', name: 'Buttala', type: 'DSD' },
          kataragama: { id: 'kataragama', name: 'Kataragama', type: 'DSD' },
        },
      },
    },
  },
  sabaragamuwa: {
    id: 'sabaragamuwa',
    name: 'Sabaragamuwa',
    coords: [6.7, 80.4],
    districts: {
      ratnapura: {
        id: 'sabaragamuwa-ratnapura',
        name: 'Ratnapura',
        coords: [6.68, 80.39],
        provinceId: 'sabaragamuwa',
        dsds: {
          ratnapura: { id: 'ratnapura', name: 'Ratnapura', type: 'DSD' },
          balangoda: { id: 'balangoda', name: 'Balangoda', type: 'DSD' },
          embryipitiya: { id: 'embryipitiya', name: 'Embilipitiya', type: 'DSD' },
        },
      },
      kegalle: {
        id: 'sabaragamuwa-kegalle',
        name: 'Kegalle',
        coords: [7.12, 80.32],
        provinceId: 'sabaragamuwa',
        dsds: {
          kegalle: { id: 'kegalle', name: 'Kegalle', type: 'DSD' },
          mawanella: { id: 'mawanella', name: 'Mawanella', type: 'DSD' },
          warakapola: { id: 'warakapola', name: 'Warakapola', type: 'DSD' },
        },
      },
    },
  },
  north_western: {
    id: 'north_western',
    name: 'North Western',
    coords: [7.7, 80.0],
    districts: {
      kurunegala: {
        id: 'north_western-kurunegala',
        name: 'Kurunegala',
        coords: [7.48, 80.36],
        provinceId: 'north_western',
        dsds: {
          kurunegala: { id: 'kurunegala', name: 'Kurunegala', type: 'DSD' },
          kuliyapitiya: { id: 'kuliyapitiya', name: 'Kuliyapitiya', type: 'DSD' },
          nikaweratiya: { id: 'nikaweratiya', name: 'Nikaweratiya', type: 'DSD' },
          wariyapola: { id: 'wariyapola', name: 'Wariyapola', type: 'DSD' },
        },
      },
      puttalam: {
        id: 'north_western-puttalam',
        name: 'Puttalam',
        coords: [8.04, 79.83],
        provinceId: 'north_western',
        dsds: {
          puttalam: { id: 'puttalam', name: 'Puttalam', type: 'DSD' },
          chilaw: { id: 'chilaw', name: 'Chilaw', type: 'DSD' },
          wennappuwa: { id: 'wennappuwa', name: 'Wennappuwa', type: 'DSD' },
        },
      },
    },
  },
};

// Flatten to get all districts as array
export function flattenDistricts(): Array<{ name: string; coords: [number, number]; provinceId: string }> {
  const result: Array<{ name: string; coords: [number, number]; provinceId: string }> = [];
  Object.values(SRI_LANKA_HIERARCHY).forEach((province) => {
    Object.values(province.districts).forEach((district) => {
      result.push({
        name: district.name,
        coords: district.coords,
        provinceId: province.id,
      });
    });
  });
  return result;
}

// Get district by name
export function getDistrictByName(name: string) {
  for (const province of Object.values(SRI_LANKA_HIERARCHY)) {
    for (const district of Object.values(province.districts)) {
      if (district.name.toLowerCase() === name.toLowerCase()) {
        return { ...district, province };
      }
    }
  }
  return null;
}

// Province list
export const PROVINCE_LIST = Object.values(SRI_LANKA_HIERARCHY);
