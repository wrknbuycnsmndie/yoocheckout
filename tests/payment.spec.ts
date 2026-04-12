import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { v7 as uuid } from 'uuid';
import axios from 'axios';

import { YooCheckout } from '../lib/core/yoo-checkout.core';
import { Payment, paymentFactory } from '../lib/models';
import {
    cancelPaymentResponse,
    capturePaymentResponse,
    createPaymentData,
    createPaymentResponse,
    getPaymentListResponse,
    getPaymentResponse
} from './test.data';
import { IPaymentList } from '../lib/types';
import { apiUrl } from '../lib/core';

const instance = new YooCheckout({ shopId: 'your_shop_id', secretKey: 'your_secret_key' });
const mockHost = `${apiUrl}/payments`;

describe('Test Payment functionality', () => {
    describe('Tests for creating payment', () => {
        let mockHttp: MockAdapter;

        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(mockHost, createPaymentData).reply(200, createPaymentResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });


        describe('Creating payment', () => {
            it('should success create new payment', async () => {
                const data: Payment = await instance.createPayment(createPaymentData, uuid());
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('payment_method');
                expect(data).toHaveProperty('recipient');
            });
        });
    });

    describe('Tests for get information about payment', () => {
        let mockHttp: MockAdapter;
        const id = uuid();
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(`${mockHost}/${id}`).reply(200, getPaymentResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get info about payment by id', () => {
            it('should return information about payment', async () => {
                const data: Payment = await instance.getPayment(id);
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('paid');
                expect(data).toHaveProperty('payment_method');
                expect(data).toHaveProperty('recipient');
            });
        });
    });

    describe('Tests for payment confirm', () => {
        let mockHttp: MockAdapter;
        const id = uuid();
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(`${mockHost}/${id}/capture`).reply(200, capturePaymentResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Confirmation payment', () => {
            it('should return information about success confirmed payment', async () => {
                const data: Payment = await instance.capturePayment(id, createPaymentResponse);
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('paid');
                expect(data.paid).toBe(true);
                expect(data).toHaveProperty('payment_method');
                expect(data).toHaveProperty('recipient');
            });
        });
    });

    describe('Tests for cancel payment', () => {
        let mockHttp: MockAdapter;
        const id = uuid();
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(`${mockHost}/${id}/cancel`).reply(200, cancelPaymentResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Cancel payment', () => {
            it('should return information about canceled payment', async () => {
                const data: Payment = await instance.cancelPayment(id);
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('paid');
                expect(data.status).toBe('canceled');
                expect(data).toHaveProperty('payment_method');
                expect(data).toHaveProperty('recipient');
            });
        });
    });

    describe('Tests for get payment list', () => {
        let mockHttp: MockAdapter;
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(mockHost).reply(200, getPaymentListResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get payment list', () => {
            it('should return payment list', async () => {
                const data: IPaymentList = await instance.getPaymentList({});
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('next_cursor');
                expect(data.items).toHaveLength(1);
                expect(data.items).toContainEqual(paymentFactory(getPaymentListResponse.items[0]));
            });
        });
    });
});
