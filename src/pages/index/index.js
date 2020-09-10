import LazyTable from '../../components/lazy-table';
import FakeDataProvider from '../../components/data-provider';
import settings from '../../settings';

document.addEventListener('DOMContentLoaded', () => {
    const { count, samples } = settings;
    const dataProvider = new FakeDataProvider(count, Object.keys(samples), samples);
    const template = document.getElementById('row-template').innerHTML;
    // eslint-disable-next-line no-unused-vars
    const lazyTable = new LazyTable(
        dataProvider,
        document.querySelector('[data-id="lazy-table"]'),
        template,
        '400px',
    );
});
