import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import { YooCheckout } from '../lib/core/yoo-checkout.core';
import { Me } from '../lib/models';
import { getShopInfoResponse } from './test.data';
import { apiUrl } from '../lib/core';

const instance = new YooCheckout({ shopId: 'your_shop_id', secretKey: 'your_secret_key', token: 'token' });
const mockHost = `${apiUrl}/me`;

describe('Test Me(Shop) functionality', () => {
    describe('Tests for get information about shop', () => {
        let mockHttp: MockAdapter;

        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(mockHost).reply(200, getShopInfoResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });


        describe('Get info about shop', () => {
            it('should return information about shop', async () => {
                const data: Me = await instance.getShop();
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('account_id');
                expect(data).toHaveProperty('test');
                expect(data).toHaveProperty('fiscalization_enabled');
                expect(data).toHaveProperty('payment_methods');
                expect(data).toHaveProperty('status');
            });
        });
    });
});
