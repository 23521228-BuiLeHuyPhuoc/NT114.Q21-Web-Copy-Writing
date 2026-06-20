const assert = require('assert');

const AccountUser = require('../src/models/AccountUser');
const Plan = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');
const billingService = require('../src/services/billingService');
const {
  checkoutSchema,
  listPaymentsSchema,
  paramsWithPaymentLookupId,
} = require('../src/validations/billingValidation');

const USER_ID = '507f1f77bcf86cd799439011';

function objectId(value) {
  return { toString: () => value };
}

function makePlan(slug, overrides = {}) {
  const rank = ['free', 'pro', 'business'].indexOf(slug);
  return {
    _id: objectId(`507f1f77bcf86cd7994390${rank < 0 ? 9 : rank + 1}1`),
    name: slug[0].toUpperCase() + slug.slice(1),
    slug,
    description: '',
    priceMonthly: slug === 'free' ? 0 : slug === 'pro' ? 199000 : 499000,
    priceYearly: slug === 'free' ? 0 : slug === 'pro' ? 1990000 : 4990000,
    currency: 'VND',
    limits: {},
    features: [],
    excludedFeatures: [],
    allowedModels: [],
    isPopular: false,
    isActive: true,
    isDeleted: false,
    sortOrder: rank < 0 ? 99 : rank,
    createdAt: new Date('2026-06-20T00:00:00.000Z'),
    updatedAt: new Date('2026-06-20T00:00:00.000Z'),
    ...overrides,
  };
}

function subscriptionFor(plan) {
  return {
    _id: objectId('607f1f77bcf86cd799439011'),
    userId: USER_ID,
    planId: plan,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: new Date('2026-06-01T00:00:00.000Z'),
    currentPeriodEnd: new Date('2099-06-01T00:00:00.000Z'),
    provider: 'manual',
  };
}

function mockQuery(value) {
  return {
    sort() { return this; },
    populate() { return Promise.resolve(value); },
  };
}

async function expectCheckoutFailure({ currentPlan, requestedPlan, expectedCode }) {
  AccountUser.findById = async () => ({ _id: USER_ID, email: 'user@example.test' });
  Plan.findOne = async () => requestedPlan;
  Subscription.findOne = () => mockQuery(currentPlan ? subscriptionFor(currentPlan) : null);

  let error;
  try {
    await billingService.createCheckout(USER_ID, {
      planSlug: requestedPlan.slug,
      billingCycle: 'monthly',
      method: 'vietqr',
    });
  } catch (caught) {
    error = caught;
  }

  assert.ok(error, `expected checkout for ${requestedPlan.slug} to fail`);
  assert.strictEqual(error.statusCode, 409, 'checkout must fail with conflict status');
  assert.strictEqual(error.data?.code, expectedCode, `expected error code ${expectedCode}`);
}

async function run() {
  await expectCheckoutFailure({
    currentPlan: makePlan('business'),
    requestedPlan: makePlan('pro'),
    expectedCode: 'PLAN_DOWNGRADE_NOT_ALLOWED',
  });
  process.stdout.write('ok downgrade checkout blocked\n');

  await expectCheckoutFailure({
    currentPlan: makePlan('pro'),
    requestedPlan: makePlan('pro'),
    expectedCode: 'PLAN_ALREADY_ACTIVE',
  });
  process.stdout.write('ok same-plan checkout blocked\n');

  await expectCheckoutFailure({
    currentPlan: null,
    requestedPlan: makePlan('pro', { isActive: false }),
    expectedCode: 'PLAN_NOT_AVAILABLE',
  });
  process.stdout.write('ok inactive plan checkout blocked\n');

  assert.ok(!checkoutSchema.validate({ planSlug: 'pro', billingCycle: 'monthly', method: 'vietqr' }).error);
  assert.ok(checkoutSchema.validate({ planSlug: 'pro', planId: '507f1f77bcf86cd799439011' }).error, 'checkout must reject both planSlug and planId');
  assert.ok(!listPaymentsSchema.validate({ status: 'pending' }).error);
  assert.ok(listPaymentsSchema.validate({ status: 'deleted' }).error, 'payments status filter must be constrained');
  assert.ok(!paramsWithPaymentLookupId.validate({ id: 'INV-20260620-123456' }).error);
  assert.ok(!paramsWithPaymentLookupId.validate({ id: '507f1f77bcf86cd799439011' }).error);
  assert.ok(paramsWithPaymentLookupId.validate({ id: '../../bad' }).error, 'payment confirm id must be constrained');
  process.stdout.write('ok billing validation schemas constrained\n');
}

run()
  .then(() => {
    process.stdout.write('billing validation regression suite passed\n');
  })
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
