export function forTenant(ctx) {
  if (!ctx || !ctx.workspaceId) {
    throw new Error('forTenant() called without a resolved workspace context');
  }
  const workspaceId = ctx.workspaceId;

  return {
    async findById(Model, id) {
      return Model.findOne({ _id: id, workspaceId });
    },
    async find(Model, filter = {}) {
      return Model.find({ ...filter, workspaceId });
    },
    async findOne(Model, filter = {}) {
      return Model.findOne({ ...filter, workspaceId });
    },
    async create(Model, doc) {
      return Model.create({ ...doc, workspaceId });
    },
    async updateById(Model, id, update) {
      return Model.findOneAndUpdate({ _id: id, workspaceId }, update, {
        new: true,
      });
    },
    async deleteById(Model, id) {
      return Model.findOneAndDelete({ _id: id, workspaceId });
    },
    workspaceId,
  };
}
