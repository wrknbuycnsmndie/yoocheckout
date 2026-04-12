import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { v7 as uuid } from 'uuid';
import axios from 'axios';

import { YooCheckout } from '../lib/core/yoo-checkout.core';
import { Refund, refundFactory } from '../lib/models';
import {
    createAndGetRefundResponse,
    createRefundData,
    getRefundListResponse
} from './test.data';
import { IRefundList } from '../lib/types';
import { apiUrl } from '../lib/core';

const instance = new YooCheckout({ shopId: 'your_shop_id', secretKey: 'your_secret_key' });
const mockHost = `${apiUrl}/refunds`;

describe('Test Refund functionality', () => {
    describe('Tests for creating refund', () => {
        let mockHttp: MockAdapter;

        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(mockHost, createRefundData).reply(200, createAndGetRefundResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });


        describe('Creating refund', () => {
            it('should success create new refund', async () => {
                const data: Refund = await instance.createRefund(createRefundData, uuid());
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('amount');
                expect(data.status).toBe('succeeded');
                expect(data).toHaveProperty('payment_id');
            });
        });
    });

    describe('Tests for get information about refund', () => {
        let mockHttp: MockAdapter;
        const id = uuid();
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(`${mockHost}/${id}`).reply(200, createAndGetRefundResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get info about refund', () => {
            it('should return information about refund', async () => {
                const data: Refund = await instance.getRefund(id);
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('amount');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('payment_id');
            });
        });
    });

    describe('Tests for get refund list', () => {
        let mockHttp: MockAdapter;
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(mockHost).reply(200, getRefundListResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get refund list', () => {
            it('should return refund list', async () => {
                const data: IRefundList = await instance.getRefundList({});
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('next_cursor');
                expect(data.items).toHaveLength(1);
                expect(data.items).toContainEqual(refundFactory(getRefundListResponse.items[0]));
            });
        });
    });
});
