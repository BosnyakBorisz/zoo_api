const express = require('express');
const { title } = require('node:process');
const { before } = require('node:test');
const app = express();

app.use(express.json());

let globalMonkeyId = 4;
let globalBananaId = 4;

const monkeys = [
    { id: 1, name: 'Csimpi', species: 'Csimpánz' },
    { id: 2, name: 'King Kong', species: 'Gorilla' },
    { id: 3, name: 'Lajcsi', species: 'Orángután' }
];

const bananas = [
    { id: 1, name: 'Chiquita', colors: 'sárga', sweet: true, monkeyId: 1 },
    { id: 2, name: 'Bio Banán', colors: 'zöldes-sárga', sweet: false, monkeyId: 1 },
    { id: 3, name: 'Érett Banán', colors: 'barna pöttyös', sweet: true, monkeyId: 2 }
];


//MW

const getMonkeyIndex = (req, res, next) => { //majom index lekérése
    const monkeyIdAsNumber = parseInt(req.params.id, 10);
    let foundId = -1;
    for (let i = 0; i < monkeys.length; i++) {
        if (monkeys[i].id === monkeyIdAsNumber) {
            foundId = i;
            break;
        }
    }
    if (foundId === -1) {
        return res.status(404).json({ error: `Majom nem található ezzel az azonosítóval: ${req.params.id}` });
    }
    res.locals.monkeyIndex = foundId;
    res.locals.monkeyId = monkeyIdAsNumber;
    next();
};

const getBananaIndex = (req, res, next) => { //banán index lekérése
    const bananaIdAsNumber = parseInt(req.params.id, 10);
    let foundId = -1;
    for (let i = 0; i < bananas.length; i++) {
        if (bananas[i].id === bananaIdAsNumber) {
            foundId = i;
            break;
        }
    }
    if (foundId === -1) {
        return res.status(404).json({ error: `Banán nem található ezzel az azonosítóval: ${req.params.id}` });
    }
    res.locals.bananaIndex = foundId;
    next();
};

const checkMonkeyId = (req, res, next) => { 
    if (typeof req.body.monkeyId === 'undefined' || req.body.monkeyId === null) {
        return next();
    }

    const mId = req.body.monkeyId;

    if (!Number.isInteger(mId)) {
        return res.status(400).json({ error: 'A monkeyId formátuma hibás, egész számnak kell lennie!' });
    }

    let foundIndex = -1;
    for (let i = 0; i < monkeys.length; i++) {
        if (monkeys[i].id === mId) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex === -1) {
        return res.status(400).json({ error: `Nem létezik majom ezzel az id-val: ${mId}` });
    }

    res.locals.checkedMonkeyIndex = foundIndex;
    res.locals.checkedMonkeyId = mId;
    next();
};

/*const checkMonkeyId = (req, res, next) => {
    const monkeyId = req.body.monkeyId;
    if (monkeyId === undefined || monkeyId === null) {
        return next();
    }

    if (!Number.isInteger(monkeyId)) {
        return res.status(400).json({ error: 'monkeyId must be an integer' });
    }

    const monkey = monkeys.find(m => m.id === monkeyId);
    if (monkey === undefined) {
        return res.status(400).json({ error: 'Monkey does not exist' });
    }

    res.locals.checkedMonkeyId = monkeyId;
    
    next();
}; */
const checkMonkeyBananaId = (req, res, next) => {
    const monkeyId = res.locals.monkeyId;

    bananas.forEach(banana => {
        if (banana.monkeyId === monkeyId) {
            banana.monkeyId = null;
        }
    });

    next();
};

/*const deleteMonkeyBananas = (req, res, next) => {
    const monkeyID = monkeys[res.locals.monkeyIndex].id;
    bananas = bananas.filter(b => b.monkeyId !== monkeyID);
    next();
};
*/


//monkey
const getMonkeys = (req, res, next) => {
    console.table(monkeys);
    return res.status(200).json(monkeys); 
};

const createMonkey = (req, res, next) => {
    if (typeof req.body.name === 'undefined' || typeof req.body.species === 'undefined') {
        return res.status(400).json({ error: 'Hiányzó név vagy állatfaj!' });
    }

    const newMonkey = {
        id: globalMonkeyId,
        name: req.body.name,
        species: req.body.species
    };

    monkeys.push(newMonkey);
    globalMonkeyId++;
    return res.status(201).json(newMonkey);
};

