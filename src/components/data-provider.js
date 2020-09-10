function FakeDataProviderException(message) {
    this.message = message;
}

export default class FakeDataProvider {
    items = [];

    fields = [];

    samples = {};

    constructor(total, fields, samples) {
        fields.forEach((field) => {
            if (!samples[field]) {
                throw new FakeDataProviderException(`Field ${field} isn\`t presented in samples`);
            }
        });

        this.items[total - 1] = undefined;
        this.fields = fields;
        this.samples = samples;
    }

    get total() {
        return this.items.length;
    }

    getOne(index) {
        if (!this.items[index]) {
            this.items[index] = this.generateFakeData();
        }
        return this.items[index];
    }

    getList(limit = 10, offset = 0) {
        const items = [];
        let total = limit + offset;
        if (total > this.total) {
            total = this.total;
        }
        for (let i = offset; i < total; i += 1) {
            if (!this.items[i]) {
                this.items[i] = this.generateFakeData();
            }
            items.push(this.items[i]);
        }
        return items;
    }

    generateFakeData() {
        const row = {};
        for (let j = 0, len = this.fields.length; j < len; j += 1) {
            const field = this.fields[j];
            const k = Math.floor(Math.random() * this.samples[field].length);
            row[field] = this.samples[field][k];
        }
        return row;
    }
}
