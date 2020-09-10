export default class LazyTable {
    cache = {
        startIndex: 0,
        endIndex: 0,
    };

    constructor(dataProvider, element, rowTemplate) {
        this.dataProvider = dataProvider;
        this.element = element;
        this.rowTemplate = rowTemplate;
        this.init();
    }

    get table() {
        return this.element.closest('table');
    }

    get wrapper() {
        let wrapper = this.element.closest('[data-lazy-table-wrapper]');
        if (!wrapper) {
            wrapper = document.createElement('div');
            this.table.parentNode.insertBefore(wrapper, this.table);
            wrapper.appendChild(this.table);
            wrapper.dataset.lazyTableWrapper = 'true';
        }
        return wrapper;
    }

    get scroller() {
        let scroller = this.element.closest('[data-lazy-table-scroller]');
        if (!scroller) {
            scroller = document.createElement('div');
            this.wrapper.parentNode.insertBefore(scroller, this.wrapper);
            scroller.appendChild(this.wrapper);
            scroller.dataset.lazyTableScroller = 'true';
            scroller.style.overflowY = 'scroll';
            scroller.style.height = '450px';
        }
        return scroller;
    }

    get spaceSize() {
        if (this.cache.spaceSize === undefined) {
            const style = window.getComputedStyle(this.table);
            const collapse = style.getPropertyValue('border-collapse');
            const spacing = style.getPropertyValue('border-spacing').split(' ')[1];
            const space = parseFloat(spacing.replace(/[^\d.]/g, ''));
            this.cache.spaceSize = 0;
            if (collapse === 'separate') {
                this.cache.spaceSize = space;
            }
        }
        return this.cache.spaceSize;
    }

    get ratio() {
        return this.fullHeight / this.wrapper.offsetHeight;
    }

    get fullHeight() {
        return this.dataProvider.total * this.rowHeight;
    }

    get rowHeight() {
        if (this.cache.rowHeight === undefined || this.cache.rowHeight === 0) {
            const row = this.element.querySelector('tr');
            this.cache.rowHeight = row ? row.offsetHeight + this.spaceSize : 0;
        }
        return this.cache.rowHeight;
    }

    get scrollTop() {
        return this.scroller.scrollTop * this.ratio;
    }

    get maxStartIndex() {
        if (!this.cache.maxStartIndex) {
            this.cache.maxStartIndex = Math.round(this.dataProvider.total - this.scrollerRowsSize);
        }
        return this.cache.maxStartIndex;
    }

    get scrollerRowsSize() {
        return Math.round(this.scroller.offsetHeight / this.rowHeight);
    }

    get scrollerStartIndex() {
        let index = this.rowHeight ? Math.floor(this.scrollTop / this.rowHeight) : 0;
        if (index < 0) {
            index = 0;
        }
        if (index > this.maxStartIndex) {
            index = this.maxStartIndex;
        }
        return index;
    }

    get scrollerEndIndex() {
        const index = this.scrollerStartIndex + this.scrollerRowsSize;
        return index > this.dataProvider.total ? this.dataProvider.total : index;
    }

    get startIndex() {
        const index = this.scrollerStartIndex - this.scrollerRowsSize;
        return index < 0 ? 0 : index;
    }

    get endIndex() {
        const index = this.scrollerEndIndex + this.scrollerRowsSize;
        return index > this.dataProvider.total ? this.dataProvider.total : index;
    }

    init() {
        if (this.element.dataset.inited) {
            return;
        }

        const rows = [];
        while (this.scroller.offsetHeight >= this.rowHeight * rows.length) {
            rows.push(this.parseTemplate(this.dataProvider.getOne(rows.length), rows.length));
            this.element.innerHTML = rows.join('');
        }

        this.setWrapperHeight();
        this.initEvents();

        this.element.dataset.inited = 'true';
    }

    initEvents() {
        if (this.element.dataset.inited) {
            return;
        }

        const onScroll = () => {
            const { scrollerStartIndex, scrollerEndIndex } = this;
            const { startIndex: cachedStartIndex, endIndex: cachedEndIndex } = this.cache;
            if (cachedStartIndex > scrollerStartIndex || cachedEndIndex < scrollerEndIndex) {
                const { startIndex, endIndex } = this;
                this.cache.startIndex = startIndex;
                this.cache.endIndex = endIndex;
                this.renderRows(endIndex - startIndex, startIndex);
                this.setTablePosition();
            }
        };

        this.scroller.addEventListener('scroll', onScroll);
    }

    setWrapperHeight() {
        let { fullHeight } = this;
        const maxHeight = 8000000;
        if (fullHeight > maxHeight) {
            fullHeight = maxHeight;
        }
        this.wrapper.style.height = `${fullHeight}px`;
    }

    setTablePosition() {
        const delta = (this.startIndex * this.rowHeight) / this.ratio;
        this.table.style.transform = `translateY(${delta}px)`;
    }

    renderRows(limit, offset) {
        const rows = [];
        this.dataProvider.getList(limit, offset).forEach((row, index) => {
            rows.push(this.parseTemplate(row, offset + index));
        });
        this.element.innerHTML = rows.join('');
    }

    parseTemplate(row, index) {
        let { rowTemplate: template } = this;
        Object.keys(row).forEach((field) => {
            template = template.replace(`{{${field}}}`, row[field]);
        });
        template = template.replace('{{num}}', index + 1);
        template = template.replace(/{{[^{}]+?}}/ig, '');
        return template;
    }
}
