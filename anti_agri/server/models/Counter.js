const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    seq: { type: Number, default: 0 },
});

counterSchema.index({ name: 1, company: 1 }, { unique: true });

counterSchema.statics.getNextSequence = async function (name, companyId) {
    if (!companyId) {
        throw new Error('companyId is required for sequence generation');
    }
    const counter = await this.findOneAndUpdate(
        { name, company: companyId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);
