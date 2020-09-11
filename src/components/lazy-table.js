/**
 * LazyTable генерирует таблицу на лету и позволяет осуществлять навигацию по строкам
 * с помощью вертиальной полосы прокрутки.
 */
export default class LazyTable {
    cache = {
        startIndex: 0,
        endIndex: 0,
    };

    /**
     * @param dataProvider - храналище данных, должны быть реализованы методы total, getOne, getMany
     * @param element - DOM Element куда будеv рендерить данные (tbody или table)
     * @param rowTemplate - шаблон для строки таблицы
     * @param height - высота блока c полосой прокрутки, в который обернём таблицу
     */
    constructor(dataProvider, element, rowTemplate, height = '400px') {
        this.dataProvider = dataProvider;
        this.element = element;
        this.rowTemplate = rowTemplate;
        this.height = height;
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
            scroller.style.height = this.height;
        }
        return scroller;
    }

    /**
     * Если не задан border-collapse нужно учитвать расстояние между ячейками
     */
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

    /**
     * Отношение реальной высоты строк таблицы к урезанной
     */
    get ratio() {
        return this.fullHeight / this.wrapper.offsetHeight;
    }

    /**
     * Высота всех строк таблицы
     */
    get fullHeight() {
        return this.dataProvider.total * this.rowHeight;
    }

    /**
     * Высота одной строки таблицы
     */
    get rowHeight() {
        if (this.cache.rowHeight === undefined || this.cache.rowHeight === 0) {
            const row = this.element.querySelector('tr');
            this.cache.rowHeight = row ? row.offsetHeight + this.spaceSize : 0;
        }
        return this.cache.rowHeight;
    }

    /**
     * Смещение скролла с учётом отношения реальной высоты строк таблицы к урезанной
     */
    get scrollTop() {
        return this.scroller.scrollTop * this.ratio;
    }

    /**
     * Максимальный начальный индекс не должен быть больше общего количества строк
     * и количества, которое вмещается во viewport блока scroller
     */
    get maxStartIndex() {
        if (!this.cache.maxStartIndex) {
            this.cache.maxStartIndex = Math.round(this.dataProvider.total - this.scrollerRowsSize);
        }
        return this.cache.maxStartIndex;
    }

    /**
     * Максимальное количество строк таблицы, которое вмещается во viewport блока scroller
     */
    get scrollerRowsSize() {
        return Math.round(this.scroller.offsetHeight / this.rowHeight);
    }

    /**
     * Начальный индекс строки таблицы, которая в данный момент отображается
     * во viewport`е блока scroller
     */
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

    /**
     * Конечный индекс строки таблицы, которая в данный момент отображается
     * во viewport`е блока scroller
     */
    get scrollerEndIndex() {
        const index = this.scrollerStartIndex + this.scrollerRowsSize;
        return index > this.dataProvider.total ? this.dataProvider.total : index;
    }

    /**
     * Начальный индекс отрендеренных строк
     */
    get startIndex() {
        const index = this.scrollerStartIndex - this.scrollerRowsSize;
        return index < 0 ? 0 : index;
    }

    /**
     * Конечный индекс отрендеренных строк
     */
    get endIndex() {
        const index = this.scrollerEndIndex + this.scrollerRowsSize;
        return index > this.dataProvider.total ? this.dataProvider.total : index;
    }

    /**
     * Инициализация строк, установка высоты блоку wrapper и привязка событий
     */
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

    /**
     * Инициализация событий, привязываем событие scroll к блоку scroller.
     * При каждой прокрутке смотрим, хватает ли в таблице данных для отображения.
     * Если данных не хватает, то рендерим нужные строки и смещаем таблицу в область видимости.
     */
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

    /**
     * Устанавливаем высоту блока wrapper чтобы скролл работал.
     * Почему-то разные браузеры по разному обрезают высоту блока, поэтому если высота
     * блока больше 8 000 000 px, обрезаем её до этого значения.
     */
    setWrapperHeight() {
        let { fullHeight } = this;
        const maxHeight = 8000000;
        if (fullHeight > maxHeight) {
            fullHeight = maxHeight;
        }
        this.wrapper.style.height = `${fullHeight}px`;
    }

    /**
     * Смещаем таблицу в область видимости прокрутки с учётом отношения полной высоты wrapper
     * к урезанной.
     */
    setTablePosition() {
        const delta = (this.startIndex * this.rowHeight) / this.ratio;
        this.table.style.transform = `translateY(${delta}px)`;
    }

    /**
     * Рендерим строки таблицы в количестве limit начиная с offset
     */
    renderRows(limit, offset) {
        const rows = [];
        this.dataProvider.getList(limit, offset).forEach((row, index) => {
            rows.push(this.parseTemplate(row, offset + index));
        });
        this.element.innerHTML = rows.join('');
    }

    parseTemplate(row, index) {
        const { rowTemplate: template } = this;
        const names = Object.keys(row);
        const values = Object.values(row);
        names.push('num');
        values.push(index + 1);
        // eslint-disable-next-line no-new-func
        return new Function(...names, `return \`${template}\`;`)(...values);
    }
}
