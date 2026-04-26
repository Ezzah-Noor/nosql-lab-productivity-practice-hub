

# Schema Design — Personal Productivity Hub

---

## 1. Collections Overview

- **users** — Stores registered users with login credentials. Each user owns projects and notes.
- **projects** — Stores projects belonging to a user. Can be active or archived.
- **tasks** — Stores tasks belonging to a project, with embedded subtasks and tags.
- **notes** — Stores notes that belong to a user and optionally link to a project.

---

## 2. Document Shapes

### users
```
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}
```

### projects
```
{
  _id: ObjectId,
  userId: ObjectId (required, ref → users),
  name: string (required),
  description: string (optional),
  archived: boolean (required, default false),
  createdAt: Date (required)
}
```

### tasks
```
{
  _id: ObjectId,
  projectId: ObjectId (required, ref → projects),
  title: string (required),
  status: string (required, "todo"|"in-progress"|"done"),
  priority: number (required),
  tags: [string] (required, default []),
  subtasks: [{ title: string, done: boolean }] (required, default []),
  dueDate: Date (optional)
}
```

### notes
```
{
  _id: ObjectId,
  userId: ObjectId (required, ref → users),
  projectId: ObjectId (optional, ref → projects),
  title: string (required),
  body: string (required),
  tags: [string] (required, default []),
  createdAt: Date (required)
}
```

---

## 3. Embed vs Reference — Decisions

| Relationship                  | Embed or Reference? | Why? |
|-------------------------------|---------------------|------|
| Subtasks inside a task        | Embed               | Subtasks are always read with their parent task and have no independent existence. |
| Tags on a task                | Embed               | Tags are simple strings owned by the task and always fetched together with it. |
| Project → Task ownership      | Reference           | Tasks are queried independently by project and a project can have many tasks. |
| Note → optional Project link  | Reference           | A note may or may not belong to a project; storing an ObjectId pointer is sufficient. |

---

## 4. Schema Flexibility Example

The `projectId` field exists on notes that are attached to a project, but is completely absent on standalone notes. This is acceptable in MongoDB because documents in the same collection do not need identical fields — there is no NULL column required. A note without a project simply omits the field, keeping the document clean.
```
