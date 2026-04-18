# Задача: Competitor Analysis для Ventus Catalog — 7 классов в MD

## Контекст

В репозитории RikaNV находится:
- `Ventus_Specs_EN_v1.xlsx` — каталог дневных оптических прицелов Ventus (35 SKU), переведённый на английский, с конвертацией MOA→MIL для диапазонов регулировок. Каждый SKU — это конфигурация для потенциального OEM-производства линейки GML.
- `ventus-elr-class-5-40x56-60-competitive-analysis.md` — **эталонный MD-файл** для ELR-класса. Твоя задача — сгенерировать ещё 7 MD-файлов в точно такой же структуре, для остальных 7 классов каталога.

## Что нужно сделать

Сгенерировать 7 competitor-analysis MD-файлов, по одному на каждый класс Ventus (см. таблицу ниже). Для каждого класса:

1. Прочитать Ventus-данные из `Ventus_Specs_EN_v1.xlsx` (листы указаны в таблице)
2. Найти 5–7 релевантных конкурентов через web search (список кандидатов для каждого класса дан ниже)
3. Собрать для каждого конкурента: mag, obj, tube, elevation total (MIL), windage total (MIL), click value, FOV @ 100m, weight, length, eye relief, street price
4. Сгенерировать MD по структуре эталона
5. Закоммитить в репо

## Структура каталога Ventus — 8 классов

| № | Класс | Sheet names в xlsx | Кол-во SKU | Статус |
|---|---|---|---|---|
| 1 | LPVO 1-8× | `FFP1-8`, `SFP1-8` | 4 | **Нужно сделать** |
| 2 | LPVO 1-10× | `FFP1-10`, `SFP1-10` | 4 | **Нужно сделать** |
| 3 | Mid 2-12/2-16×44 | `FFP2-16(2-12)`, `SFP2-16(2-12)` | 4 | **Нужно сделать** |
| 4 | Mid 2.5-20/3-18×50 | `FFP2.5-20(2.5-15)(3-18)`, `SFP2.5-20(2.5-15)(3-18)` | 6 | **Нужно сделать** |
| 5 | Long 3-24/4-24×50 | `FFP3-24(4-24)`, `SFP3-24(4-24)` | 4 | **Нужно сделать** |
| 6 | Long 3.125-25/5-25×50 | `FFP3.125-25(5-25)`, `SFP3.125-25(5-25)` | 4 | **Нужно сделать** |
| 7 | Long 4-32/5-25/5-30×56 (34mm) | `FFP4-32(5-25)(5-30)` | 3 | **Нужно сделать** |
| 8 | ELR 5-40/6-36/7-35×56/60 (34mm) | `FFP5-40X56(6-36)(7-35)`, `FFP5-40X60(6-36)(7-35)` | 6 | ✅ Готово (эталон) |

## Бренды-конкуренты под каждый класс

Набор брендов меняется по классам, потому что премиум-бренды (Nightforce/S&B/March/ZCO/Tangent Theta) не делают бюджетные LPVO или mid-range прицелы. Используй соответствующий набор:

### LPVO классы 1, 2 (1-8× и 1-10×)
Обязательно: Vector Optics Continental, Vortex, Primary Arms, Athlon
Желательно (если есть прямой аналог): Burris, Leupold, Trijicon
**Не добавляй** Nightforce ATACR, S&B PM II High Power, March-FX, ZCO, Tangent Theta — в LPVO они не играют.

### Mid классы 3, 4 (2-12/2-16×44 и 2.5-20/3-18×50)
Обязательно: Vector Optics Continental, Vortex (Viper PST Gen II), Athlon (Ares или Midas), Arken
Желательно: Leupold Mark 5HD, Bushnell Match Pro, Burris XTR

### Long классы 5, 6 (3-24/4-24×50 и 3.125-25/5-25×50)
Обязательно: Vector Optics Continental, Vortex (Razor HD Gen II), Nightforce (NX8 или ATACR 5-25), Arken SH-4 Gen II
Желательно: Athlon Cronus BTR, S&B PM II 5-25, Burris XTR III

### Long класс 7 (4-32/5-25/5-30×56, 34mm)
Обязательно все 7: Vector Optics Continental, Vortex (Razor HD Gen III 6-36 или Gen II 4.5-27), Nightforce ATACR 5-25, March-FX, Schmidt & Bender PM II 5-25 High Power, ZCO ZC527 или ZC420, Tangent Theta TT525P

## Структура каждого MD (строго по эталону)

Секции в том же порядке, что в `ventus-elr-class-5-40x56-60-competitive-analysis.md`:

1. **Title + metadata** (class name, SKU count, related GML models если есть)
2. **TL;DR** — 5–6 ключевых выводов буллетами, первый пункт = самая сильная характеристика Ventus в классе
3. **Ventus Lineup in This Class** — таблица SKU + блок shared specs
4. **Competitor Reference Models** — таблица бренд / модель / труба + примечание если труба отличается
5. **Master Comparison Table** — главная сравнительная таблица, отсортированная по самой сильной метрике Ventus
6. **Analysis by Parameter** — разбор по параметрам, ASCII-bar-charts для визуализации 2–3 ключевых метрик
7. **Competitive Position Summary** — где выигрывает / риски / реалистичный peer по цене
8. **Strategic Notes for GML Positioning** — (пропусти эту секцию для классов, где нет соответствующей GML-модели; оставь только для классов 1 [GML 1-8×28 SFP] и 7 [GML 5-30×56 FFP])
9. **Information Confidence & Sources** — список источников с URL

## Именование файлов

