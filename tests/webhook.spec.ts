import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { v7 as uuid } from 'uuid';
import axios from 'axios';

import { YooCheckout } from '../lib/core/yoo-checkout.core';
import { WebHook, webhookFactory } from '../lib/models';
import {
    createWebHookData,
    createWebHookResponse,
    getWebhookListResponse
} from './test.data';
import { IWebHookList } from '../lib/types';
import { apiUrl } from '../lib/core';

const instance = new YooCheckout({ shopId: 'your_shop_id', secretKey: 'your_secret_key', token: 'token' });
const mockHost = `${apiUrl}/webhooks`;

describe('Test Webhook functionality', () => {
    describe('Tests for creating webhook', () => {
        let mockHttp: MockAdapter;

        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onPost(mockHost, createWebHookData).reply(200, createWebHookResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });


        describe('Creating webhook', () => {
            it('should success create new webhook', async () => {
                const data: WebHook = await instance.createWebHook(createWebHookData, uuid());
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('event');
                expect(data).toHaveProperty('url');
                expect(data.event).toBe(createWebHookData.event);
            });
        });
    });

    describe('Tests for get webhook list', () => {
        let mockHttp: MockAdapter;
        beforeAll(() => {
            mockHttp = new MockAdapter(axios);
            mockHttp.onGet(mockHost).reply(200, getWebhookListResponse);
        });

        afterAll(() => {
            mockHttp.restore();
        });

        describe('Get webhook list', () => {
            it('should return webhook list', async () => {
                const data: IWebHookList = await instance.getWebHookList();
                expect(data).toBeTypeOf('object');
                expect(data).toHaveProperty('type');
                expect(data).toHaveProperty('items');
                expect(data).toHaveProperty('next_cursor');
                expect(data.items).toHaveLength(1);
                expect(data.items).toContainEqual(webhookFactory(getWebhookListResponse.items[0]));
            });
        });
    });
});
