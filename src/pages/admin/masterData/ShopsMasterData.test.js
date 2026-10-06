import { normalizeShopPayload } from './ShopsMasterData';

describe('normalizeShopPayload', () => {
  it('converts camelCase Arabic keys to the API snake_case shape', () => {
    const payload = {
      name: 'Shop 1',
      arName: 'متجر 1',
      arAddress1: 'العنوان 1',
      arAddress2: 'العنوان 2',
      arAddress3: 'العنوان 3',
      arMobile: '0500000000',
      custSupportHeadingus: 'Support',
    };

    expect(normalizeShopPayload(payload)).toEqual({
      name: 'Shop 1',
      ar_name: 'متجر 1',
      ar_address1: 'العنوان 1',
      ar_address2: 'العنوان 2',
      ar_address3: 'العنوان 3',
      ar_mobile: '0500000000',
      custSupportHeadingus: 'Support',
    });
  });
});
