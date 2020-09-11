**Принцип работы**

У нас есть много данных (10 000 000 строк), нам нужно динамически отображать эти данные в виде таблицы, 
причём скролл должен работать таким образом, как будто все эти данные уже есть в html.

Считаем что все строки таблицы будут одинаковой высоты, поэтому рендерим одну строку, 
считаем её высоту и умножаем на общее количество строк в таблице, получаем общую высоту таблицы.

Затем оборачиваем таблицу в дополнительный div (далее **wrapper**) и устанавливаем ему необходмую высоту в px, которую посчитали ранее.

Затем оборачиваем всё в ещё один div (далее **scroller**) и устанавливаем ему какую-то фиксированную высоту (по умолчанию 400px)
и добавляем свойство `overflow-y: scroll;`, чтобы содержимое прокручивалось по вертикали.

Так как **wrapper** имеет высоту, равную высоту всех строк таблицы, скролл будет работать как обычно, 
за исключением того, что таблица при скролле остаётся на месте и содержит только часть строк.

Вешаем на **scroller** событие _scroll_ и когда пользователь прокучивает содержимое блока, 
нам нужно смещать таблицу и рендерить столбцы, которые попадают в область видимости.

Зная высоту одной строки таблицы, высоту блока **scroller** и смещение скролла
мы можем узнать индексы строк, которые в данный момент должны находится в области видимости, а так же смещение
которое необходимо утсановить таблице, чтобы она находилась в области видимости.

Таким образом нам нужно узнать какие столбцы в данный момент должны находится в области видимости, отрендерить их
и сместить таблицу на нужное количество пикселей, строки рендерим с запасом (2-3 высоты блока **scroller**) чтобы
не рендерить их на каждый скролл, и при скролле следим когда область видимости выйдет за отрендеренный диапзаон строк.

В теории всё должно работать, на практике максимальная высота div в браузере ограничена и имея много данных
мы не сможем задать блоку **wrapper** нужную высоту, я ограничил его максимальную высоту в 8 000 000 px,
практические тесты показали что эта высота работает во всех браузерах.

Чтобы наш алгоритм работал для урезанной высоты блока **wrapper** нам нужно добавить в расчёты отношение
реальной высоты к урезанной.