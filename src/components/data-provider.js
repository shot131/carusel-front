function FakeDataProviderException(message) {
    this.message = message;
}

/**
 * FakeDataProvider выступает в роли хранилища данных.
 * Получае на вход число и параметры данных, при попытке доступа к данным рендерит их на лету.
 */
export default class FakeDataProvider {
    items = [];

    fields = [];

    samples = {};

    /**
     * @param {int} total задаёт общее количество строк.
     * @param {Array} fields названия полей.
     * @param {Object} samples шаблоны для генерации данных.
     */
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

    /**
     * Возвращает строку по её индексу.
     * @param {int} index индекс нужно строки.
     */
    getOne(index) {
        if (!this.items[index]) {
            this.items[index] = this.generateFakeData();
        }
        return this.items[index];
    }

    /**
     * Возвращает срез начиная с offset и количеством limit.
     * @param {int} limit общее число строк в срезе.
     * @param {int} offset смещение от начала.
     */
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

    /**
     * Генерирует случайные данные на основе шаблона.
     */
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
