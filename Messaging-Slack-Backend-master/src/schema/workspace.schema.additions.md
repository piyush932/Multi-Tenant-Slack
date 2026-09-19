# Fields to add to your existing schema/workspace.js

Add these three fields to the existing schema definition:

```js
plan: {
  type: String,
  enum: ['free', 'pro'],
  default: 'free',
},
status: {
  type: String,
  enum: ['active', 'suspended'],
  default: 'active',
},
deletedAt: {
  type: Date,
  default: null,
},
```

Then run, once:
```bash
node src/migrations/addWorkspaceLifecycleFields.js
```
This backfills `plan: 'free', status: 'active', deletedAt: null` onto every
workspace that existed before this migration.
