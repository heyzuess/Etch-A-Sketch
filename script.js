class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

class Point {
    constructor(col, row) {
        this.col = col;
        this.row = row;
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

    onTileHover (ev) {
        if (!this.paint) return;
        ev.target.style.backgroundColor = 'blue';
    }

    actualSize() {
        let tileActualSize = this.columns[0].tiles[0].actualSize();
        return new Size(this.size.width * tileActualSize.width,
                        this.size.height * tileActualSize.height);
    }

    // Assuming the .grid-tile css still has a 1px solid border
    // This is needed because the tile will not be created yet
    // when determining new gride size
    static guessSize(gridSize, tileSize, borderSize) {
        let tileGuessSize = Tile.guessSize(tileSize, borderSize);
        return new Size(gridSize.width * tileGuessSize.width,
                        gridSize.height * tileGuessSize.height);
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

        let widthStyle = `${this.size.width}px`;
        let heightStyle = `${this.size.height}px`;
        this.element.style.padding = `${heightStyle} ${widthStyle} ${heightStyle} ${widthStyle}`;
    }

    clear() {
        this.element.remove();
    }

    actualSize () {
        let borderSize = this.borderSize();
        let width = (this.size.width * 2) + borderSize.width;
        let height = (this.size.height * 2) + borderSize.height;
        return new Size(width, height);
    }

    // Assuming the .grid-tile css still has a 1px solid border
    // This is needed because the tile will not be created yet
    // when determining new gride size
    static guessSize(tileSize, borderSize) {
        return new Size((tileSize.width * 2) + (borderSize.width * 2),
                        (tileSize.height * 2) + (borderSize.height * 2));
    }

    borderSize () {
        let style = element => window.getComputedStyle(element);
        let borderLeftWidth = style(this.element).borderLeftWidth.replace("px", "");
        let borderRightWidth = style(this.element).borderRightWidth.replace("px", "");
        let borderTopWidth = style(this.element).borderTopWidth.replace("px", "");
        let borderBottomWidth = style(this.element).borderBottomWidth.replace("px", "");

        let borderSizeWidth = (borderLeftWidth && borderLeftWidth !== "" ?
                                parseInt(borderLeftWidth) ?? 0
                                :
                                0)
                              +
                              (borderRightWidth && borderRightWidth !== "" ?
                                parseInt(borderRightWidth) ?? 0
                                :
                                0);
        let borderSizeHeight = (borderTopWidth && borderTopWidth !== "" ?
                                 parseInt(borderTopWidth) ?? 0
                                 :
                                 0)
                               +
                               (borderBottomWidth && borderBottomWidth !== "" ?
                                 parseInt(borderBottomWidth) ?? 0
                                 :
                                 0);
        
        return new Size(borderSizeWidth, borderSizeHeight);
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
        
        let tempSize = Grid.guessSize(gridSize, tileSize, new Size(1, 1));

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
    let tempSize = Grid.guessSize(gridSize, tileSize, new Size(1, 1));
    estimate.innerHTML = `${tempSize.width} x ${tempSize.height}`;
    let overMax = tempSize.width > 960 || tempSize.height > 960;
    summary.style.backgroundColor =  overMax ? "red" : "black";
    summary.style.color = overMax ? "white": "grey";
}