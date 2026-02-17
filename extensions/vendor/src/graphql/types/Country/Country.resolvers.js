import { select } from '@evershop/postgres-query-builder';
import { provinces } from '../../../lib/locale/provinces.js';
import { countries } from '../../../lib/locale/countries.js';

export default {
  Query: {
    countries: (_, argument) => {
      const list = argument?.countries || [];
      if (list.length === 0) {
        return countries;
      } else {
        return countries.filter((c) => list.includes(c.code));
      }
    },

    // 👇 รับ pool จาก context แทนการ import
    allowedCountries: async (_, __, { pool }) => {
      const allowedCountries = await select('country')
        .from('shipping_zone')
        .execute(pool);

      return countries.filter((c) =>
        allowedCountries.find((p) => p.country === c.code)
      );
    }
  },

  Country: {
    name: (country) => {
      if (country.name) return country.name;
      const c = countries.find((p) => p.code === country);
      return c?.name;
    },

    code: (country) => {
      if (country.code) return country.code;
      return country;
    },

    provinces: (country) =>
      provinces.filter((p) => p.countryCode === country.code)
  }
};