Pattern: `ventus-{class-slug}-competitive-analysis.md` в корне папки анализа. Примеры:
- `ventus-lpvo-1-8x-competitive-analysis.md`
- `ventus-lpvo-1-10x-competitive-analysis.md`
- `ventus-mid-2-16x44-competitive-analysis.md`
- `ventus-mid-2.5-20x50-competitive-analysis.md`
- `ventus-long-3-24x50-competitive-analysis.md`
- `ventus-long-3.125-25x50-competitive-analysis.md`
- `ventus-long-4-32-5-30x56-competitive-analysis.md`

## Правила работы

**Web search per competitor:**
- Минимум 1 поиск на бренд/модель для подтверждения актуальных спек 2025–2026 года
- Источник = manufacturer datasheet / EuroOptic / MileHighShooting / Optics Trade (эти трое — надёжные ретейлеры с детальными спеками). Избегай Reddit/форумов как первоисточника цифр.
- Если для какого-то параметра не нашёл цифру — пиши `N/A (not publicly available)`, не угадывай

**MOA → MIL conversion:**
- 1 MIL = 3.438 MOA
- Если у конкурента спеки в MOA — конвертируй в MIL с 1 знаком после запятой, в таблице показывай MIL (как в эталоне)
- Click value оставляй как у производителя (не конвертируй — это физическая характеристика)

**Tube diameter filter:**
- Основное сравнение делай при одинаковом диаметре трубы с Ventus
- Если у конкурента в этом классе труба другая (пример: ZCO 36mm vs Ventus 34mm) — включай в таблицу, но в заголовке столбца явно помечай `36mm` жирным и добавляй примечание в секции 4

**Sytong-discipline:**
- Не преувеличивай характеристики Ventus и не додумывай цифры, которых нет в xlsx
- Если Ventus FOV-числа кажутся подозрительно большими относительно класса — пометь в разделе Analysis: "Ventus published FOV exceeds [competitor X], should be independently verified"
- Не копируй чужие маркетинговые утверждения ("лучший в классе") — только фактические spec

**GML cross-reference:**
- В memory есть 3 текущие GML-модели: GML 1-8×28 SFP, GML 5-30×56 FFP, GML 5-40×60 FFP
- Если класс содержит SKU, являющийся основой GML — упомяни это в metadata и сделай секцию 8 (Strategic Notes)

## Checkpoint Protocol

После генерации **первого класса** (класс 1, LPVO 1-8×):
1. Закоммить файл с сообщением `feat(analysis): add LPVO 1-8x competitor analysis [checkpoint]`
2. **ОСТАНОВИСЬ** и выведи сообщение:
   ```
   ✅ Класс 1 (LPVO 1-8×) готов и закоммичен.
   Файл: analysis/competitor-analysis/daytime-optics-ventus/ventus-lpvo-1-8x-competitive-analysis.md
   Commit: <hash>
   
   Прежде чем продолжать с классами 2–7, проверь результат.
   Напиши "продолжай" для прогона оставшихся 6 классов,
   или дай правки — я их учту для остальных классов.
   ```
3. Жди подтверждения, не продолжай автоматически

После checkpoint-подтверждения — прогоняй классы 2–7 последовательно, каждый отдельным коммитом.

## Финальный шаг

После всех 8 классов создай файл `README.md` в папке анализа со следующим содержанием:
1. Описание задачи (1 абзац)
2. Таблица: все 8 классов → ссылка на MD-файл → кол-во SKU
3. Краткий summary findings: в каких классах Ventus сильнее всего, в каких слабее всего
4. Methodology: откуда брали Ventus-данные, откуда конкурентов, даты сбора

Закоммить с сообщением: `feat(analysis): complete Ventus competitor analysis for all 8 classes`

## Critical Stop-and-Ask Triggers

Остановись и спроси пользователя, **не продолжая сам**, если:
- Для какого-то класса из обязательного списка брендов не нашлось актуальной модели (например Athlon прекратили линейку) — предложи замену и спроси
- Ventus-лист в xlsx имеет данные, которые не укладываются в структуру (нестандартные столбцы, missing параметры)
- Файл `Ventus_Specs_EN_v1.xlsx` или эталонный MD отсутствует в репо — попроси положить
- Web search по какому-то бренду возвращает только 2024 или более старые данные — флагни, продолжи с заметкой "specs as of 2024, check for updates"

## Do NOT

- Не создавай новые файлы вне папки анализа без разрешения
- Не модифицируй `Ventus_Specs_EN_v1.xlsx` или эталонный MD
- Не коммить без запуска `git diff` перед коммитом для ручной проверки структуры
- Не добавляй бренды сверх списка без согласования (например не подмешивай Kahles к LPVO, если он там не нужен)
- Не генерируй более 8 классов — если появляется идея "сделать ещё отдельный класс для Х" — спроси

## Success Criteria

- 7 новых MD-файлов в `analysis/competitor-analysis/daytime-optics-ventus/`, по структуре идентичных эталону ELR
- `README.md` с индексом всех 8 классов
- Каждый MD содержит минимум 5 конкурентов (кроме LPVO где 4 допустимо)
- Все цифры конкурентов имеют URL-источник в секции Sources
- Нет галлюцинаций (отсутствующие данные помечены `N/A`, не выдуманы)
- После checkpoint класса 1 — остановка и ожидание
- Финальный commit: полный анализ, все 8 классов, с README

## Commit Message Format

Для каждого класса: `feat(analysis): add {class-name} competitor analysis`
Для README: `feat(analysis): complete Ventus competitor analysis for all 8 classes`
Для исправлений на checkpoint: `fix(analysis): apply feedback from LPVO 1-8x review`
