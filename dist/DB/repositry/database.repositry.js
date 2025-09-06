"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepositry = void 0;
class DatabaseRepositry {
    model;
    constructor(model) {
        this.model = model;
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter).select(select || " ");
        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    async updateOne({ filter, update, options }) {
        return await this.model.updateOne(filter, update, options);
    }
}
exports.DatabaseRepositry = DatabaseRepositry;
