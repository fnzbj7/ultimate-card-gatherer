# Ultimate Card Gatherer

## Projekt áttekintés

Az "Ultimate Card Gatherer" egy saját hobbi projekt, amelynek fő célja a Magiccollection oldalán található lapok frissítésének gyorsítása volt. Az alkalmazás segítségével rövidebb idő alatt, nagyobb pontossággal tudom összegyűjteni a lapokat és azokat integrálni a honlapomhoz.

## Funkciók és technológiák

A projekt az alábbi technológiákat és eszközöket használja:

- Angular frontend és Nest.js backend keretrendszerek
- Web scraper a lapok letöltéséhez (Puppeteer)
- Képek tömörítése és átkonvertálása (imagemin)
- Képek tárolása és feltöltése (AWS S3)
- AWS CLI használata (Node.js wrapper)
- TypeORM migrációk

## Telepítés és futtatás

1. Klónozd le a projektet a saját gépedre.
2. Navigálj a projekt gyökérkönyvtárába.
3. Telepítsd a függőségeket a *frontend* és a *backend* mappába a következő parancs futtatásával: `npm install`.
4. Indítsd el az alkalmazást a backend mappába fejlesztői módban a következő parancs futtatásával: `npm run start:dev`.
4. Indítsd el az alkalmazást a frontend fejlesztői módban a következő parancs futtatásával: `npm run start`.


## Adatgyűjtési folyamat

A "Ultimate Card Gatherer" a következő adatgyűjtési folyamatot követi:

1. A lapok nevei és sorszámai egy JSON fájlban találhatóak.
2. A web scraper segítségével letöltöm a lapok képeit a hivatalos honlapról.
3. Az összegyűjtött képeket tömörítem és átkonvertálom webp formátumba.
4. Az elkészült képeket feltöltöm az AWS S3 tárolóba.
5. Létrehozom a migrációs fájlokat a TypeORM segítségével, amelyekkel könnyedén frissíthetem az adatbázist.

## Továbbfejlesztési lehetőségek

Az "Ultimate Card Gatherer" jelenleg egyéni igényeimre van szabva, de további fejlesztési lehetőségek is felmerülnek, például:

- Felhasználói felület fejlesztése a könnyebb adatgyűjtés és integráció érdekében.
- Bővített hibaellenőrzés és hibakezelés a megbízhatóbb működés érdekében.
- Skálázhatóság javítása a nagyobb adathalmazok kezelése során.

---

Remélem, ez az összefoglaló segít megérteni az "Ultimate Card Gatherer" projektet és annak céljait. Amennyiben kérdésed van, nyugodtan tedd fel!
