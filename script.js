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
        if (!currentTarget) return;
        if (currentTarget.tagName === 'TD' && currentTarget.children[0].tagName !== 'BUTTON') {
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
      
      cell.appendChild(span);
      row.appendChild(cell);
    }

    row.setAttribute('class', 'row');
    row.setAttribute('draggable', 'true');
  
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
    this.table.innerHTML = '';
    const rows = JSON.parse(localStorage.getItem('rows'));
  
    for (let i = 0; i < rows.length; i += 1) {
      this.createRow(rows[i].data, rows[i].id);
    }

    this.enableDrugAndDrop();
  }

  clearTable() {
    this.table.innerHTML = '';
    localStorage.setItem('rows', '[]');
  }

  enableDrugAndDrop() {
    let dragSrcEl = null;
    let dropSrcEl = null;

    const changeRowsInLocalStorage = (dragSrcEl, dropSrcEl) => {
      const dragRowId = +dragSrcEl.dataset.id;
      const dropRowId = +dropSrcEl.dataset.id;
      const dragSpan = dragSrcEl.querySelectorAll('span');
      const dropSpan = dropSrcEl.querySelectorAll('span');

      const rows = JSON.parse(localStorage.getItem('rows'));

      for (let i = 0; i < rows.length; i += 1) {
        if (rows[i].id === dragRowId) {
          rows[i].data[0] = dragSpan[0].innerHTML;
          rows[i].data[1] = dragSpan[1].innerHTML;
          rows[i].data[2] = dragSpan[2].innerHTML;
        }

        if (rows[i].id === dropRowId) {
          rows[i].data[0] = dropSpan[0].innerHTML;
          rows[i].data[1] = dropSpan[1].innerHTML;
          rows[i].data[2] = dropSpan[2].innerHTML;
        }
      }

      localStorage.setItem('rows', JSON.stringify(rows));
      this.updateTable();
    }

    function handleDragStart(e) {
      dragSrcEl = this;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    }
    
    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'move'; 
      return false;
    }

    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
    
      if (dragSrcEl != this) {
        dropSrcEl = this;
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
        changeRowsInLocalStorage(dragSrcEl, dropSrcEl);
      }
    
      return false;
    }
    
    var rows = document.querySelectorAll('.row');
    [].forEach.call(rows, (row) => {
      row.addEventListener('dragstart', handleDragStart, false);
      row.addEventListener('dragover', handleDragOver, false);
      row.addEventListener('drop', handleDrop, false);
    });
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
      
      mainTable._addRowToLocalStorage(inputsData, id);
      mainTable.updateTable();

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