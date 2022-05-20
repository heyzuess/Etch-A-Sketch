class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    toString() {
        return `{"width": ${this.width}, "height": ${this.height}}`;
    }

    static subtract (size1, size2) {
        return new Size(size1.width - size2.width,
                        size1.height - size2.height);
    }

    static add (size1, size2) {
        return new Size(size1.width + size2.width,
                        size1.height + size2.height);
    }

    static multiply (size1, size2) {
        return new Size(size1.width * size2.width,
                        size1.height * size2.height);
    }

    static divide (size1, size2) {
        return new Size(size1.width / size2.width,
                        size1.height / size2.height);
    }

    static incriment (size) {
        size.width++;
        size.height++;
    }

    static decrement (size) {
        size.width--;
        size.height--;
    }

    static abs (size) {
        return new Size(Math.abs(size.width), Math.abs(size.height));
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
    constructor(gridSize, tileSize, maxSize) {
        this.size = gridSize;
        this.tileSize = tileSize;
        this.tileColor = "#a8acb5";
        this.element = document.getElementById('grid');
        this.class = 'grid-obj';
        this.columns = [];
        this.paint = false;
        this.maxSize = maxSize;
        this.stretch = false;
    }

    clearAll () {
        this.forEachTile(tile => tile.clear());
        this.columns = [];
    }

    clearDrawing () {
        this.forEachTile(tile => tile.element.style.backgroundColor = this.tileColor);
    }

    build () {
        this.clearAll();
        this.stretch ? this.stretchToMax() : this.buildGrid();
    }

    buildGrid () {
        for (let i = 0; i < this.size.width; i++) {
            let col = new Column();

            for (let j = 0; j < this.size.height; j++) {
                let tile = new Tile(new Point(i, j), this.tileSize);
                tile.element.classList.add(this.class);
                tile.element.addEventListener('click', (ev) => this.onTileHover(ev));
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
        ev.target.style.backgroundColor = 'black';
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

    stretchToMax () {
        let tileSize = new Size(this.tileSize.width, this.tileSize.height);
        
        tileSize.width = (this.maxSize.width / this.size.width).toFixed(0);
        tileSize.height = (this.maxSize.height / this.size.height).toFixed(0);

        this.tileSize = tileSize;

        this.buildGrid();
    }

    stretchToClient () {
        this.stretch = true;

        let tempSize = this.stretchToClientSize();
        this.maxSize = tempSize;
        
        this.build();
    }
    
    static clientSize () {
        return new Size(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
                        Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));
    }

    stretchToClientSize () {
        let contentContainer = document.getElementById('content');
        let contentStyle = window.getComputedStyle(contentContainer);
        let contentWidth = (parseInt(contentStyle.paddingLeft.replace("px", "")) ?? 0)
                           +
                           (parseInt(contentStyle.paddingRight.replace("px", "")) ?? 0);
        let contentHeight = (parseInt(contentStyle.paddingTop.replace("px", "")) ?? 0)
                            +
                            (parseInt(contentStyle.paddingBottom.replace("px", "")) ?? 0);
        
        let contentPadding = new Size(contentWidth, contentHeight);

        let mainContainer = document.getElementById('main');
        let mainSize = new Size(mainContainer.offsetWidth, mainContainer.offsetHeight);
        
        let elementSize = new Size(this.element.offsetWidth, this.element.offsetHeight);

        let tempSize = Size.subtract(mainSize, elementSize);;

        tempSize = Size.add(Size.divide(elementSize, new Size(2, 2)), 
                            tempSize);

        contentPadding = Size.multiply(contentPadding, new Size(2, 2));
        tempSize = Size.subtract(tempSize, contentPadding);

        return tempSize;
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
            'tileHeight': 0,
            'stretch': false
        };
        this.elements = elements;
        this.getBuffer();
    }

    getBuffer () {
        this.buffers.gridWidth = this.grid.size.width;
        this.buffers.gridHeight = this.grid.size.height;
        this.buffers.tileWidth = this.grid.tileSize.width;
        this.buffers.tileHeight = this.grid.tileSize.height;
        this.buffers.stretch = this.grid.stretch;

        for (let i in this.buffers) {
            this.elements[i].value = this.buffers[i];

            if (this.elements[i].type === 'checkbox')
            this.elements[i].checked = this.buffers[i];
        }
    }

    hasChanges () {
        for (let i in this.buffers) {
            if (this.elements[i])
            {
                let value = null;
                if (this.elements[i].type === 'number' && this.buffers[i]) {
                    value = parseInt(this.elements[i].value);
                } else
                if (this.elements[i].type === 'checkbox') {
                    value = this.elements[i].checked;
                }

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

        this.grid.size = gridSize;
        this.grid.tileSize = tileSize;
        this.grid.stretch = this.elements.stretch.checked;

        this.grid.build();
        this.getBuffer();
        return true;
    }
}

const modalContainer = document.getElementById("modalContainer");

document.getElementById('exitSettings').addEventListener('click', () => hideSettings());

document.getElementById('settingsButton').addEventListener('click', () => showSettings());

document.getElementById('clearButton').addEventListener('click', () => grid.clearDrawing());

window.addEventListener('click', (ev) => {
    if (ev.target === modalContainer) hideSettings();
});

document.getElementById('saveChanges').addEventListener('click', () => {
    if (!settingsBuffer.hasChanges()) return;
    if (!confirmSettings()) return;

    // Do form validation here
    let gridSize = new Size(settingsBuffer.elements.gridWidth.value,
                            settingsBuffer.elements.gridHeight.value);
    let tileSize = new Size(settingsBuffer.elements.tileWidth.value,
                            settingsBuffer.elements.tileHeight.value);
    let maxSize = settingsBuffer.grid.maxSize;
    let stretch = settingsBuffer.elements.stretch.checked;

    /* Dont allow grid size over 100 x 100 */
    if (gridSize.width > 100 || gridSize.height > 100) {
        window.alert(`Grid Size ${gridSize.width} x ${gridSize.height} can not ` +
                     `exceed 100 x 100.\nPlease try a different size.`);
        return;
    }
    /* End */

    /* Check grid size */ 
    let tempSize = Grid.estimateSize(gridSize, tileSize);

    if ((tempSize.width > maxSize.width || tempSize.height > maxSize.height) && !stretch) {
        window.alert(`Total Size ${tempSize.width} x ${tempSize.height} can not ` + 
                     `exceed ${maxSize.width} x ${maxSize.height}.` +
                     `\nPlease try a different size.`);
        return;
    }
    /* End - Check grid size */

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

let maxSize = new Size(600, 600);
let grid = new Grid(new Size(50, 50), new Size(10, 10), maxSize);
grid.stretch = true;

grid.build();
grid.stretchToClient();

let settingsElements = {
    'gridWidth': document.getElementById('gridWidth'),
    'gridHeight': document.getElementById('gridHeight'),
    'tileWidth': document.getElementById('tileWidth'),
    'tileHeight': document.getElementById('tileHeight'),
    'stretch': document.getElementById('stretch')
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
    let overMax = tempSize.width > grid.maxSize.width || tempSize.height > grid.maxSize.height;
    summary.style.backgroundColor =  overMax ? "red" : "black";
    summary.style.color = overMax ? "white": "grey";
}