import * as UI from './UI.js';

let DB; // Database global variable

document.addEventListener('DOMContentLoaded', () => {
    let AppointmentDB = window.indexedDB.open('appointments', 1);
    AppointmentDB.onerror = () => {
        console.log("Could Not Create Database !");
    }
    AppointmentDB.onsuccess = () => {
        console.log("Database Created ! And Ready To Use !");
        DB = AppointmentDB.result;
        printAllAppointments();
        // console.log(DB);
    }

    // creating schemas
    AppointmentDB.onupgradeneeded = e => {
        let db = e.target.result;
        let objectstore = db.createObjectStore('appointments', { keyPath: 'key', autoIncrement: true });
        objectstore.createIndex('petname', 'petname', { unique: false });
        objectstore.createIndex('ownername', 'ownername', { unique: false });
        objectstore.createIndex('phone', 'phone', { unique: false });
        objectstore.createIndex('date', 'date', { unique: false });
        objectstore.createIndex('hour', 'hour', { unique: false });
        objectstore.createIndex('symptoms', 'symptoms', { unique: false });
    }

});

UI.form.addEventListener('submit', e => {
    e.preventDefault();

    if (UI.petname.value != '' && UI.ownername.value != '' && UI.phone.value != '' && UI.date.value != '' && 'hour' != '' && UI.symptoms.value != '') {
        let newAppointment = {
            petname: UI.petname.value,
            ownername: UI.ownername.value,
            phone: UI.phone.value,
            date: UI.date.value,
            hour: UI.hour.value,
            symptoms: UI.symptoms.value
        }

        // insertting the newAppointment object into the database

        let transection = DB.transaction(['appointments'], 'readwrite');
        let objectstore = transection.objectStore('appointments');
        let request = objectstore.add(newAppointment);
        request.onsuccess = () => {
            UI.form.reset();
        }

        transection.oncomplete = () => {
            console.log("New Appointment to database successfully !");
            printAllAppointments();
        }
        transection.onerror = () => {
            console.log("Could not add data to database");
            printAllAppointments();
        }
    }
});

function printAllAppointments() {

    while (UI.appointments.firstChild) {
        UI.appointments.removeChild(UI.appointments.firstChild);
    }
    let objectstore = DB.transaction('appointments').objectStore('appointments');
    objectstore.openCursor().onsuccess = e => {
        let cursor = e.target.result;
        if (cursor) {
            let li = document.createElement('li');
            li.setAttribute('data-appoiment-id', cursor.value.key);
            li.classList.add('list-group-item');
            li.innerHTML = `
                <p class="font-weight-bold">Petname: <span class="font-weight-normal">${cursor.value.petname}</span><p>
                <p class="font-weight-bold">Ownername: <span class="font-weight-normal">${cursor.value.ownername}</span><p>
                <p class="font-weight-bold">Phone: <span class="font-weight-normal">${cursor.value.phone}</span><p>
                <p class="font-weight-bold">Date: <span class="font-weight-normal">${cursor.value.date}</span><p>
                <p class="font-weight-bold">Hour: <span class="font-weight-normal">${cursor.value.hour}</span><p>
                <p class="font-weight-bold">Symptoms: <span class="font-weight-normal">${cursor.value.symptoms}</span><p>
                `;

            let removeBtn = document.createElement('button');
            removeBtn.classList = "btn btn-danger";
            removeBtn.onclick = removeThisAppointment;
            removeBtn.innerHTML = "Remove";

            li.appendChild(removeBtn);

            UI.appointments.appendChild(li);
            cursor.continue();
        } else {
            if (!UI.appointments.firstChild) {
                UI.appointmenttitle.innerHTML = "Add new appointment";
            } else {
                UI.appointmenttitle.innerHTML = "Manage your appointment";
            }
        }


    }

}

function removeThisAppointment(e) {
    let thisAppointment = e.target.parentElement;

    let transaction = DB.transaction(['appointments'], 'readwrite');
    let objectstore = transaction.objectStore('appointments');
    objectstore.delete(Number(thisAppointment.getAttribute('data-appoiment-id')));

    transaction.oncomplete = () => {
        thisAppointment.remove();
        if (!UI.appointments.firstChild) {
            UI.appointmenttitle.innerHTML = "Add new appointment";
        } else {
            UI.appointmenttitle.innerHTML = "Manage your appointment";
        }
    }
}