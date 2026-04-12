import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { v7 as uuid } from 'uuid';
import axios from 'axios';

import { YooCheckout } from '../lib/core/yoo-checkout.core';
import { Receipt, receiptFactory } from '../lib/models';
import {
    createReceiptData,
    createReceiptResponse,
    getReceiptListResponse,
    getReceiptResponse
} from './test.data';
import { IReceiptList } from '../lib/types';
import { apiUrl } from '../lib/core';

const instance = new YooCheckout({ shopId: 'your_shop_id', secretKey: 'your_secret_key' });
const mockHost = `${apiUrl}/receipts`;

describe('Test Receipt functionality', () => {
    describe('Tests for creating receipt', () => {
        let mockHttp: MockAdapter;

        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(mockHost, createReceiptData).reply(200, createReceiptResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });


        describe('Creating receipt', () => {
            it('should success create new receipt', async () => {
                const data: Receipt = await instance.createReceipt(createReceiptData, uuid());
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('refund_id');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('settlements');
                expect(data).toHaveProperty('tax_system_code');
                expect(data.status).toBe('succeeded');
                expect(data.items).toHaveLength(createReceiptData.items.length);
                expect(data.settlements).toHaveLength(createReceiptData.settlements.length);
                expect(data.tax_system_code).toBe(1);
                expect(data.refund_id).toBe(createReceiptData.refund_id);
                expect(data.type).toBe(createReceiptResponse.type);
            });
        });
    });

    describe('Tests for get information about receipt', () => {
        let mockHttp: MockAdapter;
        const id = uuid();
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(`${mockHost}/${id}`).reply(200, getReceiptResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get info about receipt', () => {
            it('should return information about receipt', async () => {
                const data: Receipt = await instance.getReceipt(id);
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('status');
                expect(data).toHaveProperty('payment_id');
                expect(data).toHaveProperty('fiscal_document_number');
                expect(data).toHaveProperty('fiscal_storage_number');
                expect(data).toHaveProperty('fiscal_attribute');
                expect(data).toHaveProperty('registered_at');
                expect(data).toHaveProperty('fiscal_provider_id');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('tax_system_code');
                expect(data).toHaveProperty('settlements');
            });
        });
    });

    describe('Tests for get receipt list', () => {
        let mockHttp: MockAdapter;
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(mockHost).reply(200, getReceiptListResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get receipt list', () => {
            it('should return receipt list', async () => {
                const data: IReceiptList = await instance.getReceiptList({});
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('next_cursor');
                expect(data.items).toHaveLength(1);
                expect(data.items).toContainEqual(receiptFactory(getReceiptListResponse.items[0]));
            });
        });
    });
});
