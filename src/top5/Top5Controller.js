/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            if(!(this.model.hasCurrentList())) {
                let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.view.clearWorkspace();
            this.model.unselectAll();
            this.model.currentList = null;
            let statusbar = document.getElementById("top5-statusbar");
            statusbar.innerHTML = "";
            this.model.view.updateToolbarButtons(this.model);
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);
            
            item.ondragover = (ev) => {
                ev.preventDefault();
            }
            
            item.ondragstart = (ev) => {
                ev.dataTransfer.setData("text", ev.target.id);
            }
            
            item.ondrop = (ev) => {
                ev.preventDefault();
                var data = ev.dataTransfer.getData("text");
                let oldId = parseInt(data.substring(5));
                let newId = parseInt(item.id.substring(5));
                oldId--;
                newId--;
                this.model.addMoveItemTransaction(oldId, newId);
                this.model.view.updateToolbarButtons(this.model);
            }
            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);
                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            this.model.view.updateToolbarButtons(this.model);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.addChangeItemTransaction(i-1, event.target.value);
                        this.model.view.updateToolbarButtons(this.model);
                    }
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        document.getElementById("top5-list-" + id).onmouseenter = (event) => {
            let top5List = document.getElementById("top5-list-" + id);
            if (top5List.classList.contains("selected-list-card")) {
            }
            else {
                this.model.view.hoverHighlightList(id);
            }
            
        }
        document.getElementById("top5-list-" + id).onmouseleave = (event) => {
            let top5List = document.getElementById("top5-list-" + id);
            if (top5List.classList.contains("selected-list-card")) {
            }
            else {
                this.model.view.hoverUnhighlightList(id);
            }
        }
        
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
            this.model.loadList(id);
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
            var confirmButton = document.getElementById("dialog-confirm-button");
            var cancelButton = document.getElementById("dialog-cancel-button");
            confirmButton.onmousedown = (event) => {
                modal.classList.remove("is-visible");
                this.model.deleteList(id);
                this.model.view.updateToolbarButtons(this.model);
            }
            cancelButton.onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        }

        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            let top5List = document.getElementById("top5-list-" + id);
            let textInput = document.createElement("input");
            let currentList = this.model.currentList;
            top5List.innerHTML = "";
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "top5-list-text-input-" + id);
            textInput.setAttribute("value", this.model.currentList.getName());
            top5List.appendChild(textInput);
            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    currentList.setName(event.target.value);
                    currentList = event.target.value;
                    top5List.innerHTML = "";
                    top5List.appendChild(document.createTextNode(this.model.currentList));
                    this.model.sortLists();
                    this.model.saveLists();
                    this.model.unselectAll();
                    this.model.loadList(id);
                }
            }
            textInput.onblur = (event) => {
                currentList.setName(event.target.value);
                currentList = event.target.value;
                console.log(event.target.value);
                top5List.innerHTML = "";
                top5List.appendChild(document.createTextNode(this.model.currentList));
                this.model.sortLists();
                this.model.saveLists();
                this.model.unselectAll();
                this.model.loadList(id);
            }            
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}