require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  // Users
  const hash1 = await bcrypt.hash('password123', 10);
  const hash2 = await bcrypt.hash('password456', 10);

  const u1 = await db.collection('users').insertOne({
    name: 'Alice Khan',
    email: 'alice@example.com',
    passwordHash: hash1,
    createdAt: new Date()
  });

  const u2 = await db.collection('users').insertOne({
    name: 'Bob Ahmed',
    email: 'bob@example.com',
    passwordHash: hash2,
    createdAt: new Date()
  });

  const aliceId = u1.insertedId;
  const bobId = u2.insertedId;

  // Projects
  const p1 = await db.collection('projects').insertOne({
    ownerId: aliceId,
    name: 'Website Redesign',
    description: 'Revamp the company website',
    archived: false,
    createdAt: new Date()
  });

  const p2 = await db.collection('projects').insertOne({
    ownerId: aliceId,
    name: 'Mobile App',
    description: 'React Native mobile application',
    archived: false,
    createdAt: new Date()
  });

  const p3 = await db.collection('projects').insertOne({
    ownerId: aliceId,
    name: 'Old Campaign',
    description: 'Q1 marketing campaign',
    archived: true,
    createdAt: new Date()
  });

  const p4 = await db.collection('projects').insertOne({
    ownerId: bobId,
    name: 'API Integration',
    description: 'Connect payment gateway',
    archived: false,
    createdAt: new Date()
  });

  const p1id = p1.insertedId;
  const p2id = p2.insertedId;
  const p4id = p4.insertedId;

  // Tasks (dueDate on some but not all — schema flexibility)
  await db.collection('tasks').insertMany([
    {
      ownerId: aliceId,
      projectId: p1id,
      title: 'Design mockups',
      status: 'done',
      priority: 1,
      tags: ['design', 'ui'],
      subtasks: [
        { title: 'Homepage', done: true },
        { title: 'About page', done: false }
      ],
      dueDate: new Date('2026-05-01'),
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      projectId: p1id,
      title: 'Set up CI/CD',
      status: 'in-progress',
      priority: 2,
      tags: ['devops'],
      subtasks: [],
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      projectId: p2id,
      title: 'Auth screens',
      status: 'todo',
      priority: 1,
      tags: ['mobile', 'auth'],
      subtasks: [
        { title: 'Login form', done: false },
        { title: 'Signup form', done: false }
      ],
      dueDate: new Date('2026-05-15'),
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      projectId: p2id,
      title: 'Push notifications',
      status: 'todo',
      priority: 3,
      tags: ['mobile'],
      subtasks: [],
      createdAt: new Date()
    },
    {
      ownerId: bobId,
      projectId: p4id,
      title: 'Stripe webhook',
      status: 'in-progress',
      priority: 1,
      tags: ['backend', 'payments'],
      subtasks: [
        { title: 'Handle payment_intent', done: false }
      ],
      createdAt: new Date()
    }
  ]);

  // Notes (some with projectId, some standalone)
  await db.collection('notes').insertMany([
    {
      ownerId: aliceId,
      projectId: p1id,
      title: 'Design notes',
      body: 'Use blue palette for the redesign',
      tags: ['design'],
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      projectId: p2id,
      title: 'Mobile ideas',
      body: 'Consider adding offline mode support',
      tags: ['mobile', 'ux'],
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      title: 'Meeting notes',
      body: 'Standup every Monday at 10am',
      tags: ['meetings'],
      createdAt: new Date()
    },
    {
      ownerId: aliceId,
      title: 'Reading list',
      body: 'MongoDB docs chapter 4 on aggregation',
      tags: ['learning'],
      createdAt: new Date()
    },
    {
      ownerId: bobId,
      projectId: p4id,
      title: 'API keys',
      body: 'Always store secrets in env vars only',
      tags: ['backend', 'security'],
      createdAt: new Date()
    }
  ]);

  console.log('Seeded successfully!');
  process.exit(0);
})();