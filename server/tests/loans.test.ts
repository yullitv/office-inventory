import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, dateFromToday } from './helpers.js';

describe('loans', () => {
  let app: ReturnType<typeof createTestApp>['app'];
  let employeeId: number;
  let itemId: number;

  beforeEach(async () => {
    ({ app, employeeId } = createTestApp());
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Projector', category: 'Projectors' });
    itemId = response.body.id;
  });

  const issue = (dueInDays = 3) =>
    request(app)
      .post('/api/loans')
      .send({ itemId, employeeId, dueDate: dateFromToday(dueInDays) });

  it('does not allow issuing an item that is already on loan', async () => {
    await issue().expect(201);

    const response = await issue().expect(409);

    expect(response.body.error.code).toBe('ITEM_ALREADY_ON_LOAN');
  });

  it('rejects a due date in the past', async () => {
    const response = await issue(-1).expect(400);

    expect(response.body.error.code).toBe('DUE_DATE_IN_PAST');
  });

  it('rejects a due date more than a year ahead', async () => {
    const loan = await issue(365).expect(201);
    await request(app).post(`/api/loans/${loan.body.id}/return`).send({}).expect(200);

    const response = await issue(366).expect(400);

    expect(response.body.error.code).toBe('DUE_DATE_TOO_FAR');
  });

  it('moves the item to repair when it is returned broken', async () => {
    const loan = await issue().expect(201);

    await request(app)
      .post(`/api/loans/${loan.body.id}/return`)
      .send({ itemStatus: 'in_repair' })
      .expect(200);

    const item = await request(app).get(`/api/items/${itemId}`).expect(200);
    expect(item.body.status).toBe('in_repair');
    expect(item.body.currentLoan).toBeNull();

    const reissue = await issue().expect(409);
    expect(reissue.body.error.code).toBe('ITEM_NOT_AVAILABLE');
  });

  it('does not allow deleting an item that is on loan', async () => {
    await issue().expect(201);

    const response = await request(app).delete(`/api/items/${itemId}`).expect(409);

    expect(response.body.error.code).toBe('ITEM_ON_LOAN');
  });

  it('keeps the issue note when the item is returned with its own note', async () => {
    const loan = await request(app)
      .post('/api/loans')
      .send({ itemId, employeeId, dueDate: dateFromToday(3), note: 'For the conference' })
      .expect(201);

    const returned = await request(app)
      .post(`/api/loans/${loan.body.id}/return`)
      .send({ note: 'Scratched lid' })
      .expect(200);

    expect(returned.body.note).toBe('For the conference');
    expect(returned.body.returnNote).toBe('Scratched lid');
  });
});
