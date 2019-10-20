/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
  constructor() {
    this.docket = JSON.parse(localStorage.getItem("dockets")) || [];
  }

  bindDocketChanged(callback) {
    this.onDocketChanged = callback;
  }

  _commit(dockets) {
    this.onDocketChanged(dockets);
    localStorage.setItem("dockets", JSON.stringify(dockets));
  }

  addDocket(docketText) {
    const docket = {
      id:
        this.dockets.length > 0
          ? this.dockets[this.dockets.length - 1].id + 1
          : 1,
      text: docketText,
      complete: false
    };

    this.dockets.push(docket);

    this._commit(this.dockets);
  }

  editDocket(id, updatedText) {
    this.dockets = this.dockets.map(docket =>
      docket.id === id
        ? { id: docket.id, text: updatedText, complete: docket.complete }
        : docket
    );

    this._commit(this.dockets);
  }

  deleteDocket(id) {
    this.dockets = this.dockets.filter(docket => docket.id !== id);

    this._commit(this.dockets);
  }

  toggleDocket(id) {
    this.dockets = this.dockets.map(docket =>
      docket.id === id
        ? { id: docket.id, text: docket.text, complete: !docket.complete }
        : docket
    );

    this._commit(this.dockets);
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.app = this.getElement("#root");
    this.form = this.createElement("form");
    this.input = this.createElement("input");
    this.input.type = "text";
    this.input.placeholder = "Add docket";
    this.input.name = "docket";
    this.submitButton = this.createElement("button");
    this.submitButton.textContent = "Submit";
    this.form.append(this.input, this.submitButton);
    this.title = this.createElement("h1");
    this.title.textContent = "dockets";
    this.docketList = this.createElement("ul", "docket-list");
    this.app.append(this.title, this.form, this.docketList);

    this._temporarydocketText = "";
    this._initLocalListeners();
  }

  get _docketText() {
    return this.input.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  displayDockets(dockets) {
    // Delete all nodes
    while (this.docketList.firstChild) {
      this.docketList.removeChild(this.docketList.firstChild);
    }

    // Show default message
    if (dockets.length === 0) {
      const p = this.createElement("p");
      p.textContent = "Nothing to do! Add a task?";
      this.docketList.append(p);
    } else {
      // Create nodes
      dockets.forEach(docket => {
        const li = this.createElement("li");
        li.id = docket.id;

        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = docket.complete;

        const span = this.createElement("span");
        span.contentEditable = true;
        span.classList.add("editable");

        if (docket.complete) {
          const strike = this.createElement("s");
          strike.textContent = docket.text;
          span.append(strike);
        } else {
          span.textContent = docket.text;
        }

        const deleteButton = this.createElement("button", "delete");
        deleteButton.textContent = "Delete";
        li.append(checkbox, span, deleteButton);

        // Append nodes
        this.docketList.append(li);
      });
    }

    // Debugging
    console.log(dockets);
  }

  _initLocalListeners() {
    this.docketList.addEventListener("input", event => {
      if (event.target.className === "editable") {
        this._temporarydocketText = event.target.innerText;
      }
    });
  }

  bindAddDocket(handler) {
    this.form.addEventListener("submit", event => {
      event.preventDefault();

      if (this._docketText) {
        handler(this._docketText);
        this._resetInput();
      }
    });
  }

  bindDeleteDocket(handler) {
    this.docketList.addEventListener("click", event => {
      if (event.target.className === "delete") {
        const id = parseInt(event.target.parentElement.id);

        handler(id);
      }
    });
  }

  bindEditDocket(handler) {
    this.docketList.addEventListener("focusout", event => {
      if (this._temporaryDocketText) {
        const id = parseInt(event.target.parentElement.id);

        handler(id, this._temporaryDocketText);
        this._temporarydocketText = "";
      }
    });
  }

  bindToggleDocket(handler) {
    this.docketList.addEventListener("change", event => {
      if (event.target.type === "checkbox") {
        const id = parseInt(event.target.parentElement.id);

        handler(id);
      }
    });
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindDocketListChanged(this.onDocketListChanged);
    this.view.bindAddDocket(this.handleAddDocket);
    this.view.bindEditDocket(this.handleEditDocket);
    this.view.bindDeleteDocket(this.handleDeleteDocket);
    this.view.bindToggleDocket(this.handleToggleDocket);

    // Display initial dockets
    this.onDocketListChanged(this.model.dockets);
  }

  onDocketListChanged = dockets => {
    this.view.displayDockets(dockets);
  };

  handleAddDocket = docketText => {
    this.model.addDocket(docketText);
  };

  handleEditDocket = (id, docketText) => {
    this.model.editDocket(id, docketText);
  };

  handleDeleteDocket = id => {
    this.model.deleteDocket(id);
  };

  handleToggleDocket = id => {
    this.model.toggleDocket(id);
  };
}

const app = new Controller(new Model(), new View());
