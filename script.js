class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    toString() {
        return `{"width": ${this.width}, "height": ${this.height}}`;
    }
}

class Point {
    constructor(col, row) {
        this.col = col;
        this.row = row;
    }

    toString() {
        return `{"col": ${this.col}, "row": ${this.row}}`;
    }
}

class Grid {
    constructor(gridSize, tileSize) {
        this.size = gridSize;
        this.tileSize = tileSize;
        this.element = document.getElementById('grid');
        this.class = 'grid-obj';
        this.columns = [];
        this.paint = false;
    }

    clearAll () {
        this.forEachTile(tile => tile.clear());
    }

    clearDrawing () {
        this.forEachTile(tile => tile.element.style.backgroundColor = 'white');
    }

    buildGrid () {
        for (let i = 0; i < this.size.width; i++) {
            let col = new Column();

            for (let j = 0; j < this.size.height; j++) {
                let tile = new Tile(new Point(i, j), this.tileSize);
                tile.element.classList.add(this.class);
                tile.element.addEventListener('mouseover', (ev) => this.onTileHover(ev));

                col.element.append(tile.element);
                col.tiles.push(tile);
            }

            this.element.append(col.element);
            this.columns.push(col);
        }

        window.addEventListener('mousedown', ev => this.paint = true);
        window.addEventListener('mouseup', ev => this.paint = false);
        window.addEventListener('touchstart', ev => this.paint = true);
        window.addEventListener('touchend', ev => this.paint = false);
    }

    forEachTile (callback) {
        this.columns.forEach(col => {
            col.tiles.forEach(tile => callback(tile));
        });
    }

    tile (pos) {
        if (pos.col > this.width || pos.col < 0 ||
            pos.row > this.height || pos.row < 0) return null;
        return this.columns[pos.col].tiles[pos.row];
    }

    onTileHover (ev) {
        if (!this.paint) return;
        ev.target.style.backgroundColor = 'blue';
    }

    actualSize() {
        let tileSize = this.columns[0].tiles[0].size;
        return new Size(this.size.width * tileSize.width,
                        this.size.height * tileSize.height);
    }

    // Tile will not be created yet when determining new grid size
    static estimateSize(gridSize, tileSize) {
        return new Size(gridSize.width * tileSize.width,
                        gridSize.height * tileSize.height);
    }
}

class Column {
    constructor () {
        this.tiles = [];
        this.element = document.createElement('div');

        this.element.classList.add(this.class);
        this.element.classList.add('container');
        this.element.classList.add('grid-col');
    }
}

class Tile {
    constructor (tilePosition, tileSize) {
        this.position = tilePosition;
        this.size = tileSize;
        this.element = document.createElement('div');
        this.element.classList.add('grid-tile');
        this.borderSize = new Size(1, 1);

        let leftWidthStyle = `${(this.size.width / 2) - this.borderSize.width}px`;
        let topHeightStyle = `${(this.size.height / 2) - this.borderSize.height}px`;

        let ifSizeIsOdd = (length) => length % 2 > 0 ? (length / 2) - 1 : length / 2;
        let rightWidthStyle = `${ifSizeIsOdd(this.size.width) - this.borderSize.width}px`;
        let bottomHeightStyle = `${ifSizeIsOdd(this.size.height) - this.borderSize.height}px`;

        this.element.style.padding = `${topHeightStyle} ${leftWidthStyle} ${bottomHeightStyle} ${rightWidthStyle}`;
    }

    clear() {
        this.element.remove();
    }
}

class Settings {
    constructor (grid, elements) {
        this.grid = grid;
        this.buffers = {
            'gridWidth': 0,
            'gridHeight': 0,
            'tileWidth': 0,
            'tileHeight': 0
        };
        this.elements = elements;
        this.getBuffer();
    }

    getBuffer () {
        this.buffers.gridWidth = this.grid.size.width;
        this.buffers.gridHeight = this.grid.size.height;
        this.buffers.tileWidth = this.grid.tileSize.width;
        this.buffers.tileHeight = this.grid.tileSize.height;

        for (let i in this.buffers) {
            this.elements[i].value = this.buffers[i];
        }
    }

