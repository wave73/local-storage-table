class Table {
  constructor(options) {
    this.table = options.elem;
    this.clearButton = options.clear;
    this.onClickHandler();
    this.onClearHandler();
  }

  onClickHandler() {
    this.table.addEventListener('click', (event) => {
      let currentTarget = event.target;
    
      while (currentTarget !== mainTable) {
        if (currentTarget.tagName === 'TD' && currentTarget.tagName !== 'BUTTON') {
          this.editRowCell(currentTarget);
          return;
        } 
        currentTarget = currentTarget.parentNode;
      }
    })
  }

  onClearHandler() {
    this.clearButton.addEventListener('click', () => {
      this.clearTable();
    })
  }

  createRow(inputsData, id) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const deleteButton = document.createElement('button');
  
    for (let i = 0; i < inputsData.length; i += 1) {
      const cell = document.createElement('td');
      const span = document.createElement('span');
  
      if (inputsData instanceof Array) {
        span.textContent = inputsData[i];
      } else {
        span.textContent = inputsData[i].value;
      }
      
      span.setAttribute('class', 'cell');
      span.setAttribute('draggable', 'true');
      cell.appendChild(span);
      row.appendChild(cell);
    }
  
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute('class', 'delete-btn');
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const currentRow = event.target.parentNode.parentNode;
      this.deleteRow(currentRow);
    });
  
    cell.appendChild(deleteButton);
    row.appendChild(cell);
    row.dataset.id = id;
    this.table.appendChild(row);
    this._addRowToLocalStorage(inputsData, id);
  }

  _addRowToLocalStorage(inputsData, id) {
    const rows = JSON.parse(localStorage.getItem('rows'));
    const data = [];
  
    for (let i = 0; i < inputsData.length; i += 1) {
      data.push(inputsData[i].value || '');
    }
    rows.push({ id, data: [...data] });
    localStorage.setItem('rows', JSON.stringify(rows));
  }

  editRowCell(currentCell) {
    const input = document.createElement('input');
    const span = document.createElement('span');
    
    input.value = currentCell.textContent.trim();
    currentCell.innerHTML = '';
    currentCell.appendChild(input);
  
    input.focus();

    input.onclick = function(event) {
      event.stopPropagation();
    }
    
    input.onblur = (event) => {
      span.textContent = event.target.value;
      currentCell.removeChild(event.target);
      currentCell.appendChild(span);
  
      this._editRowInLocalStorage(currentCell.parentNode);
    }
  
    input.onkeydown = function(event) {
      if (event.keyCode === 13) {
        event.target.blur();
      }
    }
  }

  _editRowInLocalStorage(currentRow) {
    const id = +currentRow.dataset.id;
    const spans = currentRow.querySelectorAll('span');
  
    const newData = [];
    for (let i = 0; i < spans.length; i += 1) {
      newData.push(spans[i].textContent.trim());
    }
  
    const rows = JSON.parse(localStorage.getItem('rows'));
  
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].id === id) {
        rows[i].data = newData;
        break;
      }
    }
  
    localStorage.setItem('rows', JSON.stringify(rows));
  }

  deleteRow(currentRow) {
    this._deleteRowFromLocalStorage(+currentRow.dataset.id);
    currentRow.parentNode.removeChild(currentRow);
  }

  _deleteRowFromLocalStorage(id) {
    const rows = JSON.parse(localStorage.getItem('rows'));
    const newRows = rows.filter(row => row.id !== id);
    localStorage.setItem('rows', JSON.stringify(newRows));
  }

  updateTable() {
    mainTable.innerHTML = '';
    const rows = JSON.parse(localStorage.getItem('rows'));
  
    for (let i = 0; i < rows.length; i += 1) {
      this.createRow(rows[i].data, rows[i].id);
    }
  }

  clearTable() {
    this.table.innerHTML = '';
    localStorage.setItem('rows', '[]');
  }

  enableDrugnDrop() {
    
  }
}

class NewRowForm {
  constructor(options) {
    this.form = options.elem;
    this.onSubmitHandler();
  }

  onSubmitHandler() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = Math.floor(Math.random() * 1234234 + 7 / 117);
      const inputsData = event.target.querySelectorAll('input');
      mainTable.createRow(inputsData, id);

      this.clearFormInputs(event.target);
    });
  }

  clearFormInputs(target) {
    const inputs = target.querySelectorAll('input');
  
    for (let i = 0; i < inputs.length; i += 1) {
      inputs[i].value = '';
    }
  }
}

const mainTable = new Table({ 
  elem: document.querySelector('.main-table'),
  clear: document.querySelector('.clear-all-btn'),
});

const form = new NewRowForm({ 
  elem: document.querySelector('#new-row-form'),
});

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('rows') === null) {
    localStorage.setItem('rows', '[]');
  }
  mainTable.updateTable();
});