const getMonkey = (req, res, next) => {
    res.status(200).json(monkeys[res.locals.monkeyIndex]);
};

const deleteMonkey = (req, res, next) => {
    const deletedMonkey = monkeys[res.locals.monkeyIndex];
    monkeys.splice(res.locals.monkeyIndex, 1);
    return res.status(200).json({ deletedMonkey });
};

const updateMonkey = (req, res, next) => {
    const monkey = monkeys[res.locals.monkeyIndex];
    if (typeof req.body.name !== 'undefined') monkey.name = req.body.name;
    if (typeof req.body.species !== 'undefined') monkey.species = req.body.species;
    if ((typeof req.body.name === 'undefined') && (typeof req.body.species === 'undefined')) {
        return res.status(400).json({ error: 'Missing name or species' });
    }
    return res.status(200).json(monkey);
};

const searchMonkeys = (req, res, next) => {
    if (typeof req.body.search === 'undefined') {
        return res.status(400).json({ error: 'Missing search' }); 
    }
    const text = req.body.search.toLowerCase();
    return res.status(200).json(monkeys.filter(m => m.name.toLowerCase().includes(text) || m.species.toLowerCase().includes(text)));
};

// banana 
const getBananas = (req, res, next) => {
    console.table(bananas);
    return res.status(200).json(bananas); 
};

const createBanana = (req, res, next) => {
    const { name, colors, sweet, monkeyId } = req.body;
    if (!name || !colors || sweet === undefined || monkeyId === undefined) {
        return res.status(400).json({ error: 'Hiányzó adatok!' });
    }
    const newBanana = {
        id: globalBananaId++,
        name,
        colors,
        sweet,
        monkeyId: monkeyId === null ? null : parseInt(monkeyId, 10)
    };

    bananas.push(newBanana);
    return res.status(201).json(newBanana);
};

const getBanana = (req, res, next) => {
    res.status(200).json(bananas[res.locals.bananaIndex]);
};

const deleteBanana = (req, res, next) => {
    const deletedBanana = bananas[res.locals.bananaIndex];
    bananas.splice(res.locals.bananaIndex, 1);
    return res.status(200).json({ deletedBanana });
};

const updateBanana = (req, res, next) => {
    const banana = bananas[res.locals.bananaIndex];
    if (typeof req.body.name !== 'undefined') banana.name = req.body.name;
    if (typeof req.body.colors !== 'undefined') banana.colors = req.body.colors;
    if (typeof req.body.sweet !== 'undefined') banana.sweet = req.body.sweet;
    
    if (typeof req.body.monkeyId !== 'undefined') {
        banana.monkeyId = req.body.monkeyId === null ? null : parseInt(req.body.monkeyId, 10);
    }
    
    if (typeof req.body.name === 'undefined' && typeof req.body.colors === 'undefined' && typeof req.body.sweet === 'undefined' && typeof req.body.monkeyId === 'undefined') {
        return res.status(400).json({ error: 'Missing data to update' });
    }
    return res.status(200).json(banana);
};

const searchBananas = (req, res, next) => {
    if (typeof req.body.search === 'undefined') {
        return res.status(400).json({ error: 'Missing search' });
    }
    const text = req.body.search.toLowerCase();
    return res.status(200).json(bananas.filter(b => b.name.toLowerCase().includes(text) || b.colors.toLowerCase().includes(text)));
};

//végpontok
//monkey
app.get('/monkey', getMonkeys);
app.post('/monkey', createMonkey);
app.get('/monkey/:id', getMonkeyIndex, getMonkey);
app.delete('/monkey/:id', getMonkeyIndex, checkMonkeyBananaId, deleteMonkey); 
app.patch('/monkey/:id', getMonkeyIndex, updateMonkey);
app.post('/search', searchMonkeys); 

// banana
app.get('/banana', getBananas);
app.post('/banana', checkMonkeyId, createBanana); 
app.get('/banana/:id', getBananaIndex, getBanana);
app.delete('/banana/:id', getBananaIndex, deleteBanana);
app.patch('/banana/:id', getBananaIndex, checkMonkeyId, updateBanana); 
app.post('/banana/search', searchBananas); 

app.listen(3000, function() {
    console.log(`Server running on http://localhost:3000`);
});