    hasChanges () {
        for (let i in this.buffers) {
            if (this.elements[i] && this.buffers[i])
            {
                let value = parseInt(this.elements[i].value);
                if (value !== this.buffers[i]) return i;
            }
        }
        return null;
    }

    discardChanges() {
        for (let i in this.buffers) {
            if (this.elements[i] && this.buffers[i])
                this.elements[i].value = this.buffers[i];
        }
    }

    applyChanges () {
        let temp = null;
        let gridSize = new Size(this.elements.gridWidth.value,
                                this.elements.gridHeight.value);
        let tileSize = new Size(this.elements.tileWidth.value,
                                this.elements.tileHeight.value);
        
        let tempSize = Grid.estimateSize(gridSize, tileSize);

        if (tempSize.width > 960 || tempSize.height > 960) {
            window.alert(`Grid Size ${tempSize.width} x ${tempSize.height} can not exceed 960 x 960.\nPlease try a different size.`);
            return false;
        }

        temp = new Grid(gridSize, tileSize);
        if (!temp) return false;

        this.grid.clearAll();
        this.grid = temp;
        this.grid.buildGrid();

        this.getBuffer();
        return true;
    }
}

const modalContainer = document.getElementById("modalContainer");

document.getElementById('exitSettings').addEventListener('click', () => hideSettings());

document.getElementById('settingsButton').addEventListener('click', () => showSettings());

document.getElementById('clearButton').addEventListener('click', () => settingsBuffer.grid.clearDrawing());

window.addEventListener('click', (ev) => {
    if (ev.target === modalContainer) hideSettings();
});

document.getElementById('saveChanges').addEventListener('click', () => {
    if (settingsBuffer.hasChanges() && !confirmSettings()) return;

    if (settingsBuffer.applyChanges()) hideSettings();
});

document.getElementById('discardChanges').addEventListener('click', () => {
    if (settingsBuffer.hasChanges() && confirm('Are you sure you want to discard changes?'))
        settingsBuffer.discardChanges();
    hideSettings();
});

let elements = document.getElementsByClassName('formContent');

for (let element of elements) {
    element.addEventListener('input', () => updateSummary());
}

let grid = new Grid(new Size(20, 20), new Size(10, 10));
grid.clearAll();
grid.buildGrid();

let settingsElements = {
    'gridWidth': document.getElementById('gridWidth'),
    'gridHeight': document.getElementById('gridHeight'),
    'tileWidth': document.getElementById('tileWidth'),
    'tileHeight': document.getElementById('tileHeight')
};

let settingsBuffer = new Settings(grid, settingsElements);

function showSettings () {
    updateSummary();
    modalContainer.style.display = 'block';
}

function hideSettings () {
    settingsBuffer.discardChanges();
    modalContainer.style.display = 'none';
}

function confirmSettings () {
    return confirm('Changes will reset grid, do you want to continue?');
}

function updateSummary () {
    let gridSize = new Size(0, 0);
    let tileSize = new Size(0, 0);

    let elements = document.getElementsByClassName('formField');

    for (let element of elements) {
        switch (element.id) {
            case 'gridWidth':
                gridSize.width = element.value;
                break;
            case 'gridHeight':
                gridSize.height = element.value;
                break;
            case 'tileWidth':
                tileSize.width = element.value;
                break;
            case 'tileHeight':
                tileSize.height = element.value;
                break;
        }
    }

    let estimate = document.getElementById('estimateSize');
    let summary = document.getElementById('summary');
    let tempSize = Grid.estimateSize(gridSize, tileSize);
    estimate.innerHTML = `${tempSize.width} x ${tempSize.height}`;
    let overMax = tempSize.width > 960 || tempSize.height > 960;
    summary.style.backgroundColor =  overMax ? "red" : "black";
    summary.style.color = overMax ? "white": "grey";
}